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

func (s *logsService) GetProjectContainerLogs(ctx context.Context, projectID string, containerNames []string, limit int, duration string) (*domain.ProjectLogs, error) {
	return s.logsRepo.GetProjectContainerLogs(ctx, projectID, containerNames, limit, duration)
}
