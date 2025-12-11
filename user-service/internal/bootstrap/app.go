package bootstrap

import (
	"context"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/redis/go-redis/v9"

	httphandler "github.com/kleffio/www/user-service/internal/adapters/in/http"
	"github.com/kleffio/www/user-service/internal/adapters/out/authentik"
	"github.com/kleffio/www/user-service/internal/config"
	usersvc "github.com/kleffio/www/user-service/internal/core/service/users"
)

type App struct {
	Config      *config.Config
	Router      http.Handler
	RedisClient *redis.Client
	AuditRepo   interface{ Close() error }
}

func NewApp() (*App, error) {
	cfg, err := config.FromEnv()
	if err != nil {
		return nil, err
	}

	userRepo, redisClient, err := buildUserRepository(cfg)
	if err != nil {
		return nil, err
	}

	auditRepo, auditCloser, err := buildAuditRepository(cfg)

	if err != nil {
		return nil, fmt.Errorf("failed to build audit repository: %w", err)
	}

	idp := authentik.NewClient(cfg.AuthentikBaseURL, cfg.AuthentikToken)

	svc := usersvc.NewService(userRepo, auditRepo, idp, cfg.CacheTTL)

	handler := httphandler.NewHandler(svc)
	root := chi.NewRouter()
	root.Mount("/", httphandler.NewRouter(handler))

	return &App{
		Config:      cfg,
		Router:      root,
		RedisClient: redisClient,
		AuditRepo:   auditCloser,
	}, nil
}

func (a *App) Shutdown(ctx context.Context) error {
	var firstErr error

	if a.RedisClient != nil {
		if err := a.RedisClient.Close(); err != nil && firstErr == nil {
			firstErr = err
		}
	}

	if a.AuditRepo != nil {
		if err := a.AuditRepo.Close(); err != nil && firstErr == nil {
			firstErr = err
		}
	}

	return firstErr
}
