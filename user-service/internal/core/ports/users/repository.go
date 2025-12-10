package users

import (
	"context"

	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
)

type Repository interface {
	GetByID(ctx context.Context, id domain.ID) (*domain.User, error)
	Save(ctx context.Context, user *domain.User) error
}
