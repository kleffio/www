package auth

import (
	"context"

	authdomain "github.com/kleffio/www/user-service/internal/core/domain/auth"
)

type SessionRepository interface {
	Create(ctx context.Context, session *authdomain.Session) error
	Get(ctx context.Context, sessionID string) (*authdomain.Session, error)
	GetBySub(ctx context.Context, sub string) (*authdomain.Session, error)
	Update(ctx context.Context, session *authdomain.Session) error
	Delete(ctx context.Context, sessionID string) error
	Refresh(ctx context.Context, sessionID string) error
	Close() error
}

type TokenRefresher interface {
	RefreshToken(ctx context.Context, refreshToken string) (*authdomain.OAuthTokenResponse, error)
}
