package http

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"prometheus-metrics-api/internal/core/domain"

	"github.com/gin-gonic/gin"
)

// mockMetricsService is a mock implementation of ports.MetricsService
type mockMetricsService struct {
	getClusterOverviewFunc      func(ctx context.Context) (*domain.ClusterOverview, error)
	getRequestsMetricFunc       func(ctx context.Context, duration string) (*domain.MetricCard, error)
	getPodsMetricFunc           func(ctx context.Context, duration string) (*domain.MetricCard, error)
	getNodesMetricFunc          func(ctx context.Context, duration string) (*domain.MetricCard, error)
	getTenantsMetricFunc        func(ctx context.Context, duration string) (*domain.MetricCard, error)
	getCPUUtilizationFunc       func(ctx context.Context, duration string) (*domain.ResourceUtilization, error)
	getMemoryUtilizationFunc    func(ctx context.Context, duration string) (*domain.ResourceUtilization, error)
	getNodesFunc                func(ctx context.Context) ([]domain.NodeMetric, error)
	getNamespacesFunc           func(ctx context.Context) ([]domain.NamespaceMetric, error)
	getDatabaseIOMetricsFunc    func(ctx context.Context, duration string) (*domain.DatabaseMetrics, error)
	getProjectUsageMetricsFunc  func(ctx context.Context, projectID string) (*domain.ProjectUsageMetrics, error)
}

func (m *mockMetricsService) GetClusterOverview(ctx context.Context) (*domain.ClusterOverview, error) {
	if m.getClusterOverviewFunc != nil {
		return m.getClusterOverviewFunc(ctx)
	}
	return nil, errors.New("not implemented")
}

func (m *mockMetricsService) GetRequestsMetric(ctx context.Context, duration string) (*domain.MetricCard, error) {
	if m.getRequestsMetricFunc != nil {
		return m.getRequestsMetricFunc(ctx, duration)
	}
	return nil, errors.New("not implemented")
}

func (m *mockMetricsService) GetPodsMetric(ctx context.Context, duration string) (*domain.MetricCard, error) {
	if m.getPodsMetricFunc != nil {
		return m.getPodsMetricFunc(ctx, duration)
	}
	return nil, errors.New("not implemented")
}

func (m *mockMetricsService) GetNodesMetric(ctx context.Context, duration string) (*domain.MetricCard, error) {
	if m.getNodesMetricFunc != nil {
		return m.getNodesMetricFunc(ctx, duration)
	}
	return nil, errors.New("not implemented")
}

func (m *mockMetricsService) GetTenantsMetric(ctx context.Context, duration string) (*domain.MetricCard, error) {
	if m.getTenantsMetricFunc != nil {
		return m.getTenantsMetricFunc(ctx, duration)
	}
	return nil, errors.New("not implemented")
}

func (m *mockMetricsService) GetCPUUtilization(ctx context.Context, duration string) (*domain.ResourceUtilization, error) {
	if m.getCPUUtilizationFunc != nil {
		return m.getCPUUtilizationFunc(ctx, duration)
	}
	return nil, errors.New("not implemented")
}

func (m *mockMetricsService) GetMemoryUtilization(ctx context.Context, duration string) (*domain.ResourceUtilization, error) {
	if m.getMemoryUtilizationFunc != nil {
		return m.getMemoryUtilizationFunc(ctx, duration)
	}
	return nil, errors.New("not implemented")
}

func (m *mockMetricsService) GetNodes(ctx context.Context) ([]domain.NodeMetric, error) {
	if m.getNodesFunc != nil {
		return m.getNodesFunc(ctx)
	}
	return nil, errors.New("not implemented")
}

func (m *mockMetricsService) GetNamespaces(ctx context.Context) ([]domain.NamespaceMetric, error) {
	if m.getNamespacesFunc != nil {
		return m.getNamespacesFunc(ctx)
	}
	return nil, errors.New("not implemented")
}

