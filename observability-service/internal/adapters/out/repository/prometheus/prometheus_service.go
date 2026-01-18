package prometheus

import (
	"context"
	"fmt"

	"prometheus-metrics-api/internal/core/domain"
)

func (c *prometheusClient) GetClusterOverview(ctx context.Context) (*domain.ClusterOverview, error) {
	overview := &domain.ClusterOverview{}

	resp, err := c.queryPrometheus(ctx, `count(kube_node_info)`)
	if err == nil && len(resp.Data.Result) > 0 {
		if val, err := extractValue(resp.Data.Result[0].Value); err == nil {
			overview.TotalNodes = int(val)
		}
	}

	resp, err = c.queryPrometheus(ctx, `count(kube_node_info{condition="Ready"})`)
	if err == nil && len(resp.Data.Result) > 0 {
		if val, err := extractValue(resp.Data.Result[0].Value); err == nil {
			overview.RunningNodes = int(val)
		}
	}

	resp, err = c.queryPrometheus(ctx, `count(kube_pod_info)`)
	if err == nil && len(resp.Data.Result) > 0 {
		if val, err := extractValue(resp.Data.Result[0].Value); err == nil {
			overview.TotalPods = int(val)
		}
	}

	resp, err = c.queryPrometheus(ctx, `count(count by (namespace) (kube_pod_info))`)
	if err == nil && len(resp.Data.Result) > 0 {
		if val, err := extractValue(resp.Data.Result[0].Value); err == nil {
			overview.TotalNamespaces = int(val)
		}
	}

	resp, err = c.queryPrometheus(ctx, `sum(rate(container_cpu_usage_seconds_total[5m])) / sum(machine_cpu_cores) * 100`)
	if err == nil && len(resp.Data.Result) > 0 {
		if val, err := extractValue(resp.Data.Result[0].Value); err == nil {
			overview.CPUUsagePercent = val
		}
	}

	resp, err = c.queryPrometheus(ctx, `sum(container_memory_usage_bytes) / sum(machine_memory_bytes) * 100`)
	if err == nil && len(resp.Data.Result) > 0 {
		if val, err := extractValue(resp.Data.Result[0].Value); err == nil {
			overview.MemoryUsagePercent = val
		}
	}

	return overview, nil
}

func (c *prometheusClient) GetRequestsMetric(ctx context.Context, duration string) (*domain.MetricCard, error) {
	currentQuery := `sum(rate(http_requests_total[5m]))`
	resp, err := c.queryPrometheus(ctx, currentQuery)
	if err != nil {
		return nil, err
	}

	var current float64
	if len(resp.Data.Result) > 0 {
		current, _ = extractValue(resp.Data.Result[0].Value)
	}

	sparklineQuery := `sum(rate(http_requests_total[5m]))`
	sparkResp, err := c.queryPrometheusRange(ctx, sparklineQuery, duration)
	if err != nil {
		return nil, err
	}

	var sparkline []domain.TimeSeriesDataPoint
	if len(sparkResp.Data.Result) > 0 {
		sparkline = extractTimeSeries(sparkResp.Data.Result[0].Values)
	}

	var changePercent float64
	if len(sparkline) > 1 {
		previous := sparkline[0].Value
		changePercent = calculateChangePercent(current, previous)
	}

	return &domain.MetricCard{
		Title:         "HTTP Requests",
		Value:         fmt.Sprintf("%.0f req/s", current),
		RawValue:      current,
		ChangePercent: fmt.Sprintf("%+.1f%%", changePercent),
		ChangeLabel:   "vs " + duration + " ago",
		Status:        determineStatus(current, 1000, 5000),
		Sparkline:     sparkline,
	}, nil
}

