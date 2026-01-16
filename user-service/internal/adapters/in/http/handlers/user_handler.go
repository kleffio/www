package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/kleffio/www/user-service/internal/adapters/in/http/dto"
	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
	coresvc "github.com/kleffio/www/user-service/internal/core/service/users"
)

type UserHandler struct {
	svc UserService
}

type UserService interface {
	Get(ctx context.Context, id domain.ID) (*domain.User, error)
	GetMe(ctx context.Context, bearerToken string) (*domain.User, error)
	GetByHandle(ctx context.Context, handle string) (*domain.User, error)
	UpdateProfile(ctx context.Context, id domain.ID, update *domain.ProfileUpdate) (*domain.User, error)
	ResolveMany(ctx context.Context, ids []domain.ID) (map[domain.ID]*domain.User, error)
	GetAuditLogs(ctx context.Context, userID domain.ID, limit, offset int) ([]*domain.AuditLog, error)
	GetMyAuditLogs(ctx context.Context, userID domain.ID, limit, offset int) ([]*domain.AuditLog, int64, error)
}

func NewUserHandler(svc UserService) *UserHandler {
	return &UserHandler{svc: svc}
}

// GetMe returns the authenticated user's full profile
func (h *UserHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	token := extractBearerToken(r)
	if token == "" {
		dto.WriteError(w, http.StatusUnauthorized, "missing or invalid authorization header")
		return
	}

	user, err := h.svc.GetMe(r.Context(), token)
	if err != nil {
		if errors.Is(err, coresvc.ErrInvalidToken) {
			dto.WriteError(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}
		if errors.Is(err, coresvc.ErrUserNotFound) {
			dto.WriteError(w, http.StatusNotFound, "user not found")
			return
		}
		log.Printf("error getting current user: %v", err)
		dto.WriteError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	dto.WriteJSON(w, http.StatusOK, user)
}

// PatchMeProfile updates the authenticated user's profile
func (h *UserHandler) PatchMeProfile(w http.ResponseWriter, r *http.Request) {
	token := extractBearerToken(r)
	if token == "" {
		dto.WriteError(w, http.StatusUnauthorized, "missing or invalid authorization header")
		return
	}

	user, err := h.svc.GetMe(r.Context(), token)
	if err != nil {
		if errors.Is(err, coresvc.ErrInvalidToken) {
			dto.WriteError(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}
		log.Printf("error validating token: %v", err)
		dto.WriteError(w, http.StatusUnauthorized, "invalid token")
		return
	}

	var update domain.ProfileUpdate
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		dto.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	updated, err := h.svc.UpdateProfile(r.Context(), user.ID, &update)
	if err != nil {
		if errors.Is(err, coresvc.ErrInvalidUsername) {
			dto.WriteError(w, http.StatusBadRequest,
				"invalid username format (use lowercase letters, numbers, hyphens, underscores only)")
			return
		}
		if errors.Is(err, coresvc.ErrUsernameTaken) {
			dto.WriteError(w, http.StatusConflict, "username already taken")
			return
		}
		if errors.Is(err, coresvc.ErrInvalidUpdate) {
			dto.WriteError(w, http.StatusBadRequest, "invalid profile data")
			return
		}

		if strings.Contains(err.Error(), "failed to sync username to Authentik") {
			log.Printf("Authentik sync error for user %s: %v", user.ID, err)
			dto.WriteError(w, http.StatusServiceUnavailable,
				"failed to sync username with authentication provider - please try again later")
			return
		}

		log.Printf("error updating profile: %v", err)
		dto.WriteError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	dto.WriteJSON(w, http.StatusOK, updated)
}

// GetPublicProfile returns a public profile by handle
func (h *UserHandler) GetPublicProfile(w http.ResponseWriter, r *http.Request) {
	handle := chi.URLParam(r, "handle")
	if handle == "" {
		dto.WriteError(w, http.StatusBadRequest, "missing handle")
		return
	}

	handle = strings.TrimPrefix(handle, "@")

	user, err := h.svc.GetByHandle(r.Context(), handle)
	if err != nil {
		if errors.Is(err, coresvc.ErrUserNotFound) {
			dto.WriteError(w, http.StatusNotFound, "profile not found")
			return
		}
		log.Printf("error getting profile by handle %s: %v", handle, err)
		dto.WriteError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	dto.WriteJSON(w, http.StatusOK, user.PublicProfile())
}

// GetUser fetches a user by ID
func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		dto.WriteError(w, http.StatusBadRequest, "missing user id")
		return
	}

	user, err := h.svc.Get(r.Context(), domain.ID(id))
	if err != nil {
		if errors.Is(err, coresvc.ErrUserNotFound) {
			dto.WriteError(w, http.StatusNotFound, "user not found")
			return
		}
		log.Printf("error getting user %s: %v", id, err)
		dto.WriteError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	dto.WriteJSON(w, http.StatusOK, user)
}

// ResolveMany fetches multiple users by ID
func (h *UserHandler) ResolveMany(w http.ResponseWriter, r *http.Request) {
	var req dto.ResolveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		dto.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if len(req.IDs) == 0 {
		dto.WriteJSON(w, http.StatusOK, map[string]any{})
		return
	}

	if len(req.IDs) > 100 {
		dto.WriteError(w, http.StatusBadRequest, "too many ids (max 100)")
		return
	}

	ids := make([]domain.ID, len(req.IDs))
	for i, id := range req.IDs {
		ids[i] = domain.ID(id)
	}

	users, err := h.svc.ResolveMany(r.Context(), ids)
	if err != nil {
		log.Printf("error resolving users: %v", err)
		dto.WriteError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	out := make(map[string]any, len(users))
	for id, u := range users {
		out[string(id)] = u
	}

	dto.WriteJSON(w, http.StatusOK, out)
}

// GetMyAuditLogs retrieves audit logs for the current user
func (h *UserHandler) GetMyAuditLogs(w http.ResponseWriter, r *http.Request) {
	token := extractBearerToken(r)
	if token == "" {
		dto.WriteError(w, http.StatusUnauthorized, "missing or invalid authorization header")
		return
	}

	user, err := h.svc.GetMe(r.Context(), token)
	if err != nil {
		if errors.Is(err, coresvc.ErrInvalidToken) {
			dto.WriteError(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}
		log.Printf("error validating token: %v", err)
		dto.WriteError(w, http.StatusUnauthorized, "invalid token")
		return
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	if limit <= 0 || limit > 100 {
		limit = 20
	}

	logs, total, err := h.svc.GetMyAuditLogs(r.Context(), user.ID, limit, offset)
	if err != nil {
		log.Printf("error getting audit logs for user %s: %v", user.ID, err)
		dto.WriteError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	if logs == nil {
		logs = []*domain.AuditLog{}
	}

	dto.WriteJSON(w, http.StatusOK, dto.AuditLogsResponse{
		Items: logs,
		Total: total,
	})
}

// Helper function
func extractBearerToken(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return ""
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return ""
	}

	return parts[1]
}
