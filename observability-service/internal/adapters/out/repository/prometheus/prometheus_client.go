package prometheus

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"prometheus-metrics-api/internal/core/domain"
	"prometheus-metrics-api/internal/core/ports"
)

type prometheusClient struct {
	baseURL    string
	httpClient *http.Client
}

// NewPrometheusClient creates a new Prometheus client
func NewPrometheusClient(baseURL string) ports.MetricsRepository {
	return &prometheusClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// PrometheusResponse represents the response from Prometheus API
type PrometheusResponse struct {
	Status string `json:"status"`
	Data   struct {
		ResultType string `json:"resultType"`
		Result     []struct {
			Metric map[string]string `json:"metric"`
			Value  []interface{}     `json:"value,omitempty"`
			Values [][]interface{}   `json:"values,omitempty"`
		} `json:"result"`
	} `json:"data"`
}

// queryPrometheus executes a PromQL query
func (c *prometheusClient) queryPrometheus(ctx context.Context, query string) (*PrometheusResponse, error) {
	encodedQuery := url.QueryEscape(query)
	apiURL := fmt.Sprintf("%s/api/v1/query?query=%s", c.baseURL, encodedQuery)

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
		return nil, fmt.Errorf("prometheus returned status %d: %s", resp.StatusCode, string(body))
	}

	var promResp PrometheusResponse
	if err := json.NewDecoder(resp.Body).Decode(&promResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &promResp, nil
}

// queryPrometheusRange executes a PromQL range query
func (c *prometheusClient) queryPrometheusRange(ctx context.Context, query, duration string) (*PrometheusResponse, error) {
	now := time.Now()

	// Parse duration (e.g., "1h", "24h")
	dur, err := time.ParseDuration(duration)
	if err != nil {
		dur = 1 * time.Hour // default to 1 hour
	}

	start := now.Add(-dur).Unix()
	end := now.Unix()
	step := calculateStep(dur)

	encodedQuery := url.QueryEscape(query)
	apiURL := fmt.Sprintf("%s/api/v1/query_range?query=%s&start=%d&end=%d&step=%s",
		c.baseURL, encodedQuery, start, end, step)

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
		return nil, fmt.Errorf("prometheus returned status %d: %s", resp.StatusCode, string(body))
	}

	var promResp PrometheusResponse
	if err := json.NewDecoder(resp.Body).Decode(&promResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &promResp, nil
}

// calculateStep determines the appropriate step size based on duration
func calculateStep(duration time.Duration) string {
	if duration <= 1*time.Hour {
		return "30s"
	} else if duration <= 6*time.Hour {
		return "1m"
	} else if duration <= 24*time.Hour {
		return "5m"
	}
	return "15m"
}

// extractValue extracts a float64 value from Prometheus response
func extractValue(value []interface{}) (float64, error) {
	if len(value) < 2 {
		return 0, fmt.Errorf("invalid value format")
	}

	switch v := value[1].(type) {
	case string:
		return strconv.ParseFloat(v, 64)
	case float64:
		return v, nil
	default:
		return 0, fmt.Errorf("unexpected value type: %T", value[1])
	}
}

// extractTimeSeries converts Prometheus values to TimeSeriesDataPoint slice
func extractTimeSeries(values [][]interface{}) []domain.TimeSeriesDataPoint {
	result := make([]domain.TimeSeriesDataPoint, 0, len(values))

	for _, v := range values {
		if len(v) < 2 {
			continue
		}

		timestamp, ok := v[0].(float64)
		if !ok {
			continue
		}

		value, err := extractValue(v)
		if err != nil {
			continue
		}

		result = append(result, domain.TimeSeriesDataPoint{
			Timestamp: int64(timestamp * 1000), // Convert to milliseconds
			Value:     value,
		})
	}

	return result
}

// calculateChangePercent calculates percentage change between two values
func calculateChangePercent(current, previous float64) float64 {
	if previous == 0 {
		return 0
	}
	return ((current - previous) / previous) * 100
}

// determineStatus determines the status based on value and thresholds
func determineStatus(value float64, warningThreshold, criticalThreshold float64) string {
	if value >= criticalThreshold {
		return "critical"
	} else if value >= warningThreshold {
		return "warning"
	} else if value >= warningThreshold*0.5 {
		return "good"
	}
	return "excellent"
}

// formatValue formats a numeric value to a human-readable string
func formatValue(value float64, unit string) string {
	if unit == "percent" {
		return fmt.Sprintf("%.1f%%", value)
	} else if unit == "count" {
		return fmt.Sprintf("%.0f", value)
	} else if unit == "bytes" {
		return formatBytes(value)
	}
	return fmt.Sprintf("%.2f", value)
}

// formatBytes formats bytes to human-readable format
func formatBytes(bytes float64) string {
	units := []string{"B", "KB", "MB", "GB", "TB"}
	if bytes == 0 {
		return "0 B"
	}

	i := int(math.Floor(math.Log(bytes) / math.Log(1024)))
	if i >= len(units) {
		i = len(units) - 1
	}

	value := bytes / math.Pow(1024, float64(i))
	return fmt.Sprintf("%.2f %s", value, units[i])
}