func (c *prometheusClient) GetPodsMetric(ctx context.Context, duration string) (*domain.MetricCard, error) {
	currentQuery := `count(kube_pod_info)`
	resp, err := c.queryPrometheus(ctx, currentQuery)
	if err != nil {
		return nil, err
	}

	var current float64
	if len(resp.Data.Result) > 0 {
		current, _ = extractValue(resp.Data.Result[0].Value)
	}

	sparklineQuery := `count(kube_pod_info)`
	sparkResp, err := c.queryPrometheusRange(ctx, sparklineQuery, duration)
	if err != nil {
		return nil, err
	}

	var sparkline []domain.TimeSeriesDataPoint
	if len(sparkResp.Data.Result) > 0 {
		sparkline = extractTimeSeries(sparkResp.Data.Result[0].Values)
	}

	var changePercent float64
	if len(sparkline) > 1 {
		previous := sparkline[0].Value
		changePercent = calculateChangePercent(current, previous)
	}

	return &domain.MetricCard{
		Title:         "Total Pods",
		Value:         fmt.Sprintf("%.0f", current),
		RawValue:      current,
		ChangePercent: fmt.Sprintf("%+.1f%%", changePercent),
		ChangeLabel:   "vs " + duration + " ago",
		Status:        determineStatus(current, 100, 500),
		Sparkline:     sparkline,
	}, nil
}

func (c *prometheusClient) GetNodesMetric(ctx context.Context, duration string) (*domain.MetricCard, error) {
	currentQuery := `count(kube_node_info)`
	resp, err := c.queryPrometheus(ctx, currentQuery)
	if err != nil {
		return nil, err
	}

	var current float64
	if len(resp.Data.Result) > 0 {
		current, _ = extractValue(resp.Data.Result[0].Value)
	}

	sparklineQuery := `count(kube_node_info)`
	sparkResp, err := c.queryPrometheusRange(ctx, sparklineQuery, duration)
	if err != nil {
		return nil, err
	}

	var sparkline []domain.TimeSeriesDataPoint
	if len(sparkResp.Data.Result) > 0 {
		sparkline = extractTimeSeries(sparkResp.Data.Result[0].Values)
	}

	var changePercent float64
	if len(sparkline) > 1 {
		previous := sparkline[0].Value
		changePercent = calculateChangePercent(current, previous)
	}

	return &domain.MetricCard{
		Title:         "Cluster Nodes",
		Value:         fmt.Sprintf("%.0f", current),
		RawValue:      current,
		ChangePercent: fmt.Sprintf("%+.1f%%", changePercent),
		ChangeLabel:   "vs " + duration + " ago",
		Status:        "good",
		Sparkline:     sparkline,
	}, nil
}

func (c *prometheusClient) GetTenantsMetric(ctx context.Context, duration string) (*domain.MetricCard, error) {
	currentQuery := `count(count by (tenant) (kube_pod_info))`
	resp, err := c.queryPrometheus(ctx, currentQuery)
	if err != nil {
		return nil, err
	}

	var current float64
	if len(resp.Data.Result) > 0 {
		current, _ = extractValue(resp.Data.Result[0].Value)
	}

	sparklineQuery := `count(count by (tenant) (kube_pod_info))`
	sparkResp, err := c.queryPrometheusRange(ctx, sparklineQuery, duration)
	if err != nil {
		return nil, err
	}

	var sparkline []domain.TimeSeriesDataPoint
	if len(sparkResp.Data.Result) > 0 {
		sparkline = extractTimeSeries(sparkResp.Data.Result[0].Values)
	}

	var changePercent float64
	if len(sparkline) > 1 {
		previous := sparkline[0].Value
		changePercent = calculateChangePercent(current, previous)
	}

	return &domain.MetricCard{
		Title:         "Active Tenants",
		Value:         fmt.Sprintf("%.0f", current),
		RawValue:      current,
		ChangePercent: fmt.Sprintf("%+.1f%%", changePercent),
		ChangeLabel:   "vs " + duration + " ago",
		Status:        "excellent",
		Sparkline:     sparkline,
	}, nil
}

