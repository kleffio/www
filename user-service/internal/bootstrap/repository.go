package bootstrap

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/kleffio/www/user-service/internal/adapters/out/repository"
	"github.com/kleffio/www/user-service/internal/config"
)

// buildRepository decides between Redis and in-memory cache,
// returning the chosen repo and an optional Redis client.
func buildRepository(cfg *config.Config) (repository.Repository, *redis.Client, error) {
	// No Redis configured → use in-memory cache.
	if cfg.RedisAddr == "" {
		log.Printf("user-service cache backend: memory")
		return repository.NewMemoryRepository(), nil, nil
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
		// strict fail-fast (current behavior)
		return nil, nil, fmt.Errorf("redis connection failed: %w", err)

		// or, if you prefer graceful fallback:
		// log.Printf("redis unavailable (%v), falling back to memory cache", err)
		// return repository.NewMemoryRepository(), nil, nil
	}

	log.Printf("user-service cache backend: redis (%s)", cfg.RedisAddr)
	repo := repository.NewRedisRepository(client, cfg.CacheTTL)
	return repo, client, nil
}
