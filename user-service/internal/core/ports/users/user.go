package users

import (
	"context"

	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
)

type UserRepository interface {
	GetByID(ctx context.Context, id domain.ID) (*domain.User, error)
	GetByHandle(ctx context.Context, handle string) (*domain.User, error)
	Save(ctx context.Context, user *domain.User) error
	UpdateProfile(ctx context.Context, id domain.ID, update *domain.ProfileUpdate) error
	HandleExists(ctx context.Context, handle string, excludeID domain.ID) (bool, error)
}

type TokenClaims struct {
	Sub               string `json:"sub"`
	Email             string `json:"email"`
	EmailVerified     bool   `json:"email_verified"`
	PreferredUsername string `json:"preferred_username,omitempty"`
}

type TokenValidator interface {
	ValidateToken(ctx context.Context, bearerToken string) (*TokenClaims, error)
}
