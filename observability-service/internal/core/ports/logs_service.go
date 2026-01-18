package ports

import (
	"context"

	"prometheus-metrics-api/internal/core/domain"
)

type LogsService interface {
	// QueryLogs queries logs with custom parameters
	QueryLogs(ctx context.Context, params domain.LogQueryParams) (*domain.LogQueryResult, error)

	// GetAllClusterLogs retrieves logs from all namespaces across the cluster
	GetAllClusterLogs(ctx context.Context, limit int, duration string) (*domain.LogQueryResult, error)

	// GetLogsByProjectID retrieves logs for a specific project by its UUID
	GetLogsByProjectID(ctx context.Context, projectID string, limit int, duration string) (*domain.LogQueryResult, error)

	// GetLogsByNamespace retrieves logs for a specific namespace
	GetLogsByNamespace(ctx context.Context, namespace string, limit int, duration string) (*domain.LogQueryResult, error)

	// GetLogsByPod retrieves logs for a specific pod
	GetLogsByPod(ctx context.Context, namespace, pod string, limit int, duration string) (*domain.LogQueryResult, error)

	// GetLogsByContainer retrieves logs for a specific container
	GetLogsByContainer(ctx context.Context, namespace, pod, container string, limit int, duration string) (*domain.LogQueryResult, error)

	// GetLogStreamStats gets statistics about log streams
	GetLogStreamStats(ctx context.Context, namespace string, duration string) ([]domain.LogStreamStats, error)

	// GetErrorLogs retrieves logs with error level
	GetErrorLogs(ctx context.Context, namespace string, limit int, duration string) (*domain.LogQueryResult, error)

	// GetProjectContainerLogs retrieves logs for specific containers within a project
	GetProjectContainerLogs(ctx context.Context, projectID string, containerNames []string, limit int, duration string) (*domain.ProjectLogs, error)
}
