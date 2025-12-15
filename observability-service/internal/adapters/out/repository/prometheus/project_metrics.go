package prometheus

import (
	"context"
	"fmt"
	"time"

	"prometheus-metrics-api/internal/core/domain"
)

func (c *prometheusClient) GetProjectMetrics(ctx context.Context, projectID string, containerNames []string) (*domain.ProjectMetrics, error) {
	if len(containerNames) == 0 {
		return nil, fmt.Errorf("no containers provided for project %s", projectID)
	}

	projectMetrics := &domain.ProjectMetrics{
		ProjectID:  projectID,
		Containers: make([]domain.ContainerMetrics, 0),
		Timestamp:  time.Now().Unix(),
	}

	runningCount := 0

	for _, containerName := range containerNames {
		containerMetric, err := c.getContainerMetrics(ctx, containerName)
		if err != nil {
			continue
		}

		if containerMetric.UptimeSeconds > 0 {
			runningCount++
		}

		projectMetrics.Containers = append(projectMetrics.Containers, *containerMetric)

		projectMetrics.TotalCPUCores += containerMetric.CPUUsageCores
		projectMetrics.TotalMemoryGB += containerMetric.MemoryUsageBytes / (1024 * 1024 * 1024)
		projectMetrics.TotalNetworkRxGB += containerMetric.NetworkRxBytes / (1024 * 1024 * 1024)
		projectMetrics.TotalNetworkTxGB += containerMetric.NetworkTxBytes / (1024 * 1024 * 1024)
		projectMetrics.TotalDiskReadGB += containerMetric.DiskReadBytes / (1024 * 1024 * 1024)
		projectMetrics.TotalDiskWriteGB += containerMetric.DiskWriteBytes / (1024 * 1024 * 1024)
	}

	projectMetrics.TotalContainers = len(containerNames)
	projectMetrics.RunningContainers = runningCount

	projectMetrics.EstimatedMonthlyCost = calculateMonthlyCost(projectMetrics)

	return projectMetrics, nil
}

func (c *prometheusClient) getContainerMetrics(ctx context.Context, containerName string) (*domain.ContainerMetrics, error) {
	metrics := &domain.ContainerMetrics{
		ContainerName: containerName,
	}

	cpuQuery := fmt.Sprintf(`rate(container_cpu_usage_seconds_total{name="%s"}[5m])`, containerName)
	cpuResp, err := c.queryPrometheus(ctx, cpuQuery)
	if err == nil && len(cpuResp.Data.Result) > 0 {
		if val, err := extractValue(cpuResp.Data.Result[0].Value); err == nil {
			metrics.CPUUsageCores = val
		}
	}

	memQuery := fmt.Sprintf(`container_memory_usage_bytes{name="%s"}`, containerName)
	memResp, err := c.queryPrometheus(ctx, memQuery)
	if err == nil && len(memResp.Data.Result) > 0 {
		if val, err := extractValue(memResp.Data.Result[0].Value); err == nil {
			metrics.MemoryUsageBytes = val
		}
	}

	netRxQuery := fmt.Sprintf(`rate(container_network_receive_bytes_total{name="%s"}[5m])`, containerName)
	netRxResp, err := c.queryPrometheus(ctx, netRxQuery)
	if err == nil && len(netRxResp.Data.Result) > 0 {
		if val, err := extractValue(netRxResp.Data.Result[0].Value); err == nil {
			metrics.NetworkRxBytes = val * 300
		}
	}

	netTxQuery := fmt.Sprintf(`rate(container_network_transmit_bytes_total{name="%s"}[5m])`, containerName)
	netTxResp, err := c.queryPrometheus(ctx, netTxQuery)
	if err == nil && len(netTxResp.Data.Result) > 0 {
		if val, err := extractValue(netTxResp.Data.Result[0].Value); err == nil {
			metrics.NetworkTxBytes = val * 300
		}
	}

	diskReadQuery := fmt.Sprintf(`rate(container_fs_reads_bytes_total{name="%s"}[5m])`, containerName)
	diskReadResp, err := c.queryPrometheus(ctx, diskReadQuery)
	if err == nil && len(diskReadResp.Data.Result) > 0 {
		if val, err := extractValue(diskReadResp.Data.Result[0].Value); err == nil {
			metrics.DiskReadBytes = val * 300
		}
	}

	diskWriteQuery := fmt.Sprintf(`rate(container_fs_writes_bytes_total{name="%s"}[5m])`, containerName)
	diskWriteResp, err := c.queryPrometheus(ctx, diskWriteQuery)
	if err == nil && len(diskWriteResp.Data.Result) > 0 {
		if val, err := extractValue(diskWriteResp.Data.Result[0].Value); err == nil {
			metrics.DiskWriteBytes = val * 300
		}
	}

	uptimeQuery := fmt.Sprintf(`time() - container_start_time_seconds{name="%s"}`, containerName)
	uptimeResp, err := c.queryPrometheus(ctx, uptimeQuery)
	if err == nil && len(uptimeResp.Data.Result) > 0 {
		if val, err := extractValue(uptimeResp.Data.Result[0].Value); err == nil {
			metrics.UptimeSeconds = val
		}
	}

	return metrics, nil
}

func calculateMonthlyCost(metrics *domain.ProjectMetrics) float64 {
	hoursInMonth := 730.0

	cpuCost := metrics.TotalCPUCores * domain.DefaultPricing.CPUPerCoreHour * hoursInMonth

	memCost := metrics.TotalMemoryGB * domain.DefaultPricing.MemoryPerGBHour * hoursInMonth

	networkCost := (metrics.TotalNetworkRxGB + metrics.TotalNetworkTxGB) * domain.DefaultPricing.NetworkPerGB

	diskCost := (metrics.TotalDiskReadGB + metrics.TotalDiskWriteGB) * domain.DefaultPricing.DiskIOPerGB

	return cpuCost + memCost + networkCost + diskCost
}