func (c *prometheusClient) GetCPUUtilization(ctx context.Context, duration string) (*domain.ResourceUtilization, error) {
	currentQuery := `sum(rate(container_cpu_usage_seconds_total[5m])) / sum(machine_cpu_cores) * 100`
	resp, err := c.queryPrometheus(ctx, currentQuery)
	if err != nil {
		return nil, err
	}

	var current float64
	if len(resp.Data.Result) > 0 {
		current, _ = extractValue(resp.Data.Result[0].Value)
	}

	historyQuery := `sum(rate(container_cpu_usage_seconds_total[5m])) / sum(machine_cpu_cores) * 100`
	histResp, err := c.queryPrometheusRange(ctx, historyQuery, duration)
	if err != nil {
		return nil, err
	}

	var history []domain.TimeSeriesDataPoint
	if len(histResp.Data.Result) > 0 {
		history = extractTimeSeries(histResp.Data.Result[0].Values)
	}

	var changePercent float64
	trend := "stable"
	if len(history) > 1 {
		previous := history[0].Value
		changePercent = calculateChangePercent(current, previous)

		if changePercent > 5 {
			trend = "up"
		} else if changePercent < -5 {
			trend = "down"
		}
	}

	return &domain.ResourceUtilization{
		CurrentValue:  current,
		ChangePercent: changePercent,
		Trend:         trend,
		History:       history,
	}, nil
}

func (c *prometheusClient) GetMemoryUtilization(ctx context.Context, duration string) (*domain.ResourceUtilization, error) {
	currentQuery := `sum(container_memory_usage_bytes) / sum(machine_memory_bytes) * 100`
	resp, err := c.queryPrometheus(ctx, currentQuery)
	if err != nil {
		return nil, err
	}

	var current float64
	if len(resp.Data.Result) > 0 {
		current, _ = extractValue(resp.Data.Result[0].Value)
	}

	historyQuery := `sum(container_memory_usage_bytes) / sum(machine_memory_bytes) * 100`
	histResp, err := c.queryPrometheusRange(ctx, historyQuery, duration)
	if err != nil {
		return nil, err
	}

	var history []domain.TimeSeriesDataPoint
	if len(histResp.Data.Result) > 0 {
		history = extractTimeSeries(histResp.Data.Result[0].Values)
	}

	var changePercent float64
	trend := "stable"
	if len(history) > 1 {
		previous := history[0].Value
		changePercent = calculateChangePercent(current, previous)

		if changePercent > 5 {
			trend = "up"
		} else if changePercent < -5 {
			trend = "down"
		}
	}

	return &domain.ResourceUtilization{
		CurrentValue:  current,
		ChangePercent: changePercent,
		Trend:         trend,
		History:       history,
	}, nil
}

func (c *prometheusClient) GetNodes(ctx context.Context) ([]domain.NodeMetric, error) {
	query := `kube_node_info`
	resp, err := c.queryPrometheus(ctx, query)
	if err != nil {
		return nil, err
	}

	nodes := make([]domain.NodeMetric, 0)

	for _, result := range resp.Data.Result {
		nodeName := result.Metric["node"]

		cpuQuery := fmt.Sprintf(`sum(rate(container_cpu_usage_seconds_total{node="%s"}[5m])) / sum(machine_cpu_cores{node="%s"}) * 100`, nodeName, nodeName)
		cpuResp, _ := c.queryPrometheus(ctx, cpuQuery)
		var cpuUsage float64
		if len(cpuResp.Data.Result) > 0 {
			cpuUsage, _ = extractValue(cpuResp.Data.Result[0].Value)
		}

		memQuery := fmt.Sprintf(`sum(container_memory_usage_bytes{node="%s"}) / sum(machine_memory_bytes{node="%s"}) * 100`, nodeName, nodeName)
		memResp, _ := c.queryPrometheus(ctx, memQuery)
		var memUsage float64
		if len(memResp.Data.Result) > 0 {
			memUsage, _ = extractValue(memResp.Data.Result[0].Value)
		}

		podQuery := fmt.Sprintf(`count(kube_pod_info{node="%s"})`, nodeName)
		podResp, _ := c.queryPrometheus(ctx, podQuery)
		var podCount int
		if len(podResp.Data.Result) > 0 {
			if val, err := extractValue(podResp.Data.Result[0].Value); err == nil {
				podCount = int(val)
			}
		}

		nodes = append(nodes, domain.NodeMetric{
			Name:               nodeName,
			CPUUsagePercent:    cpuUsage,
			MemoryUsagePercent: memUsage,
			PodCount:           podCount,
			Status:             "Ready",
		})
	}

	return nodes, nil
}

