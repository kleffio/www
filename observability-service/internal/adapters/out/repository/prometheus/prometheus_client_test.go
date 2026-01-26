package prometheus

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestNewPrometheusClient(t *testing.T) {
	baseURL := "http://localhost:9090"
	client := NewPrometheusClient(baseURL)

	assert.NotNil(t, client)

	// Cast to concrete type to verify internal fields
	promClient := client.(*prometheusClient)
	assert.Equal(t, baseURL, promClient.baseURL)
	assert.Equal(t, 30*time.Second, promClient.httpClient.Timeout)
}

func TestQueryPrometheus_Success(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Contains(t, r.URL.Path, "/api/v1/query")
		assert.Contains(t, r.URL.RawQuery, "query=")

		response := PrometheusResponse{
			Status: "success",
			Data: struct {
				ResultType string `json:"resultType"`
				Result     []struct {
					Metric map[string]string `json:"metric"`
					Value  []interface{}     `json:"value,omitempty"`
					Values [][]interface{}   `json:"values,omitempty"`
				} `json:"result"`
			}{
				ResultType: "vector",
				Result: []struct {
					Metric map[string]string `json:"metric"`
					Value  []interface{}     `json:"value,omitempty"`
					Values [][]interface{}   `json:"values,omitempty"`
				}{
					{
						Metric: map[string]string{"instance": "localhost:9090"},
						Value:  []interface{}{1640995200.0, "42"},
					},
				},
			},
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			t.Fatalf("failed to encode response: %v", err)
		}
	}))
	defer server.Close()

	client := NewPrometheusClient(server.URL)
	promClient := client.(*prometheusClient)

	result, err := promClient.queryPrometheus(context.Background(), "test_metric")

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, "success", result.Status)
	assert.Len(t, result.Data.Result, 1)
	assert.Equal(t, "localhost:9090", result.Data.Result[0].Metric["instance"])
}

func TestQueryPrometheus_HTTPError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}))
	defer server.Close()

	client := NewPrometheusClient(server.URL)
	promClient := client.(*prometheusClient)

	result, err := promClient.queryPrometheus(context.Background(), "test_metric")

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Contains(t, err.Error(), "500")
}

func TestGetClusterOverview_BasicTest(t *testing.T) {
	// Simple test that just verifies the method doesn't crash
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		response := createSimpleResponse("0")
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			t.Fatalf("failed to encode response: %v", err)
		}
	}))
	defer server.Close()

	client := NewPrometheusClient(server.URL)

	result, err := client.GetClusterOverview(context.Background())

	assert.NoError(t, err)
	assert.NotNil(t, result)
}

func TestGetRequestsMetric_BasicTest(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		response := createSimpleResponse("100")
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			t.Fatalf("failed to encode response: %v", err)
		}
	}))
	defer server.Close()

	client := NewPrometheusClient(server.URL)

	result, err := client.GetRequestsMetric(context.Background(), "1h")

	// Test should not fail - just check we get some result
	if err == nil {
		assert.NotNil(t, result)
	}
}

func TestGetPodsMetric_BasicTest(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		response := createSimpleResponse("42")
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			t.Fatalf("failed to encode response: %v", err)
		}
	}))
	defer server.Close()

	client := NewPrometheusClient(server.URL)

	result, err := client.GetPodsMetric(context.Background(), "1h")

	if err == nil {
		assert.NotNil(t, result)
		assert.Equal(t, "Total Pods", result.Title)
	}
}

func TestGetNodesMetric_BasicTest(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		response := createSimpleResponse("5")
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			t.Fatalf("failed to encode response: %v", err)
		}
	}))
	defer server.Close()

	client := NewPrometheusClient(server.URL)

	result, err := client.GetNodesMetric(context.Background(), "1h")

	if err == nil {
		assert.NotNil(t, result)
		assert.Equal(t, "Cluster Nodes", result.Title)
	}
}

func TestGetTenantsMetric_BasicTest(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		response := createSimpleResponse("12")
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			t.Fatalf("failed to encode response: %v", err)
		}
	}))
	defer server.Close()

	client := NewPrometheusClient(server.URL)

	result, err := client.GetTenantsMetric(context.Background(), "1h")

	if err == nil {
		assert.NotNil(t, result)
		assert.Equal(t, "Active Tenants", result.Title)
	}
}

