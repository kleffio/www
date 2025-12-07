package domain

// TimeSeriesDataPoint represents a single data point in a time series
type TimeSeriesDataPoint struct {
	Timestamp int64   `json:"timestamp"`
	Value     float64 `json:"value"`
}

// ClusterOverview represents the overall cluster metrics
type ClusterOverview struct {
	TotalNodes         int     `json:"totalNodes"`
	RunningNodes       int     `json:"runningNodes"`
	TotalPods          int     `json:"totalPods"`
	TotalNamespaces    int     `json:"totalNamespaces"`
	CPUUsagePercent    float64 `json:"cpuUsagePercent"`
	MemoryUsagePercent float64 `json:"memoryUsagePercent"`
}

// MetricCard represents a metric card with value, change, and sparkline
type MetricCard struct {
	Title         string                `json:"title"`
	Value         string                `json:"value"`
	RawValue      float64               `json:"rawValue"`
	ChangePercent string                `json:"changePercent"`
	ChangeLabel   string                `json:"changeLabel"`
	Status        string                `json:"status"` // excellent, good, warning, critical
	Sparkline     []TimeSeriesDataPoint `json:"sparkline"`
}

// ResourceUtilization represents resource utilization metrics
type ResourceUtilization struct {
	CurrentValue  float64               `json:"currentValue"`
	ChangePercent float64               `json:"changePercent"`
	Trend         string                `json:"trend"` // up, down, stable
	History       []TimeSeriesDataPoint `json:"history"`
}

// NodeMetric represents metrics for a single node
type NodeMetric struct {
	Name               string  `json:"name"`
	CPUUsagePercent    float64 `json:"cpuUsagePercent"`
	MemoryUsagePercent float64 `json:"memoryUsagePercent"`
	PodCount           int     `json:"podCount"`
	Status             string  `json:"status"`
}

// NamespaceMetric represents metrics for a single namespace
type NamespaceMetric struct {
	Name        string  `json:"name"`
	PodCount    int     `json:"podCount"`
	CPUUsage    float64 `json:"cpuUsage"`
	MemoryUsage float64 `json:"memoryUsage"`
}

// DatabaseMetrics represents database I/O metrics
type DatabaseMetrics struct {
	DiskReadBytesPerSec        float64               `json:"diskReadBytesPerSec"`
	DiskWriteBytesPerSec       float64               `json:"diskWriteBytesPerSec"`
	DiskReadOpsPerSec          float64               `json:"diskReadOpsPerSec"`
	DiskWriteOpsPerSec         float64               `json:"diskWriteOpsPerSec"`
	NetworkReceiveBytesPerSec  float64               `json:"networkReceiveBytesPerSec"`
	NetworkTransmitBytesPerSec float64               `json:"networkTransmitBytesPerSec"`
	NetworkReceiveOpsPerSec    float64               `json:"networkReceiveOpsPerSec"`
	NetworkTransmitOpsPerSec   float64               `json:"networkTransmitOpsPerSec"`
	DiskReadHistory            []TimeSeriesDataPoint `json:"diskReadHistory"`
	DiskWriteHistory           []TimeSeriesDataPoint `json:"diskWriteHistory"`
	NetworkReceiveHistory      []TimeSeriesDataPoint `json:"networkReceiveHistory"`
	NetworkTransmitHistory     []TimeSeriesDataPoint `json:"networkTransmitHistory"`
	Source                     string                `json:"source"`
}
