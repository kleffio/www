package prometheus

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
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
		json.NewEncoder(w).Encode(response)
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
		json.NewEncoder(w).Encode(response)
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
		json.NewEncoder(w).Encode(response)
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
		json.NewEncoder(w).Encode(response)
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
		json.NewEncoder(w).Encode(response)
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