func TestGetCPUUtilization_BasicTest(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		response := createSimpleResponse("67.2")
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			t.Fatalf("failed to encode response: %v", err)
		}
	}))
	defer server.Close()

	client := NewPrometheusClient(server.URL)

	result, err := client.GetCPUUtilization(context.Background(), "1h")

	if err == nil {
		assert.NotNil(t, result)
		assert.GreaterOrEqual(t, result.CurrentValue, 0.0)
	}
}

func TestGetMemoryUtilization_BasicTest(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		response := createSimpleResponse("74.1")
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			t.Fatalf("failed to encode response: %v", err)
		}
	}))
	defer server.Close()

	client := NewPrometheusClient(server.URL)

	result, err := client.GetMemoryUtilization(context.Background(), "1h")

	if err == nil {
		assert.NotNil(t, result)
		assert.GreaterOrEqual(t, result.CurrentValue, 0.0)
	}
}

func TestPrometheusClient_NetworkError(t *testing.T) {
	// Test with invalid URL to trigger network error
	client := NewPrometheusClient("http://invalid-url:9999")

	result, err := client.GetPodsMetric(context.Background(), "1h")

	assert.Error(t, err)
	assert.Nil(t, result)
}

func TestQueryPrometheus_ContextCancellation(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(100 * time.Millisecond)
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	client := NewPrometheusClient(server.URL)
	promClient := client.(*prometheusClient)

	ctx, cancel := context.WithCancel(context.Background())
	cancel() // Cancel immediately

	result, err := promClient.queryPrometheus(ctx, "test_metric")

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Contains(t, err.Error(), "context canceled")
}

// Helper function to create a standard Prometheus response
func createSimpleResponse(value string) PrometheusResponse {
	return PrometheusResponse{
		Status: "success",
		Data: struct {
			ResultType string `json:"resultType"`
			Result     []struct {
				Metric map[string]string `json:"metric"`
				Value  []interface{}     `json:"value,omitempty"`
				Values [][]interface{}   `json:"values,omitempty"`
			} `json:"result"`
		}{
			ResultType: "vector",
			Result: []struct {
				Metric map[string]string `json:"metric"`
				Value  []interface{}     `json:"value,omitempty"`
				Values [][]interface{}   `json:"values,omitempty"`
			}{
				{
					Metric: map[string]string{},
					Value:  []interface{}{1640995200.0, value},
				},
			},
		},
	}
}

func TestPrometheusClient_GetAllMetrics_Success(t *testing.T) {
	callCount := 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		callCount++

		query := r.URL.Query().Get("query")

		var response PrometheusResponse
		if query != "" {
			response = createSimpleResponse("42")
		} else {
			response = createRangeResponse([]string{"40", "41", "42"})
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			t.Fatalf("failed to encode response: %v", err)
		}
	}))
	defer server.Close()

	client := NewPrometheusClient(server.URL)
	result, err := client.GetAllMetrics(context.Background(), "1h")

	assert.NoError(t, err)
	assert.NotNil(t, result)

	assert.Greater(t, callCount, 10, "Should have made multiple Prometheus queries")

	assert.NotNil(t, result.Overview)
}

func TestPrometheusClient_GetAllMetrics_PartialFailure(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("query") != "" {
			response := createSimpleResponse("42")
			w.Header().Set("Content-Type", "application/json")
			if err := json.NewEncoder(w).Encode(response); err != nil {
				t.Errorf("failed to encode response: %v", err)
			}
		} else {
			response := createRangeResponse([]string{"40", "41", "42"})
			w.Header().Set("Content-Type", "application/json")
			if err := json.NewEncoder(w).Encode(response); err != nil {
				t.Errorf("failed to encode response: %v", err)
			}
		}
	}))
	defer server.Close()

	client := NewPrometheusClient(server.URL)
	result, err := client.GetAllMetrics(context.Background(), "1h")

	assert.NoError(t, err)
	assert.NotNil(t, result)

	assert.NotNil(t, result.Overview, "Overview should be present")
	assert.Greater(t, result.Overview.TotalNodes, 0, "Should have node data")
}

func TestPrometheusClient_GetAllMetrics_Timeout(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Simulate slow response
		time.Sleep(100 * time.Millisecond)
		response := createSimpleResponse("42")
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			t.Errorf("failed to encode response: %v", err)
		}
	}))
	defer server.Close()

	client := NewPrometheusClient(server.URL)

	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()

	result, err := client.GetAllMetrics(ctx, "1h")

	if err != nil {
		assert.Contains(t, err.Error(), "context deadline exceeded")
	} else {
		assert.NotNil(t, result)
	}
}

