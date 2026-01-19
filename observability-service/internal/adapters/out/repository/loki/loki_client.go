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

func parseDuration(duration string) (time.Duration, error) {
	dur, err := time.ParseDuration(duration)
	if err != nil {
		return 1 * time.Hour, fmt.Errorf("invalid duration format: %w", err)
	}
	return dur, nil
}

func convertToLogEntries(lokiResp *LokiResponse) []domain.LogEntry {
	var logs []domain.LogEntry

	for _, result := range lokiResp.Data.Result {
		for _, value := range result.Values {
			if len(value) >= 2 {

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

func (c *lokiClient) QueryLogs(ctx context.Context, params domain.LogQueryParams) (*domain.LogQueryResult, error) {
	query := params.Query
	if query == "" {
		return nil, fmt.Errorf("query cannot be empty")
	}

	end := time.Now()
	start := end.Add(-1 * time.Hour)

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

	query := `{k8s_namespace_name=~".+"} |= ""`

	lokiResp, err := c.queryLokiRange(ctx, query, start, end, limit, "backward")
	if err != nil {

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

	query := fmt.Sprintf(`{k8s_namespace_name="%s"} |= ""`, projectID)

	lokiResp, err := c.queryLokiRange(ctx, query, start, end, limit, "backward")
	if err != nil || len(lokiResp.Data.Result) == 0 {

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

	query := fmt.Sprintf(`{k8s_namespace_name="%s"} |= ""`, namespace)

	lokiResp, err := c.queryLokiRange(ctx, query, start, end, limit, "backward")
	if err != nil || len(lokiResp.Data.Result) == 0 {

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

	query := fmt.Sprintf(`{k8s_namespace_name="%s", k8s_pod_name="%s"} |= ""`, namespace, pod)

	lokiResp, err := c.queryLokiRange(ctx, query, start, end, limit, "backward")
	if err != nil || len(lokiResp.Data.Result) == 0 {

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

	query := fmt.Sprintf(`{k8s_namespace_name="%s", k8s_pod_name="%s", k8s_container_name="%s"} |= ""`, namespace, pod, container)

	lokiResp, err := c.queryLokiRange(ctx, query, start, end, limit, "backward")
	if err != nil || len(lokiResp.Data.Result) == 0 {

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

func (c *lokiClient) GetLogStreamStats(ctx context.Context, namespace string, duration string) ([]domain.LogStreamStats, error) {
	dur, err := parseDuration(duration)
	if err != nil {
		dur = 1 * time.Hour
	}

	end := time.Now()
	start := end.Add(-dur)

	query := fmt.Sprintf(`{k8s_namespace_name="%s"} |= ""`, namespace)

	lokiResp, err := c.queryLokiRange(ctx, query, start, end, 5000, "backward")
	if err != nil || len(lokiResp.Data.Result) == 0 {

		query = fmt.Sprintf(`{namespace="%s"} |= ""`, namespace)
		lokiResp, err = c.queryLokiRange(ctx, query, start, end, 5000, "backward")
		if err != nil {
			return nil, err
		}
	}

	statsMap := make(map[string]*domain.LogStreamStats)

	for _, result := range lokiResp.Data.Result {

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

	var stats []domain.LogStreamStats
	for _, stat := range statsMap {
		stats = append(stats, *stat)
	}

	return stats, nil
}

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

	query := fmt.Sprintf(`{k8s_namespace_name="%s"} |~ "(?i)(error|exception|fatal)"`, namespace)

	lokiResp, err := c.queryLokiRange(ctx, query, start, end, limit, "backward")
	if err != nil || len(lokiResp.Data.Result) == 0 {

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

	for _, containerName := range containerNames {

		query := fmt.Sprintf(`{k8s_namespace_name="%s", k8s_deployment_name="app-%s"} |= ""`, projectID, containerName)

		lokiResp, err := c.queryLokiRange(ctx, query, start, end, limit, "backward")
		if err != nil || len(lokiResp.Data.Result) == 0 {

			query = fmt.Sprintf(`{namespace="%s", deployment="app-%s"} |= ""`, projectID, containerName)
			lokiResp, err = c.queryLokiRange(ctx, query, start, end, limit, "backward")
			if err != nil {

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

		logs := convertToLogEntries(lokiResp)

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
