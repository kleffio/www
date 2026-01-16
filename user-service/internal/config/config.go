//go:build !test
// +build !test

package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	HTTPAddr              string
	AuthentikBaseURL      string
	AuthentikAPIToken     string
	AuthentikClientID     string
	AuthentikClientSecret string
	AuthentikAppSlug      string

	PostgresUserDSN  string
	PostgresAuditDSN string

	RedisURL   string
	SessionTTL time.Duration
}

func FromEnv() (*Config, error) {
	sessionTTLHours := 24
	if ttlStr := os.Getenv("SESSION_TTL_HOURS"); ttlStr != "" {
		parsed, err := strconv.Atoi(ttlStr)
		if err != nil {
			return nil, fmt.Errorf("invalid SESSION_TTL_HOURS: %w", err)
		}
		sessionTTLHours = parsed
	}

	cfg := &Config{
		HTTPAddr:              getEnv("HTTP_ADDR", ":8080"),
		AuthentikBaseURL:      getEnv("AUTHENTIK_BASE_URL", "http://authentik:9000"),
		AuthentikAPIToken:     os.Getenv("AUTHENTIK_API_TOKEN"),
		AuthentikClientID:     os.Getenv("AUTHENTIK_CLIENT_ID"),
		AuthentikClientSecret: os.Getenv("AUTHENTIK_CLIENT_SECRET"),
		AuthentikAppSlug:      getEnv("AUTHENTIK_APP_SLUG", "kleff"),

		PostgresUserDSN:  os.Getenv("POSTGRES_USER_DSN"),
		PostgresAuditDSN: os.Getenv("POSTGRES_AUDIT_DSN"),

		RedisURL:   getEnv("REDIS_URL", "redis://localhost:6379/0"),
		SessionTTL: time.Duration(sessionTTLHours) * time.Hour,
	}

	if cfg.PostgresUserDSN == "" {
		return nil, fmt.Errorf("POSTGRES_USER_DSN environment variable is required")
	}

	if cfg.RedisURL == "" {
		fmt.Println("Warning: REDIS_URL not configured, BFF session management will be disabled")
	}

	if cfg.AuthentikAPIToken == "" {
		fmt.Println("Warning: AUTHENTIK_API_TOKEN not configured, username sync to Authentik will be disabled")
	}

	return cfg, nil
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