func (c *prometheusClient) GetNamespaces(ctx context.Context) ([]domain.NamespaceMetric, error) {
	query := `count by (namespace) (kube_pod_info)`
	resp, err := c.queryPrometheus(ctx, query)
	if err != nil {
		return nil, err
	}

	namespaces := make([]domain.NamespaceMetric, 0)

	for _, result := range resp.Data.Result {
		namespace := result.Metric["namespace"]

		podCount, _ := extractValue(result.Value)

		cpuQuery := fmt.Sprintf(`sum(rate(container_cpu_usage_seconds_total{namespace="%s"}[5m]))`, namespace)
		cpuResp, _ := c.queryPrometheus(ctx, cpuQuery)
		var cpuUsage float64
		if len(cpuResp.Data.Result) > 0 {
			cpuUsage, _ = extractValue(cpuResp.Data.Result[0].Value)
		}

		memQuery := fmt.Sprintf(`sum(container_memory_usage_bytes{namespace="%s"})`, namespace)
		memResp, _ := c.queryPrometheus(ctx, memQuery)
		var memUsage float64
		if len(memResp.Data.Result) > 0 {
			memUsage, _ = extractValue(memResp.Data.Result[0].Value)
		}

		namespaces = append(namespaces, domain.NamespaceMetric{
			Name:        namespace,
			PodCount:    int(podCount),
			CPUUsage:    cpuUsage,
			MemoryUsage: memUsage,
		})
	}

	return namespaces, nil
}

