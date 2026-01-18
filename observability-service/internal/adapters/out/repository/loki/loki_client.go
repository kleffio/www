package loki

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"prometheus-metrics-api/internal/core/domain"
	"prometheus-metrics-api/internal/core/ports"
)

type lokiClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewLokiClient(baseURL string) ports.LogsRepository {
	return &lokiClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// LokiResponse represents the response from Loki's query_range API
type LokiResponse struct {
	Status string `json:"status"`
	Data   struct {
		ResultType string `json:"resultType"`
		Result     []struct {
			Stream map[string]string `json:"stream"`
			Values [][]string        `json:"values"`
		} `json:"result"`
		Stats struct {
			Summary struct {
				BytesProcessedPerSecond int     `json:"bytesProcessedPerSecond"`
				LinesProcessedPerSecond int     `json:"linesProcessedPerSecond"`
				TotalBytesProcessed     int     `json:"totalBytesProcessed"`
				TotalLinesProcessed     int     `json:"totalLinesProcessed"`
				ExecTime                float64 `json:"execTime"`
			} `json:"summary"`
		} `json:"stats"`
	} `json:"data"`
}

// queryLokiRange queries Loki's query_range endpoint
func (c *lokiClient) queryLokiRange(ctx context.Context, query string, start, end time.Time, limit int, direction string) (*LokiResponse, error) {
	if direction == "" {
		direction = "backward"
	}

	params := url.Values{}
	params.Add("query", query)
	params.Add("start", fmt.Sprintf("%d", start.UnixNano()))
	params.Add("end", fmt.Sprintf("%d", end.UnixNano()))
	params.Add("limit", strconv.Itoa(limit))
	params.Add("direction", direction)

	apiURL := fmt.Sprintf("%s/loki/api/v1/query_range?%s", c.baseURL, params.Encode())

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, apiURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("loki returned status %d: %s", resp.StatusCode, string(body))
	}

	var lokiResp LokiResponse
	if err := json.NewDecoder(resp.Body).Decode(&lokiResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &lokiResp, nil
}

// parseDuration parses duration string like "1h", "30m", "24h"
func parseDuration(duration string) (time.Duration, error) {
	dur, err := time.ParseDuration(duration)
	if err != nil {
		return 1 * time.Hour, fmt.Errorf("invalid duration format: %w", err)
	}
	return dur, nil
}

// convertToLogEntries converts Loki response to domain LogEntry slice
func convertToLogEntries(lokiResp *LokiResponse) []domain.LogEntry {
	var logs []domain.LogEntry

	for _, result := range lokiResp.Data.Result {
		for _, value := range result.Values {
			if len(value) >= 2 {
				// Parse timestamp (nanoseconds)
				timestamp := value[0]
				logLine := value[1]

				logs = append(logs, domain.LogEntry{
					Timestamp: timestamp,
					Log:       logLine,
					Labels:    result.Stream,
					Stream:    result.Stream,
				})
			}
		}
	}

	return logs
}

// QueryLogs implements custom log query
func (c *lokiClient) QueryLogs(ctx context.Context, params domain.LogQueryParams) (*domain.LogQueryResult, error) {
	query := params.Query
	if query == "" {
		return nil, fmt.Errorf("query cannot be empty")
	}

	// Parse time range
	end := time.Now()
	start := end.Add(-1 * time.Hour) // default 1 hour

	if params.Start != "" {
		if t, err := time.Parse(time.RFC3339, params.Start); err == nil {
			start = t
		}
	}

	if params.End != "" {
		if t, err := time.Parse(time.RFC3339, params.End); err == nil {
			end = t
		}
	}

	limit := params.Limit
	if limit <= 0 {
		limit = 100
	}

	direction := params.Direction
	if direction == "" {
		direction = "backward"
	}

	lokiResp, err := c.queryLokiRange(ctx, query, start, end, limit, direction)
	if err != nil {
		return nil, err
	}

	logs := convertToLogEntries(lokiResp)

	return &domain.LogQueryResult{
		Logs:       logs,
		TotalCount: len(logs),
		HasMore:    len(logs) >= limit,
	}, nil
}

// GetAllClusterLogs retrieves logs from all namespaces across the cluster
func (c *lokiClient) GetAllClusterLogs(ctx context.Context, limit int, duration string) (*domain.LogQueryResult, error) {
	if limit <= 0 {
		limit = 100
	}

	dur, err := parseDuration(duration)
	if err != nil {
		dur = 1 * time.Hour
	}

	end := time.Now()
	start := end.Add(-dur)

	// Query all logs - try both k8s_namespace_name and namespace label formats
	// The {k8s_namespace_name=~".+"} pattern matches any non-empty namespace
	query := `{k8s_namespace_name=~".+"} |= ""`

	lokiResp, err := c.queryLokiRange(ctx, query, start, end, limit, "backward")
	if err != nil {
		// Fallback to standard namespace label if k8s_ prefix fails
		query = `{namespace=~".+"} |= ""`
		lokiResp, err = c.queryLokiRange(ctx, query, start, end, limit, "backward")
		if err != nil {
			return nil, err
		}
	}

	logs := convertToLogEntries(lokiResp)

	return &domain.LogQueryResult{
		Logs:       logs,
		TotalCount: len(logs),
		HasMore:    len(logs) >= limit,
	}, nil
}

// GetLogsByProjectID retrieves logs for a specific project by its UUID
// In Kleff, each project deploys to a namespace named with the project UUID
func (c *lokiClient) GetLogsByProjectID(ctx context.Context, projectID string, limit int, duration string) (*domain.LogQueryResult, error) {
	if limit <= 0 {
		limit = 100
	}

	dur, err := parseDuration(duration)
	if err != nil {
		dur = 1 * time.Hour
	}

	end := time.Now()
	start := end.Add(-dur)

	// Try k8s_namespace_name label first (common in Kubernetes clusters)
	query := fmt.Sprintf(`{k8s_namespace_name="%s"} |= ""`, projectID)

	lokiResp, err := c.queryLokiRange(ctx, query, start, end, limit, "backward")
	if err != nil || len(lokiResp.Data.Result) == 0 {
		// Fallback to standard namespace label
		query = fmt.Sprintf(`{namespace="%s"} |= ""`, projectID)
		lokiResp, err = c.queryLokiRange(ctx, query, start, end, limit, "backward")
		if err != nil {
			return nil, err
		}
	}

	logs := convertToLogEntries(lokiResp)

	return &domain.LogQueryResult{
		Logs:       logs,
		TotalCount: len(logs),
		HasMore:    len(logs) >= limit,
	}, nil
}

// GetLogsByNamespace retrieves logs for a specific namespace
func (c *lokiClient) GetLogsByNamespace(ctx context.Context, namespace string, limit int, duration string) (*domain.LogQueryResult, error) {
	if limit <= 0 {
		limit = 100
	}

	dur, err := parseDuration(duration)
	if err != nil {
		dur = 1 * time.Hour
	}

	end := time.Now()
	start := end.Add(-dur)

	// Try k8s_namespace_name label first
	query := fmt.Sprintf(`{k8s_namespace_name="%s"} |= ""`, namespace)

	lokiResp, err := c.queryLokiRange(ctx, query, start, end, limit, "backward")
	if err != nil || len(lokiResp.Data.Result) == 0 {
		// Fallback to standard namespace label
		query = fmt.Sprintf(`{namespace="%s"} |= ""`, namespace)
		lokiResp, err = c.queryLokiRange(ctx, query, start, end, limit, "backward")
		if err != nil {
			return nil, err
		}
	}

	logs := convertToLogEntries(lokiResp)

	return &domain.LogQueryResult{
		Logs:       logs,
		TotalCount: len(logs),
		HasMore:    len(logs) >= limit,
	}, nil
}

// GetLogsByPod retrieves logs for a specific pod
func (c *lokiClient) GetLogsByPod(ctx context.Context, namespace, pod string, limit int, duration string) (*domain.LogQueryResult, error) {
	if limit <= 0 {
		limit = 100
	}

	dur, err := parseDuration(duration)
	if err != nil {
		dur = 1 * time.Hour
	}

	end := time.Now()
	start := end.Add(-dur)

	// Try k8s_ prefixed labels first
	query := fmt.Sprintf(`{k8s_namespace_name="%s", k8s_pod_name="%s"} |= ""`, namespace, pod)

	lokiResp, err := c.queryLokiRange(ctx, query, start, end, limit, "backward")
	if err != nil || len(lokiResp.Data.Result) == 0 {
		// Fallback to standard labels
		query = fmt.Sprintf(`{namespace="%s", pod="%s"} |= ""`, namespace, pod)
		lokiResp, err = c.queryLokiRange(ctx, query, start, end, limit, "backward")
		if err != nil {
			return nil, err
		}
	}

	logs := convertToLogEntries(lokiResp)

	return &domain.LogQueryResult{
		Logs:       logs,
		TotalCount: len(logs),
		HasMore:    len(logs) >= limit,
	}, nil
}

// GetLogsByContainer retrieves logs for a specific container
func (c *lokiClient) GetLogsByContainer(ctx context.Context, namespace, pod, container string, limit int, duration string) (*domain.LogQueryResult, error) {
	if limit <= 0 {
		limit = 100
	}

	dur, err := parseDuration(duration)
	if err != nil {
		dur = 1 * time.Hour
	}

	end := time.Now()
	start := end.Add(-dur)

	// Try k8s_ prefixed labels first
	query := fmt.Sprintf(`{k8s_namespace_name="%s", k8s_pod_name="%s", k8s_container_name="%s"} |= ""`, namespace, pod, container)

	lokiResp, err := c.queryLokiRange(ctx, query, start, end, limit, "backward")
	if err != nil || len(lokiResp.Data.Result) == 0 {
		// Fallback to standard labels
		query = fmt.Sprintf(`{namespace="%s", pod="%s", container="%s"} |= ""`, namespace, pod, container)
		lokiResp, err = c.queryLokiRange(ctx, query, start, end, limit, "backward")
		if err != nil {
			return nil, err
		}
	}

	logs := convertToLogEntries(lokiResp)

	return &domain.LogQueryResult{
		Logs:       logs,
		TotalCount: len(logs),
		HasMore:    len(logs) >= limit,
	}, nil
}

// GetLogStreamStats gets statistics about log streams
func (c *lokiClient) GetLogStreamStats(ctx context.Context, namespace string, duration string) ([]domain.LogStreamStats, error) {
	dur, err := parseDuration(duration)
	if err != nil {
		dur = 1 * time.Hour
	}

	end := time.Now()
	start := end.Add(-dur)

	// Try k8s_namespace_name first
	query := fmt.Sprintf(`{k8s_namespace_name="%s"} |= ""`, namespace)

	lokiResp, err := c.queryLokiRange(ctx, query, start, end, 5000, "backward")
	if err != nil || len(lokiResp.Data.Result) == 0 {
		// Fallback to standard namespace label
		query = fmt.Sprintf(`{namespace="%s"} |= ""`, namespace)
		lokiResp, err = c.queryLokiRange(ctx, query, start, end, 5000, "backward")
		if err != nil {
			return nil, err
		}
	}

	// Aggregate stats by pod and container
	statsMap := make(map[string]*domain.LogStreamStats)

	for _, result := range lokiResp.Data.Result {
		// Try k8s_ prefixed labels first, fallback to standard labels
		pod := result.Stream["k8s_pod_name"]
		if pod == "" {
			pod = result.Stream["pod"]
		}

		container := result.Stream["k8s_container_name"]
		if container == "" {
			container = result.Stream["container"]
		}

		key := fmt.Sprintf("%s/%s/%s", namespace, pod, container)

		if _, exists := statsMap[key]; !exists {
			statsMap[key] = &domain.LogStreamStats{
				Namespace:    namespace,
				Pod:          pod,
				Container:    container,
				LogCount:     0,
				ErrorCount:   0,
				WarningCount: 0,
			}
		}

		// Count logs and check for errors/warnings
		for _, value := range result.Values {
			if len(value) >= 2 {
				statsMap[key].LogCount++

				logLine := strings.ToLower(value[1])
				if strings.Contains(logLine, "error") || strings.Contains(logLine, "exception") || strings.Contains(logLine, "fatal") {
					statsMap[key].ErrorCount++
				} else if strings.Contains(logLine, "warn") || strings.Contains(logLine, "warning") {
					statsMap[key].WarningCount++
				}
			}
		}
	}

	// Convert map to slice
	var stats []domain.LogStreamStats
	for _, stat := range statsMap {
		stats = append(stats, *stat)
	}

	return stats, nil
}

// GetErrorLogs retrieves logs with error level
func (c *lokiClient) GetErrorLogs(ctx context.Context, namespace string, limit int, duration string) (*domain.LogQueryResult, error) {
	if limit <= 0 {
		limit = 100
	}

	dur, err := parseDuration(duration)
	if err != nil {
		dur = 1 * time.Hour
	}

	end := time.Now()
	start := end.Add(-dur)

	// Query logs containing error keywords using LogQL
	// Try k8s_namespace_name first
	query := fmt.Sprintf(`{k8s_namespace_name="%s"} |~ "(?i)(error|exception|fatal)"`, namespace)

	lokiResp, err := c.queryLokiRange(ctx, query, start, end, limit, "backward")
	if err != nil || len(lokiResp.Data.Result) == 0 {
		// Fallback to standard namespace label
		query = fmt.Sprintf(`{namespace="%s"} |~ "(?i)(error|exception|fatal)"`, namespace)
		lokiResp, err = c.queryLokiRange(ctx, query, start, end, limit, "backward")
		if err != nil {
			return nil, err
		}
	}

	logs := convertToLogEntries(lokiResp)

	return &domain.LogQueryResult{
		Logs:       logs,
		TotalCount: len(logs),
		HasMore:    len(logs) >= limit,
	}, nil
}

// GetProjectContainerLogs retrieves logs for specific containers within a project
func (c *lokiClient) GetProjectContainerLogs(ctx context.Context, projectID string, containerNames []string, limit int, duration string) (*domain.ProjectLogs, error) {
	if limit <= 0 {
		limit = 100
	}

	dur, err := parseDuration(duration)
	if err != nil {
		dur = 1 * time.Hour
	}

	end := time.Now()
	start := end.Add(-dur)

	projectLogs := &domain.ProjectLogs{
		ProjectID:     projectID,
		TotalLogs:     0,
		TotalErrors:   0,
		TotalWarnings: 0,
		Containers:    make([]domain.ContainerLogs, 0, len(containerNames)),
		Timestamp:     time.Now().Unix(),
	}

	// Query logs for each container
	for _, containerName := range containerNames {
		// Build query for this container
		// Try k8s_ labels first
		query := fmt.Sprintf(`{k8s_namespace_name="%s", k8s_container_name="%s"} |= ""`, projectID, containerName)

		lokiResp, err := c.queryLokiRange(ctx, query, start, end, limit, "backward")
		if err != nil || len(lokiResp.Data.Result) == 0 {
			// Fallback to standard labels
			query = fmt.Sprintf(`{namespace="%s", container="%s"} |= ""`, projectID, containerName)
			lokiResp, err = c.queryLokiRange(ctx, query, start, end, limit, "backward")
			if err != nil {
				// If this container has no logs, continue to next one
				projectLogs.Containers = append(projectLogs.Containers, domain.ContainerLogs{
					ContainerName: containerName,
					Logs:          []domain.LogEntry{},
					LogCount:      0,
					ErrorCount:    0,
					WarningCount:  0,
					HasMore:       false,
				})
				continue
			}
		}

		// Convert logs for this container
		logs := convertToLogEntries(lokiResp)

		// Count errors and warnings
		errorCount := 0
		warningCount := 0
		for _, log := range logs {
			logLine := strings.ToLower(log.Log)
			if strings.Contains(logLine, "error") || strings.Contains(logLine, "exception") || strings.Contains(logLine, "fatal") {
				errorCount++
			} else if strings.Contains(logLine, "warn") || strings.Contains(logLine, "warning") {
				warningCount++
			}
		}

		containerLogs := domain.ContainerLogs{
			ContainerName: containerName,
			Logs:          logs,
			LogCount:      len(logs),
			ErrorCount:    errorCount,
			WarningCount:  warningCount,
			HasMore:       len(logs) >= limit,
		}

		projectLogs.Containers = append(projectLogs.Containers, containerLogs)
		projectLogs.TotalLogs += len(logs)
		projectLogs.TotalErrors += errorCount
		projectLogs.TotalWarnings += warningCount
	}

	return projectLogs, nil
}
