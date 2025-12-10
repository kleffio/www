package users_test

import (
	"context"
	"errors"
	"sync"
	"testing"
	"time"

	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
	"github.com/kleffio/www/user-service/internal/core/service/users"
)

type stubRepo struct {
	mu        sync.Mutex
	user      *domain.User
	getCalls  int
	saveCalls int
	lastSaved *domain.User
	err       error
}

func (r *stubRepo) GetByID(ctx context.Context, id domain.ID) (*domain.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.getCalls++
	if r.err != nil {
		return nil, r.err
	}
	if r.user == nil {
		return nil, nil
	}
	cp := *r.user
	return &cp, nil
}

func (r *stubRepo) Save(ctx context.Context, u *domain.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.saveCalls++
	cp := *u
	r.lastSaved = &cp
	return nil
}

type stubIDP struct {
	mu     sync.Mutex
	users  map[domain.ID]*domain.User
	err    error
	calls  int
	lastID domain.ID
}

func (s *stubIDP) FetchByID(ctx context.Context, id domain.ID) (*domain.User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.calls++
	s.lastID = id
	if s.err != nil {
		return nil, s.err
	}
	if u, ok := s.users[id]; ok {
		cp := *u
		return &cp, nil
	}
	return nil, nil
}

// --- tests ---

func TestService_Get_UsesFreshCache(t *testing.T) {
	ctx := context.Background()
	id := domain.ID("user-1")

	now := time.Now().Add(-10 * time.Second) // still within TTL
	repo := &stubRepo{
		user: &domain.User{
			ID:        id,
			Username:  "cached",
			UpdatedAt: now,
		},
	}
	idp := &stubIDP{}
	svc := users.NewService(repo, idp, 1*time.Minute)

	u, err := svc.Get(ctx, id)
	if err != nil {
		t.Fatalf("Get() error = %v", err)
	}
	if u.Username != "cached" {
		t.Fatalf("expected cached user, got %q", u.Username)
	}
	if idp.calls != 0 {
		t.Fatalf("expected IDP not to be called, got %d calls", idp.calls)
	}
}

func TestService_Get_CallsRefreshWhenCacheStale(t *testing.T) {
	ctx := context.Background()
	id := domain.ID("user-1")

	repo := &stubRepo{
		user: &domain.User{
			ID:        id,
			Username:  "stale",
			UpdatedAt: time.Now().Add(-2 * time.Minute),
		},
	}
	idp := &stubIDP{
		users: map[domain.ID]*domain.User{
			id: {ID: id, Username: "fresh"},
		},
	}
	svc := users.NewService(repo, idp, 1*time.Minute)

	start := time.Now()
	u, err := svc.Get(ctx, id)
	if err != nil {
		t.Fatalf("Get() error = %v", err)
	}
	if u.Username != "fresh" {
		t.Fatalf("expected fresh user, got %q", u.Username)
	}
	if idp.calls != 1 {
		t.Fatalf("expected IDP to be called once, got %d", idp.calls)
	}
	// UpdatedAt should be set on save
	if repo.lastSaved == nil || repo.lastSaved.UpdatedAt.Before(start) {
		t.Fatalf("expected UpdatedAt to be set on saved user")
	}
}

func TestService_Refresh_PropagatesNotFound(t *testing.T) {
	ctx := context.Background()
	id := domain.ID("missing")

	idpErr := errors.New("idp 404")
	idp := &stubIDP{err: idpErr}
	repo := &stubRepo{}

	svc := users.NewService(repo, idp, 1*time.Minute)

	_, err := svc.Refresh(ctx, id)
	if err == nil {
		t.Fatalf("expected error, got nil")
	}
	if !errors.Is(err, users.ErrUserNotFound) {
		t.Fatalf("expected ErrUserNotFound, got %v", err)
	}
}

func TestService_ResolveMany_DedupesAndReturnsAll(t *testing.T) {
	ctx := context.Background()
	id1 := domain.ID("user-1")
	id2 := domain.ID("user-2")

	repo := &stubRepo{} // unused in this test (cache miss path)
	idp := &stubIDP{
		users: map[domain.ID]*domain.User{
			id1: {ID: id1, Username: "u1"},
			id2: {ID: id2, Username: "u2"},
		},
	}
	svc := users.NewService(repo, idp, 0)

	ids := []domain.ID{id1, id1, id2}
	res, err := svc.ResolveMany(ctx, ids)
	if err != nil {
		t.Fatalf("ResolveMany() error = %v", err)
	}

	if len(res) != 2 {
		t.Fatalf("expected 2 users, got %d", len(res))
	}
	if res[id1].Username != "u1" || res[id2].Username != "u2" {
		t.Fatalf("unexpected result map: %#v", res)
	}
}
