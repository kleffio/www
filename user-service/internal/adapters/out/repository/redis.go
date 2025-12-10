package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
	port "github.com/kleffio/www/user-service/internal/core/ports/users"
	"github.com/redis/go-redis/v9"
)

type RedisRepository struct {
	client redis.Cmdable
	ttl    time.Duration
}

var _ port.Repository = (*RedisRepository)(nil)

func NewRedisRepository(client redis.Cmdable, ttl time.Duration) *RedisRepository {
	return &RedisRepository{
		client: client,
		ttl:    ttl,
	}
}

func (r *RedisRepository) GetByID(ctx context.Context, id domain.ID) (*domain.User, error) {
	key := r.userKey(id)
	log.Printf("[redis] GET %s", key)

	data, err := r.client.Get(ctx, key).Bytes()
	if errors.Is(err, redis.Nil) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("redis get failed: %w", err)
	}

	var user domain.User
	if err := json.Unmarshal(data, &user); err != nil {
		return nil, fmt.Errorf("failed to unmarshal user: %w", err)
	}

	return &user, nil
}

func (r *RedisRepository) Save(ctx context.Context, user *domain.User) error {
	key := r.userKey(user.ID)
	log.Printf("[redis] SET %s ttl=%s", key, r.ttl)

	data, err := json.Marshal(user)
	if err != nil {
		return fmt.Errorf("failed to marshal user: %w", err)
	}

	if err := r.client.Set(ctx, key, data, r.ttl).Err(); err != nil {
		return fmt.Errorf("redis set failed: %w", err)
	}

	return nil
}

func (r *RedisRepository) userKey(id domain.ID) string {
	return fmt.Sprintf("user:%s", id)
}
