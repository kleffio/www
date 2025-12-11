package users

import (
	"context"

	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
)

type IdentityProvider interface {
	FetchByToken(ctx context.Context, bearerToken string) (*domain.User, error)
	FetchByID(ctx context.Context, id domain.ID) (*domain.User, error)
}
