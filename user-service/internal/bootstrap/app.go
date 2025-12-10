package bootstrap

import (
	"context"
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
}

func NewApp() (*App, error) {
	cfg, err := config.FromEnv()
	if err != nil {
		return nil, err
	}

	// choose repo + optional redis client
	repo, redisClient, err := buildRepository(cfg)
	if err != nil {
		return nil, err
	}

	idp := authentik.NewClient(cfg.AuthentikBaseURL, cfg.AuthentikToken)
	svc := usersvc.NewService(repo, idp, cfg.CacheTTL)

	handler := httphandler.NewHandler(svc)

	root := chi.NewRouter()
	root.Mount("/", httphandler.NewRouter(handler))

	return &App{
		Config:      cfg,
		Router:      root,
		RedisClient: redisClient,
	}, nil
}

func (a *App) Shutdown(ctx context.Context) error {
	if a.RedisClient != nil {
		return a.RedisClient.Close()
	}
	return nil
}