func (c *prometheusClient) GetDatabaseIOMetrics(ctx context.Context, duration string) (*domain.DatabaseMetrics, error) {
	metrics := &domain.DatabaseMetrics{
		Source: "Prometheus",
	}

	query := `sum(rate(node_disk_read_bytes_total[5m]))`
	if resp, err := c.queryPrometheus(ctx, query); err == nil && len(resp.Data.Result) > 0 {
		metrics.DiskReadBytesPerSec, _ = extractValue(resp.Data.Result[0].Value)
	}

	query = `sum(rate(node_disk_written_bytes_total[5m]))`
	if resp, err := c.queryPrometheus(ctx, query); err == nil && len(resp.Data.Result) > 0 {
		metrics.DiskWriteBytesPerSec, _ = extractValue(resp.Data.Result[0].Value)
	}

	query = `sum(rate(node_disk_reads_completed_total[5m]))`
	if resp, err := c.queryPrometheus(ctx, query); err == nil && len(resp.Data.Result) > 0 {
		metrics.DiskReadOpsPerSec, _ = extractValue(resp.Data.Result[0].Value)
	}

	query = `sum(rate(node_disk_writes_completed_total[5m]))`
	if resp, err := c.queryPrometheus(ctx, query); err == nil && len(resp.Data.Result) > 0 {
		metrics.DiskWriteOpsPerSec, _ = extractValue(resp.Data.Result[0].Value)
	}

	query = `sum(rate(node_network_receive_bytes_total[5m]))`
	if resp, err := c.queryPrometheus(ctx, query); err == nil && len(resp.Data.Result) > 0 {
		metrics.NetworkReceiveBytesPerSec, _ = extractValue(resp.Data.Result[0].Value)
	}

	query = `sum(rate(node_network_transmit_bytes_total[5m]))`
	if resp, err := c.queryPrometheus(ctx, query); err == nil && len(resp.Data.Result) > 0 {
		metrics.NetworkTransmitBytesPerSec, _ = extractValue(resp.Data.Result[0].Value)
	}

	query = `sum(rate(node_network_receive_packets_total[5m]))`
	if resp, err := c.queryPrometheus(ctx, query); err == nil && len(resp.Data.Result) > 0 {
		metrics.NetworkReceiveOpsPerSec, _ = extractValue(resp.Data.Result[0].Value)
	}

	query = `sum(rate(node_network_transmit_packets_total[5m]))`
	if resp, err := c.queryPrometheus(ctx, query); err == nil && len(resp.Data.Result) > 0 {
		metrics.NetworkTransmitOpsPerSec, _ = extractValue(resp.Data.Result[0].Value)
	}

	if resp, err := c.queryPrometheusRange(ctx, `sum(rate(node_disk_read_bytes_total[5m]))`, duration); err == nil && len(resp.Data.Result) > 0 {
		metrics.DiskReadHistory = extractTimeSeries(resp.Data.Result[0].Values)
	}

	if resp, err := c.queryPrometheusRange(ctx, `sum(rate(node_disk_written_bytes_total[5m]))`, duration); err == nil && len(resp.Data.Result) > 0 {
		metrics.DiskWriteHistory = extractTimeSeries(resp.Data.Result[0].Values)
	}

	if resp, err := c.queryPrometheusRange(ctx, `sum(rate(node_network_receive_bytes_total[5m]))`, duration); err == nil && len(resp.Data.Result) > 0 {
		metrics.NetworkReceiveHistory = extractTimeSeries(resp.Data.Result[0].Values)
	}

	if resp, err := c.queryPrometheusRange(ctx, `sum(rate(node_network_transmit_bytes_total[5m]))`, duration); err == nil && len(resp.Data.Result) > 0 {
		metrics.NetworkTransmitHistory = extractTimeSeries(resp.Data.Result[0].Values)
	}

	return metrics, nil
}

func (c *prometheusClient) GetProjectUsageMetrics(ctx context.Context, projectID string) (*domain.ProjectUsageMetrics, error) {
	return c.GetProjectUsageMetricsWithDays(ctx, projectID, 30)
}

func (c *prometheusClient) GetProjectUsageMetricsWithDays(ctx context.Context, projectID string, days int) (*domain.ProjectUsageMetrics, error) {
	metrics := &domain.ProjectUsageMetrics{
		ProjectID: projectID,
		Window:    fmt.Sprintf("%dd", days),
	}

	// Memory query: sum(avg_over_time(container_memory_working_set_bytes{namespace="%s", container!="", container!="POD"}[%dd])) / (1024^3)
	memoryQuery := fmt.Sprintf(`sum(avg_over_time(container_memory_working_set_bytes{namespace="%s", container!="", container!="POD"}[%dd])) / (1024^3)`, projectID, days)
	memoryResp, err := c.queryPrometheus(ctx, memoryQuery)
	if err == nil && len(memoryResp.Data.Result) > 0 {
		if val, err := extractValue(memoryResp.Data.Result[0].Value); err == nil {
			metrics.MemoryUsageGB = val
		}
	}
	// If no data, MemoryUsageGB remains 0.0

	// CPU query: sum(avg_over_time(rate(container_cpu_usage_seconds_total{namespace="%s", container!="", container!="POD"}[5m])[%dd:1m]))
	cpuQuery := fmt.Sprintf(`sum(avg_over_time(rate(container_cpu_usage_seconds_total{namespace="%s", container!="", container!="POD"}[5m])[%dd:1m]))`, projectID, days)
	cpuResp, err := c.queryPrometheus(ctx, cpuQuery)
	if err == nil && len(cpuResp.Data.Result) > 0 {
		if val, err := extractValue(cpuResp.Data.Result[0].Value); err == nil {
			metrics.CPURequestCores = val
		}
	}
	// If no data, CPURequestCores remains 0.0

	return metrics, nil
}
