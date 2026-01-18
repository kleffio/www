package ports

import (
	"context"

	"prometheus-metrics-api/internal/core/domain"
)

type LogsService interface {
	QueryLogs(ctx context.Context, params domain.LogQueryParams) (*domain.LogQueryResult, error)

	GetAllClusterLogs(ctx context.Context, limit int, duration string) (*domain.LogQueryResult, error)

	GetLogsByProjectID(ctx context.Context, projectID string, limit int, duration string) (*domain.LogQueryResult, error)

	GetLogsByNamespace(ctx context.Context, namespace string, limit int, duration string) (*domain.LogQueryResult, error)

	GetLogsByPod(ctx context.Context, namespace, pod string, limit int, duration string) (*domain.LogQueryResult, error)

	GetLogsByContainer(ctx context.Context, namespace, pod, container string, limit int, duration string) (*domain.LogQueryResult, error)

	GetLogStreamStats(ctx context.Context, namespace string, duration string) ([]domain.LogStreamStats, error)

	GetErrorLogs(ctx context.Context, namespace string, limit int, duration string) (*domain.LogQueryResult, error)

	GetProjectContainerLogs(ctx context.Context, projectID string, containerNames []string, limit int, duration string) (*domain.ProjectLogs, error)
}
