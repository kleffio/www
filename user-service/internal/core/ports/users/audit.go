package users

import (
	"context"

	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
)

type AuditRepository interface {
	Record(ctx context.Context, log *domain.AuditLog) error
	GetUserAuditLogs(ctx context.Context, userID domain.ID, limit, offset int) ([]*domain.AuditLog, error)
}