func (m *mockMetricsService) GetDatabaseIOMetrics(ctx context.Context, duration string) (*domain.DatabaseMetrics, error) {
	if m.getDatabaseIOMetricsFunc != nil {
		return m.getDatabaseIOMetricsFunc(ctx, duration)
	}
	return nil, errors.New("not implemented")
}

func (m *mockMetricsService) GetProjectUsageMetrics(ctx context.Context, projectID string) (*domain.ProjectUsageMetrics, error) {
	if m.getProjectUsageMetricsFunc != nil {
		return m.getProjectUsageMetricsFunc(ctx, projectID)
	}
	return nil, errors.New("not implemented")
}

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	return gin.New()
}

func TestGetOverview_Success(t *testing.T) {
	expectedOverview := &domain.ClusterOverview{
		TotalNodes:         5,
		RunningNodes:       4,
		TotalPods:          50,
		TotalNamespaces:    10,
		CPUUsagePercent:    65.5,
		MemoryUsagePercent: 72.3,
	}

	mockService := &mockMetricsService{
		getClusterOverviewFunc: func(ctx context.Context) (*domain.ClusterOverview, error) {
			return expectedOverview, nil
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/overview", handler.GetOverview)

	req := httptest.NewRequest(http.MethodGet, "/overview", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}

	var response domain.ClusterOverview
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.TotalNodes != expectedOverview.TotalNodes {
		t.Errorf("Expected TotalNodes %d, got %d", expectedOverview.TotalNodes, response.TotalNodes)
	}
}

func TestGetOverview_Error(t *testing.T) {
	mockService := &mockMetricsService{
		getClusterOverviewFunc: func(ctx context.Context) (*domain.ClusterOverview, error) {
			return nil, errors.New("service error")
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/overview", handler.GetOverview)

	req := httptest.NewRequest(http.MethodGet, "/overview", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("Expected status code %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestGetRequestsMetric_Success(t *testing.T) {
	expectedMetric := &domain.MetricCard{
		Title:         "Total Requests",
		Value:         "1.5M",
		RawValue:      1500000,
		ChangePercent: "+12.5%",
		Status:        "healthy",
	}

	mockService := &mockMetricsService{
		getRequestsMetricFunc: func(ctx context.Context, duration string) (*domain.MetricCard, error) {
			if duration != "24h" {
				t.Errorf("Expected duration '24h', got '%s'", duration)
			}
			return expectedMetric, nil
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/metrics/requests", handler.GetRequestsMetric)

	req := httptest.NewRequest(http.MethodGet, "/metrics/requests?duration=24h", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}

	var response domain.MetricCard
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.Title != expectedMetric.Title {
		t.Errorf("Expected Title '%s', got '%s'", expectedMetric.Title, response.Title)
	}
}

func TestGetRequestsMetric_DefaultDuration(t *testing.T) {
	expectedMetric := &domain.MetricCard{
		Title: "Total Requests",
		Value: "1.5M",
	}

	mockService := &mockMetricsService{
		getRequestsMetricFunc: func(ctx context.Context, duration string) (*domain.MetricCard, error) {
			if duration != "1h" {
				t.Errorf("Expected default duration '1h', got '%s'", duration)
			}
			return expectedMetric, nil
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/metrics/requests", handler.GetRequestsMetric)

	req := httptest.NewRequest(http.MethodGet, "/metrics/requests", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}
}

func TestGetCPUUtilization_Success(t *testing.T) {
	expectedUtilization := &domain.ResourceUtilization{
		CurrentValue:  75.5,
		ChangePercent: 5.2,
		Trend:         "up",
	}

	mockService := &mockMetricsService{
		getCPUUtilizationFunc: func(ctx context.Context, duration string) (*domain.ResourceUtilization, error) {
			return expectedUtilization, nil
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/metrics/cpu", handler.GetCPUUtilization)

	req := httptest.NewRequest(http.MethodGet, "/metrics/cpu?duration=12h", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}

	var response domain.ResourceUtilization
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.CurrentValue != expectedUtilization.CurrentValue {
		t.Errorf("Expected CurrentValue %.2f, got %.2f", 
			expectedUtilization.CurrentValue, response.CurrentValue)
	}
}

func TestGetNodes_Success(t *testing.T) {
	expectedNodes := []domain.NodeMetric{
		{
			Name:               "node-1",
			CPUUsagePercent:    60.5,
			MemoryUsagePercent: 70.2,
			PodCount:           15,
			Status:             "Ready",
		},
		{
			Name:               "node-2",
			CPUUsagePercent:    55.3,
			MemoryUsagePercent: 65.8,
			PodCount:           12,
			Status:             "Ready",
		},
	}

	mockService := &mockMetricsService{
		getNodesFunc: func(ctx context.Context) ([]domain.NodeMetric, error) {
			return expectedNodes, nil
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/nodes", handler.GetNodes)

	req := httptest.NewRequest(http.MethodGet, "/nodes", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}

	var response []domain.NodeMetric
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if len(response) != len(expectedNodes) {
		t.Errorf("Expected %d nodes, got %d", len(expectedNodes), len(response))
	}

	if len(response) > 0 && response[0].Name != expectedNodes[0].Name {
		t.Errorf("Expected first node name '%s', got '%s'", expectedNodes[0].Name, response[0].Name)
	}
}

func TestGetNamespaces_Success(t *testing.T) {
	expectedNamespaces := []domain.NamespaceMetric{
		{
			Name:        "default",
			PodCount:    20,
			CPUUsage:    10.5,
			MemoryUsage: 2048.0,
		},
	}

	mockService := &mockMetricsService{
		getNamespacesFunc: func(ctx context.Context) ([]domain.NamespaceMetric, error) {
			return expectedNamespaces, nil
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/namespaces", handler.GetNamespaces)

	req := httptest.NewRequest(http.MethodGet, "/namespaces", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}

	var response []domain.NamespaceMetric
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if len(response) != len(expectedNamespaces) {
		t.Errorf("Expected %d namespaces, got %d", len(expectedNamespaces), len(response))
	}
}

func TestGetDatabaseIOMetrics_Success(t *testing.T) {
	expectedMetrics := &domain.DatabaseMetrics{
		DiskReadBytesPerSec:  1024000.0,
		DiskWriteBytesPerSec: 512000.0,
		Source:               "prometheus",
	}

	mockService := &mockMetricsService{
		getDatabaseIOMetricsFunc: func(ctx context.Context, duration string) (*domain.DatabaseMetrics, error) {
			return expectedMetrics, nil
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/metrics/database", handler.GetDatabaseIOMetrics)

	req := httptest.NewRequest(http.MethodGet, "/metrics/database?duration=6h", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}

	var response domain.DatabaseMetrics
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.DiskReadBytesPerSec != expectedMetrics.DiskReadBytesPerSec {
		t.Errorf("Expected DiskReadBytesPerSec %.2f, got %.2f", 
			expectedMetrics.DiskReadBytesPerSec, response.DiskReadBytesPerSec)
	}
}

func TestGetPodsMetric_Success(t *testing.T) {
	expectedMetric := &domain.MetricCard{
		Title:    "Total Pods",
		Value:    "150",
		RawValue: 150,
		Status:   "healthy",
	}

	mockService := &mockMetricsService{
		getPodsMetricFunc: func(ctx context.Context, duration string) (*domain.MetricCard, error) {
			return expectedMetric, nil
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/metrics/pods", handler.GetPodsMetric)

	req := httptest.NewRequest(http.MethodGet, "/metrics/pods?duration=12h", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}

	var response domain.MetricCard
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.Title != expectedMetric.Title {
		t.Errorf("Expected Title '%s', got '%s'", expectedMetric.Title, response.Title)
	}
}

func TestGetPodsMetric_Error(t *testing.T) {
	mockService := &mockMetricsService{
		getPodsMetricFunc: func(ctx context.Context, duration string) (*domain.MetricCard, error) {
			return nil, errors.New("pods error")
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/metrics/pods", handler.GetPodsMetric)

	req := httptest.NewRequest(http.MethodGet, "/metrics/pods", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("Expected status code %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestGetNodesMetric_Success(t *testing.T) {
	expectedMetric := &domain.MetricCard{
		Title:    "Total Nodes",
		Value:    "5",
		RawValue: 5,
		Status:   "healthy",
	}

	mockService := &mockMetricsService{
		getNodesMetricFunc: func(ctx context.Context, duration string) (*domain.MetricCard, error) {
			return expectedMetric, nil
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/metrics/nodes", handler.GetNodesMetric)

	req := httptest.NewRequest(http.MethodGet, "/metrics/nodes?duration=6h", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}
}

func TestGetNodesMetric_Error(t *testing.T) {
	mockService := &mockMetricsService{
		getNodesMetricFunc: func(ctx context.Context, duration string) (*domain.MetricCard, error) {
			return nil, errors.New("nodes error")
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/metrics/nodes", handler.GetNodesMetric)

	req := httptest.NewRequest(http.MethodGet, "/metrics/nodes", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("Expected status code %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestGetTenantsMetric_Success(t *testing.T) {
	expectedMetric := &domain.MetricCard{
		Title:    "Total Tenants",
		Value:    "25",
		RawValue: 25,
		Status:   "healthy",
	}

	mockService := &mockMetricsService{
		getTenantsMetricFunc: func(ctx context.Context, duration string) (*domain.MetricCard, error) {
			return expectedMetric, nil
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/metrics/tenants", handler.GetTenantsMetric)

	req := httptest.NewRequest(http.MethodGet, "/metrics/tenants?duration=24h", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}
}

func TestGetTenantsMetric_Error(t *testing.T) {
	mockService := &mockMetricsService{
		getTenantsMetricFunc: func(ctx context.Context, duration string) (*domain.MetricCard, error) {
			return nil, errors.New("tenants error")
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/metrics/tenants", handler.GetTenantsMetric)

	req := httptest.NewRequest(http.MethodGet, "/metrics/tenants", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("Expected status code %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestGetRequestsMetric_Error(t *testing.T) {
	mockService := &mockMetricsService{
		getRequestsMetricFunc: func(ctx context.Context, duration string) (*domain.MetricCard, error) {
			return nil, errors.New("requests error")
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/metrics/requests", handler.GetRequestsMetric)

	req := httptest.NewRequest(http.MethodGet, "/metrics/requests", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("Expected status code %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestGetCPUUtilization_Error(t *testing.T) {
	mockService := &mockMetricsService{
		getCPUUtilizationFunc: func(ctx context.Context, duration string) (*domain.ResourceUtilization, error) {
			return nil, errors.New("cpu error")
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/metrics/cpu", handler.GetCPUUtilization)

	req := httptest.NewRequest(http.MethodGet, "/metrics/cpu", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("Expected status code %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestGetMemoryUtilization_Success(t *testing.T) {
	expectedUtilization := &domain.ResourceUtilization{
		CurrentValue:  82.3,
		ChangePercent: 3.5,
		Trend:         "stable",
	}

	mockService := &mockMetricsService{
		getMemoryUtilizationFunc: func(ctx context.Context, duration string) (*domain.ResourceUtilization, error) {
			return expectedUtilization, nil
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/metrics/memory", handler.GetMemoryUtilization)

	req := httptest.NewRequest(http.MethodGet, "/metrics/memory?duration=12h", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}
}

func TestGetMemoryUtilization_Error(t *testing.T) {
	mockService := &mockMetricsService{
		getMemoryUtilizationFunc: func(ctx context.Context, duration string) (*domain.ResourceUtilization, error) {
			return nil, errors.New("memory error")
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/metrics/memory", handler.GetMemoryUtilization)

	req := httptest.NewRequest(http.MethodGet, "/metrics/memory", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("Expected status code %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestGetNodes_Error(t *testing.T) {
	mockService := &mockMetricsService{
		getNodesFunc: func(ctx context.Context) ([]domain.NodeMetric, error) {
			return nil, errors.New("nodes error")
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/nodes", handler.GetNodes)

	req := httptest.NewRequest(http.MethodGet, "/nodes", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("Expected status code %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestGetNamespaces_Error(t *testing.T) {
	mockService := &mockMetricsService{
		getNamespacesFunc: func(ctx context.Context) ([]domain.NamespaceMetric, error) {
			return nil, errors.New("namespaces error")
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/namespaces", handler.GetNamespaces)

	req := httptest.NewRequest(http.MethodGet, "/namespaces", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("Expected status code %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestGetDatabaseIOMetrics_Error(t *testing.T) {
	mockService := &mockMetricsService{
		getDatabaseIOMetricsFunc: func(ctx context.Context, duration string) (*domain.DatabaseMetrics, error) {
			return nil, errors.New("database error")
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/metrics/database", handler.GetDatabaseIOMetrics)

	req := httptest.NewRequest(http.MethodGet, "/metrics/database", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("Expected status code %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestGetProjectUsageMetrics_Success(t *testing.T) {
	expectedMetrics := &domain.ProjectUsageMetrics{
		ProjectID:         "project-123",
		MemoryUsageGB:     8.5,
		CPURequestCores:   2.0,
		Window:            "30d",
	}

	mockService := &mockMetricsService{
		getProjectUsageMetricsFunc: func(ctx context.Context, projectID string) (*domain.ProjectUsageMetrics, error) {
			if projectID != "project-123" {
				t.Errorf("Expected projectID 'project-123', got '%s'", projectID)
			}
			return expectedMetrics, nil
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/projects/:projectID/usage", handler.GetProjectUsageMetrics)

	req := httptest.NewRequest(http.MethodGet, "/projects/project-123/usage", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}

	var response domain.ProjectUsageMetrics
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.ProjectID != expectedMetrics.ProjectID {
		t.Errorf("Expected ProjectID '%s', got '%s'", expectedMetrics.ProjectID, response.ProjectID)
	}

	if response.MemoryUsageGB != expectedMetrics.MemoryUsageGB {
		t.Errorf("Expected MemoryUsageGB %.2f, got %.2f", expectedMetrics.MemoryUsageGB, response.MemoryUsageGB)
	}

	if response.CPURequestCores != expectedMetrics.CPURequestCores {
		t.Errorf("Expected CPURequestCores %.2f, got %.2f", expectedMetrics.CPURequestCores, response.CPURequestCores)
	}
}

func TestGetProjectUsageMetrics_Error(t *testing.T) {
	mockService := &mockMetricsService{
		getProjectUsageMetricsFunc: func(ctx context.Context, projectID string) (*domain.ProjectUsageMetrics, error) {
			return nil, errors.New("project usage error")
		},
	}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/projects/:projectID/usage", handler.GetProjectUsageMetrics)

	req := httptest.NewRequest(http.MethodGet, "/projects/project-123/usage", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("Expected status code %d, got %d", http.StatusInternalServerError, w.Code)
	}
}

func TestGetProjectUsageMetrics_MissingProjectID(t *testing.T) {
	mockService := &mockMetricsService{}

	handler := NewMetricsHandler(mockService)
	router := setupTestRouter()
	router.GET("/projects/:projectID/usage", handler.GetProjectUsageMetrics)

	req := httptest.NewRequest(http.MethodGet, "/projects//usage", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status code %d, got %d", http.StatusBadRequest, w.Code)
	}
}
