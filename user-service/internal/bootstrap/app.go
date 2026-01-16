//go:build !test
// +build !test

package bootstrap

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"

	httphandler "github.com/kleffio/www/user-service/internal/adapters/in/http"
	"github.com/kleffio/www/user-service/internal/adapters/in/http/handlers"
	"github.com/kleffio/www/user-service/internal/adapters/out/authentik"
	"github.com/kleffio/www/user-service/internal/adapters/out/repository/redis"
	"github.com/kleffio/www/user-service/internal/config"
	authsvc "github.com/kleffio/www/user-service/internal/core/service/auth"
	usersvc "github.com/kleffio/www/user-service/internal/core/service/users"
)

type App struct {
	Config      *config.Config
	Router      http.Handler
	UserRepo    interface{ Close() error }
	AuditRepo   interface{ Close() error }
	SessionRepo interface{ Close() error }
}

func NewApp() (*App, error) {
	cfg, err := config.FromEnv()
	if err != nil {
		return nil, err
	}

	userRepo, userRepoCloser, err := buildUserRepository(cfg)
	if err != nil {
		return nil, err
	}

	auditRepo, auditCloser, err := buildAuditRepository(cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to build audit repository: %w", err)
	}

	tokenValidator := authentik.NewTokenValidator(cfg.AuthentikBaseURL)

	authentikManager := authentik.NewAuthentikManager(cfg.AuthentikBaseURL, cfg.AuthentikAPIToken)

	userService := usersvc.NewService(userRepo, auditRepo, tokenValidator, authentikManager)
	userHandler := handlers.NewUserHandler(userService)

	var authHandler *handlers.AuthHandler
	var sessionRepo *redis.SessionRepository

	if cfg.RedisURL != "" && cfg.AuthentikClientID != "" && cfg.AuthentikClientSecret != "" {
		log.Println("Initializing BFF with Redis session management")
		log.Printf("Redis URL: %s", cfg.RedisURL)
		log.Printf("Client ID: %s", cfg.AuthentikClientID)
		log.Printf("App Slug: %s", cfg.AuthentikAppSlug)

		sessionRepo, err = redis.NewSessionRepository(cfg.RedisURL, cfg.SessionTTL)
		if err != nil {
			log.Printf("Warning: failed to initialize Redis, BFF disabled: %v", err)
		} else {
			tokenRefresher := authentik.NewTokenRefresher(
				cfg.AuthentikBaseURL,
				cfg.AuthentikClientID,
				cfg.AuthentikClientSecret,
			)

			authService := authsvc.NewService(sessionRepo, tokenValidator, tokenRefresher, userService)
			authHandler = handlers.NewAuthHandler(authService, cfg.AuthentikBaseURL, cfg.AuthentikAppSlug)
			log.Println("✅ BFF session management enabled")
		}
	} else {
		log.Println("⚠️ BFF disabled: Redis or OAuth credentials not configured")
		log.Printf("RedisURL: %v", cfg.RedisURL)
		log.Printf("ClientID: %v", cfg.AuthentikClientID)
		log.Printf("ClientSecret: %v", cfg.AuthentikClientSecret != "")
	}

	root := chi.NewRouter()
	root.Mount("/", httphandler.NewRouter(userHandler, authHandler))

	return &App{
		Config:      cfg,
		Router:      root,
		UserRepo:    userRepoCloser,
		AuditRepo:   auditCloser,
		SessionRepo: sessionRepo,
	}, nil
}

func (a *App) Shutdown(ctx context.Context) error {
	var firstErr error

	if a.UserRepo != nil {
		if err := a.UserRepo.Close(); err != nil && firstErr == nil {
			firstErr = err
		}
	}

	if a.AuditRepo != nil {
		if err := a.AuditRepo.Close(); err != nil && firstErr == nil {
			firstErr = err
		}
	}

	if a.SessionRepo != nil {
		if err := a.SessionRepo.Close(); err != nil && firstErr == nil {
			firstErr = err
		}
	}

	return firstErr
}
