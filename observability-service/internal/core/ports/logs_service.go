package ports

import (
	"context"

	"prometheus-metrics-api/internal/core/domain"
)

type LogsService interface {
	GetProjectContainerLogs(ctx context.Context, projectID string, containerNames []string, limit int, duration string) (*domain.ProjectLogs, error)
}
