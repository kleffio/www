package services

import (
	"context"

	"prometheus-metrics-api/internal/core/domain"
	"prometheus-metrics-api/internal/core/ports"
)

type metricsService struct {
	metricsRepo ports.MetricsRepository
}

func NewMetricsService(metricsRepo ports.MetricsRepository) ports.MetricsService {
	return &metricsService{
		metricsRepo: metricsRepo,
	}
}

func (s *metricsService) GetClusterOverview(ctx context.Context) (*domain.ClusterOverview, error) {
	return s.metricsRepo.GetClusterOverview(ctx)
}

func (s *metricsService) GetRequestsMetric(ctx context.Context, duration string) (*domain.MetricCard, error) {
	return s.metricsRepo.GetRequestsMetric(ctx, duration)
}

func (s *metricsService) GetPodsMetric(ctx context.Context, duration string) (*domain.MetricCard, error) {
	return s.metricsRepo.GetPodsMetric(ctx, duration)
}

func (s *metricsService) GetNodesMetric(ctx context.Context, duration string) (*domain.MetricCard, error) {
	return s.metricsRepo.GetNodesMetric(ctx, duration)
}

func (s *metricsService) GetTenantsMetric(ctx context.Context, duration string) (*domain.MetricCard, error) {
	return s.metricsRepo.GetTenantsMetric(ctx, duration)
}

func (s *metricsService) GetCPUUtilization(ctx context.Context, duration string) (*domain.ResourceUtilization, error) {
	return s.metricsRepo.GetCPUUtilization(ctx, duration)
}

func (s *metricsService) GetMemoryUtilization(ctx context.Context, duration string) (*domain.ResourceUtilization, error) {
	return s.metricsRepo.GetMemoryUtilization(ctx, duration)
}

func (s *metricsService) GetNodes(ctx context.Context) ([]domain.NodeMetric, error) {
	return s.metricsRepo.GetNodes(ctx)
}

func (s *metricsService) GetNamespaces(ctx context.Context) ([]domain.NamespaceMetric, error) {
	return s.metricsRepo.GetNamespaces(ctx)
}

func (s *metricsService) GetDatabaseIOMetrics(ctx context.Context, duration string) (*domain.DatabaseMetrics, error) {
	return s.metricsRepo.GetDatabaseIOMetrics(ctx, duration)
}

func (s *metricsService) GetProjectUsageMetrics(ctx context.Context, projectID string) (*domain.ProjectUsageMetrics, error) {
	return s.metricsRepo.GetProjectUsageMetrics(ctx, projectID)
}
