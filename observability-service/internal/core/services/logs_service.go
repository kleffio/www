package services

import (
	"context"

	"prometheus-metrics-api/internal/core/domain"
	"prometheus-metrics-api/internal/core/ports"
)

type logsService struct {
	logsRepo ports.LogsRepository
}

func NewLogsService(logsRepo ports.LogsRepository) ports.LogsService {
	return &logsService{
		logsRepo: logsRepo,
	}
}

func (s *logsService) QueryLogs(ctx context.Context, params domain.LogQueryParams) (*domain.LogQueryResult, error) {
	return s.logsRepo.QueryLogs(ctx, params)
}

func (s *logsService) GetAllClusterLogs(ctx context.Context, limit int, duration string) (*domain.LogQueryResult, error) {
	return s.logsRepo.GetAllClusterLogs(ctx, limit, duration)
}

func (s *logsService) GetLogsByProjectID(ctx context.Context, projectID string, limit int, duration string) (*domain.LogQueryResult, error) {
	return s.logsRepo.GetLogsByProjectID(ctx, projectID, limit, duration)
}

func (s *logsService) GetLogsByNamespace(ctx context.Context, namespace string, limit int, duration string) (*domain.LogQueryResult, error) {
	return s.logsRepo.GetLogsByNamespace(ctx, namespace, limit, duration)
}

func (s *logsService) GetLogsByPod(ctx context.Context, namespace, pod string, limit int, duration string) (*domain.LogQueryResult, error) {
	return s.logsRepo.GetLogsByPod(ctx, namespace, pod, limit, duration)
}

func (s *logsService) GetLogsByContainer(ctx context.Context, namespace, pod, container string, limit int, duration string) (*domain.LogQueryResult, error) {
	return s.logsRepo.GetLogsByContainer(ctx, namespace, pod, container, limit, duration)
}

func (s *logsService) GetLogStreamStats(ctx context.Context, namespace string, duration string) ([]domain.LogStreamStats, error) {
	return s.logsRepo.GetLogStreamStats(ctx, namespace, duration)
}

func (s *logsService) GetErrorLogs(ctx context.Context, namespace string, limit int, duration string) (*domain.LogQueryResult, error) {
	return s.logsRepo.GetErrorLogs(ctx, namespace, limit, duration)
}

func (s *logsService) GetProjectContainerLogs(ctx context.Context, projectID string, containerNames []string, limit int, duration string) (*domain.ProjectLogs, error) {
	return s.logsRepo.GetProjectContainerLogs(ctx, projectID, containerNames, limit, duration)
}
