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

func (h *MetricsHandler) GetOverview(c *gin.Context) {
	overview, err := h.metricsService.GetClusterOverview(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, overview)
}

func (h *MetricsHandler) GetRequestsMetric(c *gin.Context) {
	duration := c.DefaultQuery("duration", "1h")

	metric, err := h.metricsService.GetRequestsMetric(c.Request.Context(), duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, metric)
}

func (h *MetricsHandler) GetPodsMetric(c *gin.Context) {
	duration := c.DefaultQuery("duration", "1h")

	metric, err := h.metricsService.GetPodsMetric(c.Request.Context(), duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, metric)
}

func (h *MetricsHandler) GetNodesMetric(c *gin.Context) {
	duration := c.DefaultQuery("duration", "1h")

	metric, err := h.metricsService.GetNodesMetric(c.Request.Context(), duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, metric)
}

func (h *MetricsHandler) GetTenantsMetric(c *gin.Context) {
	duration := c.DefaultQuery("duration", "1h")

	metric, err := h.metricsService.GetTenantsMetric(c.Request.Context(), duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, metric)
}

func (h *MetricsHandler) GetCPUUtilization(c *gin.Context) {
	duration := c.DefaultQuery("duration", "1h")

	utilization, err := h.metricsService.GetCPUUtilization(c.Request.Context(), duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, utilization)
}

func (h *MetricsHandler) GetMemoryUtilization(c *gin.Context) {
	duration := c.DefaultQuery("duration", "1h")

	utilization, err := h.metricsService.GetMemoryUtilization(c.Request.Context(), duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, utilization)
}

func (h *MetricsHandler) GetNodes(c *gin.Context) {
	nodes, err := h.metricsService.GetNodes(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, nodes)
}

func (h *MetricsHandler) GetNamespaces(c *gin.Context) {
	namespaces, err := h.metricsService.GetNamespaces(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, namespaces)
}

func (h *MetricsHandler) GetDatabaseIOMetrics(c *gin.Context) {
	duration := c.DefaultQuery("duration", "1h")

	metrics, err := h.metricsService.GetDatabaseIOMetrics(c.Request.Context(), duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, metrics)
}

func (h *MetricsHandler) GetProjectUsageMetrics(c *gin.Context) {
	projectID := c.Param("projectID")
	if projectID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "projectID is required"})
		return
	}

	metrics, err := h.metricsService.GetProjectUsageMetrics(c.Request.Context(), projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, metrics)
}
