//go:build integration
// +build integration

package redisrepo_test

import (
	"context"
	"testing"
	"time"

	miniredis "github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"

	redisrepo "github.com/kleffio/www/user-service/internal/adapters/out/repository/redis"
	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
)

func TestRedisRepository_GetSave(t *testing.T) {
	mr, err := miniredis.Run()
	if err != nil {
		t.Fatalf("failed to start miniredis: %v", err)
	}
	defer mr.Close()

	client := redis.NewClient(&redis.Options{Addr: mr.Addr()})
	repo := redisrepo.NewRedisRepository(client, 5*time.Minute)

	ctx := context.Background()
	id := domain.ID("u1")
	user := &domain.User{ID: id, Username: "redis"}

	if err := repo.Save(ctx, user); err != nil {
		t.Fatalf("Save() error = %v", err)
	}

	got, err := repo.GetByID(ctx, id)
	if err != nil {
		t.Fatalf("GetByID() error = %v", err)
	}
	if got.Username != "redis" {
		t.Fatalf("unexpected user: %#v", got)
	}
}