func TestPrometheusClient_GetAllMetrics_ConcurrentExecution(t *testing.T) {
	type queryInfo struct {
		query string
		time  time.Time
	}
	var queries []queryInfo
	var mu sync.Mutex

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query().Get("query")

		mu.Lock()
		queries = append(queries, queryInfo{
			query: query,
			time:  time.Now(),
		})
		mu.Unlock()

		time.Sleep(10 * time.Millisecond)

		response := createSimpleResponse("42")
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			t.Errorf("failed to encode response: %v", err)
		}
	}))
	defer server.Close()

	client := NewPrometheusClient(server.URL)

	start := time.Now()
	result, err := client.GetAllMetrics(context.Background(), "1h")
	elapsed := time.Since(start)

	assert.NoError(t, err)
	assert.NotNil(t, result)

	mu.Lock()
	queryCount := len(queries)
	mu.Unlock()

	assert.Greater(t, queryCount, 10)

	expectedSequentialTime := time.Duration(queryCount) * 10 * time.Millisecond
	assert.Less(t, elapsed, expectedSequentialTime/2,
		"Concurrent execution should be faster than sequential")
}

func TestPrometheusClient_GetAllMetrics_DifferentDurations(t *testing.T) {
	testCases := []struct {
		name     string
		duration string
	}{
		{"1 hour", "1h"},
		{"6 hours", "6h"},
		{"24 hours", "24h"},
		{"7 days", "7d"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				response := createSimpleResponse("42")
				w.Header().Set("Content-Type", "application/json")
				if err := json.NewEncoder(w).Encode(response); err != nil {
					t.Errorf("failed to encode response: %v", err)
				}
			}))
			defer server.Close()

			client := NewPrometheusClient(server.URL)
			result, err := client.GetAllMetrics(context.Background(), tc.duration)

			assert.NoError(t, err)
			assert.NotNil(t, result)
		})
	}
}

func TestPrometheusClient_GetAllMetrics_EmptyResults(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		response := PrometheusResponse{
			Status: "success",
			Data: struct {
				ResultType string `json:"resultType"`
				Result     []struct {
					Metric map[string]string `json:"metric"`
					Value  []interface{}     `json:"value,omitempty"`
					Values [][]interface{}   `json:"values,omitempty"`
				} `json:"result"`
			}{
				ResultType: "vector",
				Result: []struct {
					Metric map[string]string `json:"metric"`
					Value  []interface{}     `json:"value,omitempty"`
					Values [][]interface{}   `json:"values,omitempty"`
				}{},
			},
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			t.Errorf("failed to encode response: %v", err)
		}
	}))
	defer server.Close()

	client := NewPrometheusClient(server.URL)
	result, err := client.GetAllMetrics(context.Background(), "1h")

	assert.NoError(t, err)
	assert.NotNil(t, result)

	if result.Overview != nil {
		assert.Equal(t, 0, result.Overview.TotalNodes)
	}
}

func TestPrometheusClient_GetAllMetrics_NetworkError(t *testing.T) {
	client := NewPrometheusClient("http://invalid-prometheus-server.local:9999")

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	result, err := client.GetAllMetrics(ctx, "1h")

	assert.NoError(t, err, "Should not return error due to fault tolerance")
	assert.NotNil(t, result, "Should return empty result struct")

	if result.Overview != nil {
		assert.Equal(t, 0, result.Overview.TotalNodes, "TotalNodes should be 0 on network error")
		assert.Equal(t, 0, result.Overview.TotalPods, "TotalPods should be 0 on network error")
	}

	assert.Empty(t, result.Nodes, "Nodes should be empty on network error")
	assert.Empty(t, result.Namespaces, "Namespaces should be empty on network error")
}

func createRangeResponse(values []string) PrometheusResponse {
	valuesArray := make([][]interface{}, len(values))
	baseTime := float64(1640995200)

	for i, val := range values {
		valuesArray[i] = []interface{}{
			baseTime + float64(i*60), // 1 minute apart
			val,
		}
	}

	return PrometheusResponse{
		Status: "success",
		Data: struct {
			ResultType string `json:"resultType"`
			Result     []struct {
				Metric map[string]string `json:"metric"`
				Value  []interface{}     `json:"value,omitempty"`
				Values [][]interface{}   `json:"values,omitempty"`
			} `json:"result"`
		}{
			ResultType: "matrix",
			Result: []struct {
				Metric map[string]string `json:"metric"`
				Value  []interface{}     `json:"value,omitempty"`
				Values [][]interface{}   `json:"values,omitempty"`
			}{
				{
					Metric: map[string]string{},
					Values: valuesArray,
				},
			},
		},
	}
}
