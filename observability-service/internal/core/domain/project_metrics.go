package domain

type ContainerMetrics struct {
	ContainerName    string  `json:"containerName"`
	CPUUsageCores    float64 `json:"cpuUsageCores"`
	MemoryUsageBytes float64 `json:"memoryUsageBytes"`
	NetworkRxBytes   float64 `json:"networkRxBytes"`
	NetworkTxBytes   float64 `json:"networkTxBytes"`
	DiskReadBytes    float64 `json:"diskReadBytes"`
	DiskWriteBytes   float64 `json:"diskWriteBytes"`
	UptimeSeconds    float64 `json:"uptimeSeconds"`
}

type ProjectMetrics struct {
	ProjectID            string             `json:"projectId"`
	ProjectName          string             `json:"projectName"`
	TotalContainers      int                `json:"totalContainers"`
	RunningContainers    int                `json:"runningContainers"`
	TotalCPUCores        float64            `json:"totalCpuCores"`
	TotalMemoryGB        float64            `json:"totalMemoryGb"`
	TotalNetworkRxGB     float64            `json:"totalNetworkRxGb"`
	TotalNetworkTxGB     float64            `json:"totalNetworkTxGb"`
	TotalDiskReadGB      float64            `json:"totalDiskReadGb"`
	TotalDiskWriteGB     float64            `json:"totalDiskWriteGb"`
	EstimatedMonthlyCost float64            `json:"estimatedMonthlyCost"`
	Containers           []ContainerMetrics `json:"containers"`
	Timestamp            int64              `json:"timestamp"`
}

type PricingConfig struct {
	CPUPerCoreHour  float64 `json:"cpuPerCoreHour"`
	MemoryPerGBHour float64 `json:"memoryPerGbHour"`
	NetworkPerGB    float64 `json:"networkPerGb"`
	DiskIOPerGB     float64 `json:"diskIoPerGb"`
}

var DefaultPricing = PricingConfig{
	CPUPerCoreHour:  0.04,
	MemoryPerGBHour: 0.005,
	NetworkPerGB:    0.02,
	DiskIOPerGB:     0.01,
}
