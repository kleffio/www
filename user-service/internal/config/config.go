package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	HTTPAddr         string
	AuthentikBaseURL string
	AuthentikToken   string
	CacheTTL         time.Duration
	RedisAddr        string
	RedisPassword    string
	RedisDB          int
}

func FromEnv() (*Config, error) {
	cfg := &Config{
		HTTPAddr:         getEnv("HTTP_ADDR", ":8080"),
		AuthentikBaseURL: getEnv("AUTHENTIK_BASE_URL", "http://authentik:9000"),
		AuthentikToken:   os.Getenv("AUTHENTIK_TOKEN"),
		RedisAddr:        os.Getenv("REDIS_ADDR"),
		RedisPassword:    os.Getenv("REDIS_PASSWORD"),
	}

	if cfg.AuthentikToken == "" {
		return nil, fmt.Errorf("AUTHENTIK_TOKEN environment variable is required")
	}

	if dbStr := os.Getenv("REDIS_DB"); dbStr != "" {
		db, err := strconv.Atoi(dbStr)
		if err != nil {
			return nil, fmt.Errorf("invalid REDIS_DB value: %w", err)
		}
		cfg.RedisDB = db
	}

	ttlStr := getEnv("CACHE_TTL", "5m")
	d, err := time.ParseDuration(ttlStr)
	if err != nil {
		return nil, fmt.Errorf("invalid CACHE_TTL value: %w", err)
	}
	cfg.CacheTTL = d

	return cfg, nil
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
