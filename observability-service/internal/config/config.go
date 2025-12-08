package config

import (
	"os"
)

type Config struct {
	ServerPort    string
	PrometheusURL string
	Environment   string
}

func Load() *Config {
	return &Config{
		ServerPort:    getEnv("SERVER_PORT", "8080"),
		PrometheusURL: getEnv("PROMETHEUS_URL", "http://localhost:9090"),
		Environment:   getEnv("ENVIRONMENT", "development"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
