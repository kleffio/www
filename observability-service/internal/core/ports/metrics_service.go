package ports

import (
	"context"

	"prometheus-metrics-api/internal/core/domain"
)

type MetricsService interface {
	GetClusterOverview(ctx context.Context) (*domain.ClusterOverview, error)
	GetRequestsMetric(ctx context.Context, duration string) (*domain.MetricCard, error)
	GetPodsMetric(ctx context.Context, duration string) (*domain.MetricCard, error)
	GetNodesMetric(ctx context.Context, duration string) (*domain.MetricCard, error)
	GetTenantsMetric(ctx context.Context, duration string) (*domain.MetricCard, error)
	GetCPUUtilization(ctx context.Context, duration string) (*domain.ResourceUtilization, error)
	GetMemoryUtilization(ctx context.Context, duration string) (*domain.ResourceUtilization, error)
	GetNodes(ctx context.Context) ([]domain.NodeMetric, error)
	GetNamespaces(ctx context.Context) ([]domain.NamespaceMetric, error)
	GetDatabaseIOMetrics(ctx context.Context, duration string) (*domain.DatabaseMetrics, error)
}
