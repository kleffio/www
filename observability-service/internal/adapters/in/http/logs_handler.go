package http

import (
	"fmt"
	"net/http"

	"prometheus-metrics-api/internal/core/domain"
	"prometheus-metrics-api/internal/core/ports"

	"github.com/gin-gonic/gin"
)

type LogsHandler struct {
	logsService ports.LogsService
}

func NewLogsHandler(logsService ports.LogsService) *LogsHandler {
	return &LogsHandler{
		logsService: logsService,
	}
}

// QueryLogs handles custom log queries
func (h *LogsHandler) QueryLogs(c *gin.Context) {
	var params domain.LogQueryParams
	if err := c.ShouldBindJSON(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	logs, err := h.logsService.QueryLogs(c.Request.Context(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, logs)
}

// GetAllClusterLogs retrieves logs from all namespaces across the cluster
func (h *LogsHandler) GetAllClusterLogs(c *gin.Context) {
	limit := parseIntQuery(c, "limit", 100)
	duration := c.DefaultQuery("duration", "1h")

	logs, err := h.logsService.GetAllClusterLogs(c.Request.Context(), limit, duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, logs)
}

// GetLogsByProjectID retrieves logs for a specific project by its UUID
func (h *LogsHandler) GetLogsByProjectID(c *gin.Context) {
	projectID := c.Param("projectId")
	if projectID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "projectId is required"})
		return
	}

	limit := parseIntQuery(c, "limit", 100)
	duration := c.DefaultQuery("duration", "1h")

	logs, err := h.logsService.GetLogsByProjectID(c.Request.Context(), projectID, limit, duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, logs)
}

// GetLogsByNamespace retrieves logs for a specific namespace
func (h *LogsHandler) GetLogsByNamespace(c *gin.Context) {
	namespace := c.Param("namespace")
	if namespace == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "namespace is required"})
		return
	}

	limit := parseIntQuery(c, "limit", 100)
	duration := c.DefaultQuery("duration", "1h")

	logs, err := h.logsService.GetLogsByNamespace(c.Request.Context(), namespace, limit, duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, logs)
}

// GetLogsByPod retrieves logs for a specific pod
func (h *LogsHandler) GetLogsByPod(c *gin.Context) {
	namespace := c.Param("namespace")
	pod := c.Param("pod")

	if namespace == "" || pod == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "namespace and pod are required"})
		return
	}

	limit := parseIntQuery(c, "limit", 100)
	duration := c.DefaultQuery("duration", "1h")

	logs, err := h.logsService.GetLogsByPod(c.Request.Context(), namespace, pod, limit, duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, logs)
}

// GetLogsByContainer retrieves logs for a specific container
func (h *LogsHandler) GetLogsByContainer(c *gin.Context) {
	namespace := c.Param("namespace")
	pod := c.Param("pod")
	container := c.Param("container")

	if namespace == "" || pod == "" || container == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "namespace, pod, and container are required"})
		return
	}

	limit := parseIntQuery(c, "limit", 100)
	duration := c.DefaultQuery("duration", "1h")

	logs, err := h.logsService.GetLogsByContainer(c.Request.Context(), namespace, pod, container, limit, duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, logs)
}

// GetLogStreamStats gets statistics about log streams
func (h *LogsHandler) GetLogStreamStats(c *gin.Context) {
	namespace := c.Param("namespace")
	if namespace == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "namespace is required"})
		return
	}

	duration := c.DefaultQuery("duration", "1h")

	stats, err := h.logsService.GetLogStreamStats(c.Request.Context(), namespace, duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetErrorLogs retrieves logs with error level
func (h *LogsHandler) GetErrorLogs(c *gin.Context) {
	namespace := c.Param("namespace")
	if namespace == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "namespace is required"})
		return
	}

	limit := parseIntQuery(c, "limit", 100)
	duration := c.DefaultQuery("duration", "1h")

	logs, err := h.logsService.GetErrorLogs(c.Request.Context(), namespace, limit, duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, logs)
}

// parseIntQuery parses an integer query parameter with a default value
func parseIntQuery(c *gin.Context, key string, defaultValue int) int {
	value := c.DefaultQuery(key, "")
	if value == "" {
		return defaultValue
	}

	var result int
	if _, err := fmt.Sscanf(value, "%d", &result); err != nil {
		return defaultValue
	}

	return result
}

type ProjectLogsRequest struct {
	ProjectID      string   `json:"projectId" binding:"required"`
	ContainerNames []string `json:"containerNames" binding:"required"`
	Limit          int      `json:"limit,omitempty"`
	Duration       string   `json:"duration,omitempty"`
}

func (h *LogsHandler) GetProjectContainerLogs(c *gin.Context) {
	var req ProjectLogsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	// Set defaults
	if req.Limit <= 0 {
		req.Limit = 100
	}
	if req.Duration == "" {
		req.Duration = "1h"
	}

	logs, err := h.logsService.GetProjectContainerLogs(c.Request.Context(), req.ProjectID, req.ContainerNames, req.Limit, req.Duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, logs)
}
