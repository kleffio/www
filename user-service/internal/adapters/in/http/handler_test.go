package http_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"

	httpadpt "github.com/kleffio/www/user-service/internal/adapters/in/http"
	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
	coresvc "github.com/kleffio/www/user-service/internal/core/service/users"
)

type stubService struct {
	getFunc         func(ctx context.Context, id domain.ID) (*domain.User, error)
	refreshFunc     func(ctx context.Context, id domain.ID) (*domain.User, error)
	resolveManyFunc func(ctx context.Context, ids []domain.ID) (map[domain.ID]*domain.User, error)
}

func (s *stubService) Get(ctx context.Context, id domain.ID) (*domain.User, error) {
	if s.getFunc == nil {
		return nil, nil
	}
	return s.getFunc(ctx, id)
}

func (s *stubService) Refresh(ctx context.Context, id domain.ID) (*domain.User, error) {
	if s.refreshFunc == nil {
		return nil, nil
	}
	return s.refreshFunc(ctx, id)
}

func (s *stubService) ResolveMany(ctx context.Context, ids []domain.ID) (map[domain.ID]*domain.User, error) {
	if s.resolveManyFunc == nil {
		return map[domain.ID]*domain.User{}, nil
	}
	return s.resolveManyFunc(ctx, ids)
}

var _ httpadpt.UserService = (*stubService)(nil)

func TestHealthHandler(t *testing.T) {
	h := httpadpt.NewHandler(&stubService{})
	r := chi.NewRouter()
	r.Get("/healthz", h.Health)

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rr := httptest.NewRecorder()

	r.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
	if body := rr.Body.String(); body != "ok" {
		t.Fatalf("expected body 'ok', got %q", body)
	}
}

func TestGetUser_NotFound(t *testing.T) {
	svc := &stubService{
		getFunc: func(ctx context.Context, id domain.ID) (*domain.User, error) {
			return nil, coresvc.ErrUserNotFound
		},
	}

	h := httpadpt.NewHandler(svc)

	r := chi.NewRouter()
	r.Get("/users/{id}", h.GetUser)

	req := httptest.NewRequest(http.MethodGet, "/users/123", nil)
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rr.Code)
	}
}

func TestGetUser_Success(t *testing.T) {
	user := &domain.User{
		ID:          "abc",
		Username:    "isaac",
		DisplayName: "Isaac",
		Email:       "isaac@example.com",
		UpdatedAt:   time.Now(),
	}
	svc := &stubService{
		getFunc: func(ctx context.Context, id domain.ID) (*domain.User, error) {
			if id != "abc" {
				t.Fatalf("unexpected id %q", id)
			}
			return user, nil
		},
	}

	h := httpadpt.NewHandler(svc)

	r := chi.NewRouter()
	r.Get("/users/{id}", h.GetUser)

	req := httptest.NewRequest(http.MethodGet, "/users/abc", nil)
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}

	var got domain.User
	if err := json.NewDecoder(rr.Body).Decode(&got); err != nil {
		t.Fatalf("failed to decode body: %v", err)
	}
	if got.Username != "isaac" {
		t.Fatalf("expected username 'isaac', got %q", got.Username)
	}
}

func TestResolveMany_TooManyIDs(t *testing.T) {
	svc := &stubService{}
	h := httpadpt.NewHandler(svc)

	r := chi.NewRouter()
	r.Post("/users/resolve", h.ResolveMany)

	ids := make([]string, 101)
	body, _ := json.Marshal(map[string]any{"ids": ids})

	req := httptest.NewRequest(http.MethodPost, "/users/resolve", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}
