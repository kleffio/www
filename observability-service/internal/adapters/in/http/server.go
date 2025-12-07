package http

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(handler *MetricsHandler) *gin.Engine {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://kleff.io", "https://api.kleff.io", "http://localhost:5173", "http://localhost:8080", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	// API routes
	api := router.Group("/api/v1/systems")
	{
		// Overview
		api.GET("/overview", handler.GetOverview)

		// Metric cards
		api.GET("/requests-metric", handler.GetRequestsMetric)
		api.GET("/pods-metric", handler.GetPodsMetric)
		api.GET("/nodes-metric", handler.GetNodesMetric)
		api.GET("/tenants-metric", handler.GetTenantsMetric)

		// Resource utilization
		api.GET("/cpu", handler.GetCPUUtilization)
		api.GET("/memory", handler.GetMemoryUtilization)

		// List endpoints
		api.GET("/nodes", handler.GetNodes)
		api.GET("/namespaces", handler.GetNamespaces)

		// Database metrics
		api.GET("/database-io", handler.GetDatabaseIOMetrics)
	}

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "healthy",
		})
	})

	return router
}
