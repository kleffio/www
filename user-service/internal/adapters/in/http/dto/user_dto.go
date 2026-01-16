package dto

import domain "github.com/kleffio/www/user-service/internal/core/domain/users"

type ResolveRequest struct {
	IDs []string `json:"ids"`
}

type AuditLogsResponse struct {
	Items []*domain.AuditLog `json:"items"`
	Total int64              `json:"total"`
}
