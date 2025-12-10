package users

import (
	"context"

	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
)

type IdentityProvider interface {
	FetchByID(ctx context.Context, id domain.ID) (*domain.User, error)
}
