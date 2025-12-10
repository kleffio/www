package users

import (
	"context"
	"errors"
	"fmt"
	"log"
	"sync"
	"time"

	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
	port "github.com/kleffio/www/user-service/internal/core/ports/users"
)

var (
	ErrUserNotFound = errors.New("user not found")
)

type Service struct {
	repo     port.Repository
	idp      port.IdentityProvider
	cacheTTL time.Duration
}

func NewService(repo port.Repository, idp port.IdentityProvider, ttl time.Duration) *Service {
	return &Service{
		repo:     repo,
		idp:      idp,
		cacheTTL: ttl,
	}
}

func (s *Service) Get(ctx context.Context, id domain.ID) (*domain.User, error) {
	u, err := s.repo.GetByID(ctx, id)
	if err != nil {
		log.Printf("cache read error for user %s: %v", id, err)
	}

	if u != nil && !u.UpdatedAt.IsZero() && time.Since(u.UpdatedAt) < s.cacheTTL {
		return u, nil
	}

	return s.Refresh(ctx, id)
}

func (s *Service) Refresh(ctx context.Context, id domain.ID) (*domain.User, error) {
	u, err := s.idp.FetchByID(ctx, id)
	if err != nil {
		log.Printf("failed to fetch user %s from IDP: %v", id, err)
		return nil, fmt.Errorf("%w: %v", ErrUserNotFound, err)
	}

	if u == nil {
		log.Printf("user %s not found in IDP", id)
		return nil, ErrUserNotFound
	}

	u.UpdatedAt = time.Now().UTC()

	if err := s.repo.Save(ctx, u); err != nil {
		log.Printf("failed to save user %s to cache: %v", id, err)
	}

	return u, nil
}

func (s *Service) ResolveMany(ctx context.Context, ids []domain.ID) (map[domain.ID]*domain.User, error) {
	uniqueIDs := make(map[domain.ID]struct{})
	for _, id := range ids {
		uniqueIDs[id] = struct{}{}
	}

	out := make(map[domain.ID]*domain.User)
	mu := sync.Mutex{}
	wg := sync.WaitGroup{}

	semaphore := make(chan struct{}, 10)

	for id := range uniqueIDs {
		wg.Add(1)
		go func(userID domain.ID) {
			defer wg.Done()

			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			u, err := s.Get(ctx, userID)
			if err != nil {
				log.Printf("failed to resolve user %s: %v", userID, err)
				return
			}

			mu.Lock()
			out[userID] = u
			mu.Unlock()
		}(id)
	}

	wg.Wait()
	return out, nil
}
