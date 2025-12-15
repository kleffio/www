package http

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"prometheus-metrics-api/internal/core/domain"

	"github.com/gin-gonic/gin"
)

func TestSetupRouter(t *testing.T) {
	mockService := &mockMetricsService{
		getClusterOverviewFunc: func(ctx context.Context) (*domain.ClusterOverview, error) {
			return &domain.ClusterOverview{TotalNodes: 5}, nil
		},
	}

	handler := NewMetricsHandler(mockService)
	router := SetupRouter(handler)

	if router == nil {
		t.Fatal("Expected router to be created, got nil")
	}

	// Test that router is properly configured with Gin
	if gin.Mode() != gin.TestMode {
		gin.SetMode(gin.TestMode)
	}
}

func TestHealthEndpoint(t *testing.T) {
	mockService := &mockMetricsService{}
	handler := NewMetricsHandler(mockService)
	router := SetupRouter(handler)

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}

	expectedBody := `{"status":"healthy"}`
	if w.Body.String() != expectedBody {
		t.Errorf("Expected body '%s', got '%s'", expectedBody, w.Body.String())
	}
}

func TestRouteGroupSetup(t *testing.T) {
	mockService := &mockMetricsService{
		getClusterOverviewFunc: func(ctx context.Context) (*domain.ClusterOverview, error) {
			return &domain.ClusterOverview{
				TotalNodes:      5,
				RunningNodes:    4,
				TotalPods:       50,
				TotalNamespaces: 10,
			}, nil
		},
	}

	handler := NewMetricsHandler(mockService)
	router := SetupRouter(handler)

	// Test that the /api/v1/systems group is working
	req := httptest.NewRequest(http.MethodGet, "/api/v1/systems/overview", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d for /api/v1/systems/overview, got %d", http.StatusOK, w.Code)
	}
}

func TestCORSConfiguration(t *testing.T) {
	mockService := &mockMetricsService{}
	handler := NewMetricsHandler(mockService)
	router := SetupRouter(handler)

	// Test OPTIONS request (preflight)
	req := httptest.NewRequest(http.MethodOptions, "/api/v1/systems/overview", nil)
	req.Header.Set("Origin", "http://localhost:5173")
	req.Header.Set("Access-Control-Request-Method", "GET")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	// CORS should allow the request
	allowOrigin := w.Header().Get("Access-Control-Allow-Origin")
	if allowOrigin == "" {
		t.Error("Expected CORS headers to be set")
	}
}

func TestAllRoutes(t *testing.T) {
	mockService := &mockMetricsService{
		getRequestsMetricFunc: func(ctx context.Context, duration string) (*domain.MetricCard, error) {
			return &domain.MetricCard{Title: "Requests"}, nil
		},
		getPodsMetricFunc: func(ctx context.Context, duration string) (*domain.MetricCard, error) {
			return &domain.MetricCard{Title: "Pods"}, nil
		},
		getNodesMetricFunc: func(ctx context.Context, duration string) (*domain.MetricCard, error) {
			return &domain.MetricCard{Title: "Nodes"}, nil
		},
		getTenantsMetricFunc: func(ctx context.Context, duration string) (*domain.MetricCard, error) {
			return &domain.MetricCard{Title: "Tenants"}, nil
		},
		getCPUUtilizationFunc: func(ctx context.Context, duration string) (*domain.ResourceUtilization, error) {
			return &domain.ResourceUtilization{CurrentValue: 75}, nil
		},
		getMemoryUtilizationFunc: func(ctx context.Context, duration string) (*domain.ResourceUtilization, error) {
			return &domain.ResourceUtilization{CurrentValue: 80}, nil
		},
		getNodesFunc: func(ctx context.Context) ([]domain.NodeMetric, error) {
			return []domain.NodeMetric{{Name: "node-1"}}, nil
		},
		getNamespacesFunc: func(ctx context.Context) ([]domain.NamespaceMetric, error) {
			return []domain.NamespaceMetric{{Name: "default"}}, nil
		},
		getDatabaseIOMetricsFunc: func(ctx context.Context, duration string) (*domain.DatabaseMetrics, error) {
			return &domain.DatabaseMetrics{Source: "prometheus"}, nil
		},
	}

	handler := NewMetricsHandler(mockService)
	router := SetupRouter(handler)

	routes := []string{
		"/api/v1/systems/requests-metric",
		"/api/v1/systems/pods-metric",
		"/api/v1/systems/nodes-metric",
		"/api/v1/systems/tenants-metric",
		"/api/v1/systems/cpu",
		"/api/v1/systems/memory",
		"/api/v1/systems/nodes",
		"/api/v1/systems/namespaces",
		"/api/v1/systems/database-io",
	}

	for _, route := range routes {
		req := httptest.NewRequest(http.MethodGet, route, nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Route %s returned status %d, expected %d", route, w.Code, http.StatusOK)
		}
	}
}
