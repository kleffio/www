package auth

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	authdomain "github.com/kleffio/www/user-service/internal/core/domain/auth"
	userdomain "github.com/kleffio/www/user-service/internal/core/domain/users"
	authport "github.com/kleffio/www/user-service/internal/core/ports/auth"
	userport "github.com/kleffio/www/user-service/internal/core/ports/users"
)

var (
	ErrInvalidSession   = errors.New("invalid or expired session")
	ErrNoSession        = errors.New("no session found")
	ErrTokenRefreshFail = errors.New("failed to refresh token")
)

// Service handles authentication and session management
type Service struct {
	sessionRepo    authport.SessionRepository
	tokenValidator userport.TokenValidator
	tokenRefresher authport.TokenRefresher
	userService    UserService
}

// UserService defines the user operations needed by auth service
type UserService interface {
	EnsureUserFromToken(ctx context.Context, claims *userport.TokenClaims) (*userdomain.User, error)
}

func NewService(
	sessionRepo authport.SessionRepository,
	tokenValidator userport.TokenValidator,
	tokenRefresher authport.TokenRefresher,
	userService UserService,
) *Service {
	return &Service{
		sessionRepo:    sessionRepo,
		tokenValidator: tokenValidator,
		tokenRefresher: tokenRefresher,
		userService:    userService,
	}
}

// CreateSession creates a new session from OAuth callback tokens
func (s *Service) CreateSession(ctx context.Context, tokens *authdomain.OAuthTokenResponse) (string, error) {
	claims, err := s.tokenValidator.ValidateToken(ctx, tokens.AccessToken)
	if err != nil {
		return "", fmt.Errorf("failed to validate token: %w", err)
	}

	if _, err := s.userService.EnsureUserFromToken(ctx, claims); err != nil {
		return "", fmt.Errorf("failed to ensure user: %w", err)
	}

	expiresAt := time.Now().UTC().Add(time.Duration(tokens.ExpiresIn) * time.Second)

	session := &authdomain.Session{
		Sub:          claims.Sub,
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		IDToken:      tokens.IDToken,
		ExpiresAt:    expiresAt,
	}

	if err := s.sessionRepo.Create(ctx, session); err != nil {
		return "", fmt.Errorf("failed to create session: %w", err)
	}

	log.Printf("created session for user: sub=%s session_id=%s", claims.Sub, session.SessionID)
	return session.SessionID, nil
}

// GetSession retrieves and validates a session
func (s *Service) GetSession(ctx context.Context, sessionID string) (*authdomain.Session, error) {
	session, err := s.sessionRepo.Get(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get session: %w", err)
	}
	if session == nil {
		return nil, ErrNoSession
	}

	if time.Now().UTC().After(session.ExpiresAt) {
		if err := s.refreshSessionToken(ctx, session); err != nil {
			log.Printf("failed to refresh expired token for session %s: %v", sessionID, err)
			return nil, ErrInvalidSession
		}
	}

	if err := s.sessionRepo.Refresh(ctx, sessionID); err != nil {
		log.Printf("failed to refresh session TTL: %v", err)
	}

	return session, nil
}

// GetSessionTokens retrieves the OAuth tokens from a session
func (s *Service) GetSessionTokens(ctx context.Context, sessionID string) (*authdomain.OAuthTokenResponse, error) {
	session, err := s.sessionRepo.Get(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get session: %w", err)
	}
	if session == nil {
		return nil, ErrNoSession
	}

	return &authdomain.OAuthTokenResponse{
		AccessToken:  session.AccessToken,
		RefreshToken: session.RefreshToken,
		IDToken:      session.IDToken,
	}, nil
}

// GetUserFromSession retrieves the user associated with a session
func (s *Service) GetUserFromSession(ctx context.Context, sessionID string) (*userdomain.User, error) {
	session, err := s.GetSession(ctx, sessionID)
	if err != nil {
		return nil, err
	}

	claims, err := s.tokenValidator.ValidateToken(ctx, session.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("session token invalid: %w", err)
	}

	user, err := s.userService.EnsureUserFromToken(ctx, claims)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// RefreshSession manually refreshes a session's tokens
func (s *Service) RefreshSession(ctx context.Context, sessionID string) error {
	session, err := s.sessionRepo.Get(ctx, sessionID)
	if err != nil {
		return fmt.Errorf("failed to get session: %w", err)
	}
	if session == nil {
		return ErrNoSession
	}

	return s.refreshSessionToken(ctx, session)
}

// DeleteSession logs out a user by deleting their session
func (s *Service) DeleteSession(ctx context.Context, sessionID string) error {
	if err := s.sessionRepo.Delete(ctx, sessionID); err != nil {
		return fmt.Errorf("failed to delete session: %w", err)
	}

	log.Printf("deleted session: session_id=%s", sessionID)
	return nil
}

// refreshSessionToken refreshes the access token using the refresh token
func (s *Service) refreshSessionToken(ctx context.Context, session *authdomain.Session) error {
	if s.tokenRefresher == nil {
		return ErrTokenRefreshFail
	}

	if session.RefreshToken == "" {
		return fmt.Errorf("no refresh token available")
	}

	tokens, err := s.tokenRefresher.RefreshToken(ctx, session.RefreshToken)
	if err != nil {
		return fmt.Errorf("token refresh failed: %w", err)
	}

	session.AccessToken = tokens.AccessToken
	if tokens.RefreshToken != "" {
		session.RefreshToken = tokens.RefreshToken
	}
	if tokens.IDToken != "" {
		session.IDToken = tokens.IDToken
	}
	session.ExpiresAt = time.Now().UTC().Add(time.Duration(tokens.ExpiresIn) * time.Second)

	if err := s.sessionRepo.Update(ctx, session); err != nil {
		return fmt.Errorf("failed to update session: %w", err)
	}

	log.Printf("refreshed session tokens: session_id=%s", session.SessionID)
	return nil
}
