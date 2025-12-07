package ports

import (
	"context"

	"prometheus-metrics-api/internal/core/domain"
)

// MetricsRepository defines the interface for querying metrics from Prometheus (outbound port)
type MetricsRepository interface {
	// GetClusterOverview retrieves overall cluster metrics
	GetClusterOverview(ctx context.Context) (*domain.ClusterOverview, error)

	// GetRequestsMetric retrieves HTTP requests metric card
	GetRequestsMetric(ctx context.Context, duration string) (*domain.MetricCard, error)

	// GetPodsMetric retrieves pods count metric card
	GetPodsMetric(ctx context.Context, duration string) (*domain.MetricCard, error)

	// GetNodesMetric retrieves nodes count metric card
	GetNodesMetric(ctx context.Context, duration string) (*domain.MetricCard, error)

	// GetTenantsMetric retrieves tenants count metric card
	GetTenantsMetric(ctx context.Context, duration string) (*domain.MetricCard, error)

	// GetCPUUtilization retrieves CPU utilization over time
	GetCPUUtilization(ctx context.Context, duration string) (*domain.ResourceUtilization, error)

	// GetMemoryUtilization retrieves memory utilization over time
	GetMemoryUtilization(ctx context.Context, duration string) (*domain.ResourceUtilization, error)

	// GetNodes retrieves metrics for all nodes
	GetNodes(ctx context.Context) ([]domain.NodeMetric, error)

	// GetNamespaces retrieves metrics for all namespaces
	GetNamespaces(ctx context.Context) ([]domain.NamespaceMetric, error)

	// GetDatabaseIOMetrics retrieves database I/O metrics
	GetDatabaseIOMetrics(ctx context.Context, duration string) (*domain.DatabaseMetrics, error)
}
