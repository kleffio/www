package http

import (
	"net/http"

	"prometheus-metrics-api/internal/core/ports"

	"github.com/gin-gonic/gin"
)

type MetricsHandler struct {
	metricsService ports.MetricsService
}

func NewMetricsHandler(metricsService ports.MetricsService) *MetricsHandler {
	return &MetricsHandler{
		metricsService: metricsService,
	}
}

// GetOverview handles GET /api/metrics/overview
func (h *MetricsHandler) GetOverview(c *gin.Context) {
	overview, err := h.metricsService.GetClusterOverview(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, overview)
}

// GetRequestsMetric handles GET /api/metrics/requests-metric
func (h *MetricsHandler) GetRequestsMetric(c *gin.Context) {
	duration := c.DefaultQuery("duration", "1h")

	metric, err := h.metricsService.GetRequestsMetric(c.Request.Context(), duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, metric)
}

// GetPodsMetric handles GET /api/metrics/pods-metric
func (h *MetricsHandler) GetPodsMetric(c *gin.Context) {
	duration := c.DefaultQuery("duration", "1h")

	metric, err := h.metricsService.GetPodsMetric(c.Request.Context(), duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, metric)
}

// GetNodesMetric handles GET /api/metrics/nodes-metric
func (h *MetricsHandler) GetNodesMetric(c *gin.Context) {
	duration := c.DefaultQuery("duration", "1h")

	metric, err := h.metricsService.GetNodesMetric(c.Request.Context(), duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, metric)
}

// GetTenantsMetric handles GET /api/metrics/tenants-metric
func (h *MetricsHandler) GetTenantsMetric(c *gin.Context) {
	duration := c.DefaultQuery("duration", "1h")

	metric, err := h.metricsService.GetTenantsMetric(c.Request.Context(), duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, metric)
}

// GetCPUUtilization handles GET /api/metrics/cpu
func (h *MetricsHandler) GetCPUUtilization(c *gin.Context) {
	duration := c.DefaultQuery("duration", "1h")

	utilization, err := h.metricsService.GetCPUUtilization(c.Request.Context(), duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, utilization)
}

// GetMemoryUtilization handles GET /api/metrics/memory
func (h *MetricsHandler) GetMemoryUtilization(c *gin.Context) {
	duration := c.DefaultQuery("duration", "1h")

	utilization, err := h.metricsService.GetMemoryUtilization(c.Request.Context(), duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, utilization)
}

// GetNodes handles GET /api/metrics/nodes
func (h *MetricsHandler) GetNodes(c *gin.Context) {
	nodes, err := h.metricsService.GetNodes(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, nodes)
}

// GetNamespaces handles GET /api/metrics/namespaces
func (h *MetricsHandler) GetNamespaces(c *gin.Context) {
	namespaces, err := h.metricsService.GetNamespaces(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, namespaces)
}

// GetDatabaseIOMetrics handles GET /api/metrics/database-io
func (h *MetricsHandler) GetDatabaseIOMetrics(c *gin.Context) {
	duration := c.DefaultQuery("duration", "1h")

	metrics, err := h.metricsService.GetDatabaseIOMetrics(c.Request.Context(), duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, metrics)
}
