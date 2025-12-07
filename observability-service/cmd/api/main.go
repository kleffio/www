package main

import (
	"log"

	"prometheus-metrics-api/internal/adapters/in/http"
	"prometheus-metrics-api/internal/adapters/out/repository/prometheus"
	"prometheus-metrics-api/internal/config"
	"prometheus-metrics-api/internal/core/services"
)

func main() {
	// Load configuration
	cfg := config.Load()

	log.Printf("Starting Prometheus Metrics API...")
	log.Printf("Environment: %s", cfg.Environment)
	log.Printf("Prometheus URL: %s", cfg.PrometheusURL)
	log.Printf("Server Port: %s", cfg.ServerPort)

	// Hexagonal architecture wiring
	// OUT adapter (outbound/secondary): Prometheus client
	prometheusClient := prometheus.NewPrometheusClient(cfg.PrometheusURL)

	// Service layer (core business logic)
	metricsService := services.NewMetricsService(prometheusClient)

	// IN adapter (inbound/primary): HTTP handlers
	metricsHandler := http.NewMetricsHandler(metricsService)

	// Setup router
	router := http.SetupRouter(metricsHandler)

	// Start server
	log.Printf("Server listening on port %s", cfg.ServerPort)
	if err := router.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
