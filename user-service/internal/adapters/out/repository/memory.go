package repository

import (
	"context"
	"sync"

	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
	port "github.com/kleffio/www/user-service/internal/core/ports/users"
)

type MemoryRepository struct {
	mu    sync.RWMutex
	users map[domain.ID]*domain.User
}

var _ port.Repository = (*MemoryRepository)(nil)

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		users: make(map[domain.ID]*domain.User),
	}
}

func (r *MemoryRepository) GetByID(_ context.Context, id domain.ID) (*domain.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	if u, ok := r.users[id]; ok {
		cp := *u
		return &cp, nil
	}
	return nil, nil
}

func (r *MemoryRepository) Save(_ context.Context, user *domain.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	cp := *user
	r.users[user.ID] = &cp
	return nil
}
