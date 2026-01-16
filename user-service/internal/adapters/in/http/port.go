package http

import (
	"context"

	authdomain "github.com/kleffio/www/user-service/internal/core/domain/auth"
	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
	userdomain "github.com/kleffio/www/user-service/internal/core/domain/users"
)

type UserService interface {
	Get(ctx context.Context, id domain.ID) (*domain.User, error)
	GetMe(ctx context.Context, bearerToken string) (*domain.User, error)
	GetByHandle(ctx context.Context, handle string) (*domain.User, error)
	UpdateProfile(ctx context.Context, id domain.ID, update *domain.ProfileUpdate) (*domain.User, error)
	ResolveMany(ctx context.Context, ids []domain.ID) (map[domain.ID]*domain.User, error)
	GetAuditLogs(ctx context.Context, userID domain.ID, limit, offset int) ([]*domain.AuditLog, error)
	GetMyAuditLogs(ctx context.Context, userID domain.ID, limit, offset int) ([]*domain.AuditLog, int64, error)
}

type AuthService interface {
	CreateSession(ctx context.Context, tokens *authdomain.OAuthTokenResponse) (string, error)
	GetUserFromSession(ctx context.Context, sessionID string) (*userdomain.User, error)
	RefreshSession(ctx context.Context, sessionID string) error
	DeleteSession(ctx context.Context, sessionID string) error
	GetSessionTokens(ctx context.Context, sessionID string) (*authdomain.OAuthTokenResponse, error)
}
