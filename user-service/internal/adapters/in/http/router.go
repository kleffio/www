package http

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/kleffio/www/user-service/internal/adapters/in/http/handlers"
)

func NewRouter(userHandler *handlers.UserHandler, authHandler *handlers.AuthHandler) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{
			"https://kleff.io",
			"https://api.kleff.io",
			"http://localhost:5173",
			"http://localhost:8080",
			"http://localhost:3000",
		},
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Session-ID"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/healthz", healthCheck)
	r.Get("/health", healthCheck)

	if authHandler != nil {
		log.Println("✅ Registering auth routes at /api/v1/auth")
		r.Route("/api/v1/auth", func(r chi.Router) {
			r.Use(optionsHandler)
			r.Post("/callback", authHandler.HandleOAuthCallback)
			r.Post("/refresh", authHandler.RefreshSession)
			r.Post("/logout", authHandler.Logout)
		})
	} else {
		log.Println("⚠️  WARNING: AuthHandler is nil! Auth routes (/callback, /refresh, /logout) will NOT be registered.")
		log.Println("⚠️  This will cause 404 errors on auth endpoints. Please initialize AuthHandler properly.")
	}

	r.Route("/api/v1/users", func(r chi.Router) {
		r.Get("/me", userHandler.GetMe)
		r.Patch("/me/profile", userHandler.PatchMeProfile)
		r.Get("/me/audit", userHandler.GetMyAuditLogs)

		if authHandler != nil {
			r.Get("/me/session", authHandler.GetMeWithSession)
		}

		r.Get("/profile/@{handle}", userHandler.GetPublicProfile)

		r.Get("/{id}", userHandler.GetUser)
		r.Post("/resolve", userHandler.ResolveMany)
	})

	return r
}

func optionsHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("ok"))
}
