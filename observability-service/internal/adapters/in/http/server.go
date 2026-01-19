package http

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(handler *MetricsHandler, logsHandler *LogsHandler) *gin.Engine {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://kleff.io", "https://api.kleff.io", "http://localhost:5173", "http://localhost:8080", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	api := router.Group("/api/v1/systems")
	{
		api.GET("/overview", handler.GetOverview)

		api.GET("/requests-metric", handler.GetRequestsMetric)
		api.GET("/pods-metric", handler.GetPodsMetric)
		api.GET("/nodes-metric", handler.GetNodesMetric)
		api.GET("/tenants-metric", handler.GetTenantsMetric)

		api.GET("/cpu", handler.GetCPUUtilization)
		api.GET("/memory", handler.GetMemoryUtilization)

		api.GET("/nodes", handler.GetNodes)
		api.GET("/namespaces", handler.GetNamespaces)

		api.GET("/database-io", handler.GetDatabaseIOMetrics)

		api.POST("/project-metrics", handler.GetProjectUsageMetrics)

		api.POST("/logs/project-containers", logsHandler.GetProjectContainerLogs)
		api.GET("/projects/:projectID/usage/:days", handler.GetProjectUsageMetricsWithDays)
		api.GET("/projects/:projectID/usage", handler.GetProjectUsageMetrics)

		api.GET("/uptime", handler.GetUptimeMetrics)
		api.GET("/system-uptime", handler.GetSystemUptime)
	}

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "healthy",
		})
	})

	return router
}
