package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"

	"github.com/kleffio/www/user-service/internal/adapters/in/http/dto"
	authdomain "github.com/kleffio/www/user-service/internal/core/domain/auth"
	userdomain "github.com/kleffio/www/user-service/internal/core/domain/users"
	authsvc "github.com/kleffio/www/user-service/internal/core/service/auth"
)

type AuthHandler struct {
	authSvc          AuthService
	authentikBaseURL string
	applicationSlug  string
}

type AuthService interface {
	CreateSession(ctx context.Context, tokens *authdomain.OAuthTokenResponse) (string, error)
	GetUserFromSession(ctx context.Context, sessionID string) (*userdomain.User, error)
	RefreshSession(ctx context.Context, sessionID string) error
	DeleteSession(ctx context.Context, sessionID string) error
	GetSessionTokens(ctx context.Context, sessionID string) (*authdomain.OAuthTokenResponse, error)
}

func NewAuthHandler(authSvc AuthService, authentikBaseURL string, applicationSlug string) *AuthHandler {
	return &AuthHandler{
		authSvc:          authSvc,
		authentikBaseURL: authentikBaseURL,
		applicationSlug:  applicationSlug,
	}
}

// HandleOAuthCallback handles the OAuth callback and creates a session
func (h *AuthHandler) HandleOAuthCallback(w http.ResponseWriter, r *http.Request) {
	var req dto.CallbackRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		dto.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.AccessToken == "" {
		dto.WriteError(w, http.StatusBadRequest, "missing access_token")
		return
	}

	tokens := &authdomain.OAuthTokenResponse{
		AccessToken:  req.AccessToken,
		RefreshToken: req.RefreshToken,
		IDToken:      req.IDToken,
		ExpiresIn:    req.ExpiresIn,
	}

	sessionID, err := h.authSvc.CreateSession(r.Context(), tokens)
	if err != nil {
		log.Printf("failed to create session: %v", err)
		dto.WriteError(w, http.StatusInternalServerError, "failed to create session")
		return
	}

	// Set session cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
		Secure:   true, // TODO: make configurable
		SameSite: http.SameSiteLaxMode,
		MaxAge:   86400,
	})

	dto.WriteJSON(w, http.StatusOK, dto.SessionResponse{SessionID: sessionID})
}

// GetMeWithSession gets current user using session cookie
func (h *AuthHandler) GetMeWithSession(w http.ResponseWriter, r *http.Request) {
	sessionID, err := extractSessionID(r)
	if err != nil {
		dto.WriteError(w, http.StatusUnauthorized, "missing or invalid session")
		return
	}

	user, err := h.authSvc.GetUserFromSession(r.Context(), sessionID)
	if err != nil {
		if errors.Is(err, authsvc.ErrInvalidSession) || errors.Is(err, authsvc.ErrNoSession) {
			dto.WriteError(w, http.StatusUnauthorized, "invalid or expired session")
			return
		}
		log.Printf("error getting user from session: %v", err)
		dto.WriteError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	dto.WriteJSON(w, http.StatusOK, user)
}

// RefreshSession manually refreshes the session tokens
func (h *AuthHandler) RefreshSession(w http.ResponseWriter, r *http.Request) {
	sessionID, err := extractSessionID(r)
	if err != nil {
		dto.WriteError(w, http.StatusUnauthorized, "missing or invalid session")
		return
	}

	if err := h.authSvc.RefreshSession(r.Context(), sessionID); err != nil {
		if errors.Is(err, authsvc.ErrNoSession) {
			dto.WriteError(w, http.StatusUnauthorized, "invalid session")
			return
		}
		if errors.Is(err, authsvc.ErrTokenRefreshFail) {
			dto.WriteError(w, http.StatusUnauthorized, "failed to refresh token")
			return
		}
		log.Printf("error refreshing session: %v", err)
		dto.WriteError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	dto.WriteJSON(w, http.StatusOK, map[string]string{"status": "refreshed"})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	log.Println("🚪 Logout endpoint called")

	sessionID, err := extractSessionID(r)
	log.Printf("Session ID: %s, Error: %v", sessionID, err)

	var idToken string
	if err == nil {
		tokens, tokenErr := h.authSvc.GetSessionTokens(r.Context(), sessionID)
		if tokenErr == nil && tokens != nil {
			idToken = tokens.IDToken
			log.Printf("✅ ID token found (length: %d)", len(idToken))
		} else {
			log.Printf("⚠️  No tokens: %v", tokenErr)
		}

		if err := h.authSvc.DeleteSession(r.Context(), sessionID); err != nil {
			log.Printf("error deleting session: %v", err)
		} else {
			log.Printf("deleted session: session_id=%s", sessionID)
		}
	} else {
		log.Printf("⚠️  No session found: %v", err)
	}

	clearSessionCookie(w)

	if idToken != "" {
		origin := r.Header.Get("Origin")
		if origin == "" {
			referer := r.Header.Get("Referer")
			if referer != "" {
				if u, err := url.Parse(referer); err == nil {
					origin = fmt.Sprintf("%s://%s", u.Scheme, u.Host)
				}
			}
		}
		if origin == "" {
			origin = "https://kleff.io"
		}

		logoutURL := fmt.Sprintf(
			"%s/application/o/%s/end-session/?id_token_hint=%s&post_logout_redirect_uri=%s",
			h.authentikBaseURL,
			h.applicationSlug,
			url.QueryEscape(idToken),
			url.QueryEscape(origin),
		)

		dto.WriteJSON(w, http.StatusOK, map[string]string{
			"status":     "logged_out",
			"logout_url": logoutURL,
		})
		return
	}

	dto.WriteJSON(w, http.StatusOK, map[string]string{"status": "logged_out"})
}

// Helper functions

func extractSessionID(r *http.Request) (string, error) {
	cookie, err := r.Cookie("session_id")
	if err == nil && cookie.Value != "" {
		return cookie.Value, nil
	}

	sessionID := r.Header.Get("X-Session-ID")
	if sessionID == "" {
		return "", errors.New("no session found")
	}

	return sessionID, nil
}

func clearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})
}
