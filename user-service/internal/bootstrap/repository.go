package bootstrap

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/redis/go-redis/v9"

	postgresrepo "github.com/kleffio/www/user-service/internal/adapters/out/repository/postgres"
	redisrepo "github.com/kleffio/www/user-service/internal/adapters/out/repository/redis"

	"github.com/kleffio/www/user-service/internal/adapters/out/repository"
	"github.com/kleffio/www/user-service/internal/config"
)

func buildUserRepository(cfg *config.Config) (repository.Repository, *redis.Client, error) {
	if cfg.RedisAddr == "" {
		return nil, nil, fmt.Errorf("RedisAddr is required for user-service cache backend")
	}

	client := redis.NewClient(&redis.Options{
		Addr:         cfg.RedisAddr,
		Password:     cfg.RedisPassword,
		DB:           cfg.RedisDB,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, nil, fmt.Errorf("redis connection failed: %w", err)
	}

	log.Printf("user-service cache backend: redis (%s)", cfg.RedisAddr)
	repo := redisrepo.NewRedisRepository(client, cfg.CacheTTL)
	return repo, client, nil
}

func buildAuditRepository(cfg *config.Config) (
	repository.AuditRepository,
	interface{ Close() error },
	error,
) {
	if cfg.PostgresAuditDSN == "" {
		return nil, noopCloser{}, fmt.Errorf("PostgresAuditDSN is required for audit logging")
	}

	log.Printf("audit backend: postgresql")
	repo, err := postgresrepo.NewPostgresAuditRepository(cfg.PostgresAuditDSN)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create postgres audit repo: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := repo.CreateTable(ctx); err != nil {
		_ = repo.Close()
		return nil, nil, fmt.Errorf("failed to create audit table: %w", err)
	}

	return repo, repo, nil
}

type noopCloser struct{}

func (noopCloser) Close() error { return nil }
