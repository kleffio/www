package redis

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"

	authdomain "github.com/kleffio/www/user-service/internal/core/domain/auth"
	authport "github.com/kleffio/www/user-service/internal/core/ports/auth"
)

type SessionRepository struct {
	client *redis.Client
	ttl    time.Duration
}

var _ authport.SessionRepository = (*SessionRepository)(nil)

func NewSessionRepository(redisURL string, ttl time.Duration) (*SessionRepository, error) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse redis URL: %w", err)
	}

	client := redis.NewClient(opts)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to redis: %w", err)
	}

	if ttl == 0 {
		ttl = 24 * time.Hour
	}

	return &SessionRepository{
		client: client,
		ttl:    ttl,
	}, nil
}

func (r *SessionRepository) Create(ctx context.Context, session *authdomain.Session) error {
	if session.SessionID == "" {
		sessionID, err := generateSessionID()
		if err != nil {
			return fmt.Errorf("failed to generate session ID: %w", err)
		}
		session.SessionID = sessionID
	}

	now := time.Now().UTC()
	session.CreatedAt = now
	session.UpdatedAt = now

	data, err := json.Marshal(session)
	if err != nil {
		return fmt.Errorf("failed to marshal session: %w", err)
	}

	key := fmt.Sprintf("session:%s", session.SessionID)
	if err := r.client.Set(ctx, key, data, r.ttl).Err(); err != nil {
		return fmt.Errorf("failed to store session: %w", err)
	}

	subKey := fmt.Sprintf("session:sub:%s", session.Sub)
	if err := r.client.Set(ctx, subKey, session.SessionID, r.ttl).Err(); err != nil {
		return fmt.Errorf("failed to store session sub index: %w", err)
	}

	return nil
}

func (r *SessionRepository) Get(ctx context.Context, sessionID string) (*authdomain.Session, error) {
	key := fmt.Sprintf("session:%s", sessionID)
	data, err := r.client.Get(ctx, key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get session: %w", err)
	}

	var session authdomain.Session
	if err := json.Unmarshal(data, &session); err != nil {
		return nil, fmt.Errorf("failed to unmarshal session: %w", err)
	}

	return &session, nil
}

func (r *SessionRepository) GetBySub(ctx context.Context, sub string) (*authdomain.Session, error) {
	subKey := fmt.Sprintf("session:sub:%s", sub)
	sessionID, err := r.client.Get(ctx, subKey).Result()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get session by sub: %w", err)
	}

	return r.Get(ctx, sessionID)
}

func (r *SessionRepository) Update(ctx context.Context, session *authdomain.Session) error {
	session.UpdatedAt = time.Now().UTC()

	data, err := json.Marshal(session)
	if err != nil {
		return fmt.Errorf("failed to marshal session: %w", err)
	}

	key := fmt.Sprintf("session:%s", session.SessionID)

	ttl, err := r.client.TTL(ctx, key).Result()
	if err != nil || ttl <= 0 {
		ttl = r.ttl
	}

	if err := r.client.Set(ctx, key, data, ttl).Err(); err != nil {
		return fmt.Errorf("failed to update session: %w", err)
	}

	return nil
}

func (r *SessionRepository) Delete(ctx context.Context, sessionID string) error {
	session, err := r.Get(ctx, sessionID)
	if err != nil {
		return err
	}
	if session == nil {
		return nil
	}

	key := fmt.Sprintf("session:%s", sessionID)
	subKey := fmt.Sprintf("session:sub:%s", session.Sub)

	pipe := r.client.Pipeline()
	pipe.Del(ctx, key)
	pipe.Del(ctx, subKey)

	if _, err := pipe.Exec(ctx); err != nil {
		return fmt.Errorf("failed to delete session: %w", err)
	}

	return nil
}

func (r *SessionRepository) Refresh(ctx context.Context, sessionID string) error {
	key := fmt.Sprintf("session:%s", sessionID)
	return r.client.Expire(ctx, key, r.ttl).Err()
}

func (r *SessionRepository) Close() error {
	return r.client.Close()
}

func generateSessionID() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}
