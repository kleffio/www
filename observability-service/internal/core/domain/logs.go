package domain

type LogEntry struct {
	Timestamp string            `json:"timestamp"`
	Log       string            `json:"log"`
	Labels    map[string]string `json:"labels"`
	Stream    map[string]string `json:"stream,omitempty"`
}

type LogQueryResult struct {
	Logs       []LogEntry `json:"logs"`
	TotalCount int        `json:"totalCount"`
	HasMore    bool       `json:"hasMore"`
}

type LogStreamStats struct {
	Namespace    string `json:"namespace"`
	Pod          string `json:"pod"`
	Container    string `json:"container"`
	LogCount     int    `json:"logCount"`
	ErrorCount   int    `json:"errorCount"`
	WarningCount int    `json:"warningCount"`
}

type LogQueryParams struct {
	Query     string `json:"query"`
	Start     string `json:"start,omitempty"`
	End       string `json:"end,omitempty"`
	Limit     int    `json:"limit,omitempty"`
	Direction string `json:"direction,omitempty"` // "backward" or "forward"
	Namespace string `json:"namespace,omitempty"`
	Pod       string `json:"pod,omitempty"`
	Container string `json:"container,omitempty"`
}

type ContainerLogs struct {
	ContainerName string     `json:"containerName"`
	Logs          []LogEntry `json:"logs"`
	LogCount      int        `json:"logCount"`
	ErrorCount    int        `json:"errorCount"`
	WarningCount  int        `json:"warningCount"`
	HasMore       bool       `json:"hasMore"`
}

type ProjectLogs struct {
	ProjectID     string          `json:"projectId"`
	TotalLogs     int             `json:"totalLogs"`
	TotalErrors   int             `json:"totalErrors"`
	TotalWarnings int             `json:"totalWarnings"`
	Containers    []ContainerLogs `json:"containers"`
	Timestamp     int64           `json:"timestamp"`
}
