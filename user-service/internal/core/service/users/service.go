package users

import (
	"context"
	"errors"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/google/uuid"
	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
	port "github.com/kleffio/www/user-service/internal/core/ports/users"
)

var (
	ErrUserNotFound = errors.New("user not found")
	ErrInvalidToken = errors.New("invalid or expired token")
)

type Service struct {
	repo      port.Repository
	auditRepo port.AuditRepository
	idp       port.IdentityProvider
	cacheTTL  time.Duration
}

func NewService(repo port.Repository, auditRepo port.AuditRepository, idp port.IdentityProvider, ttl time.Duration) *Service {
	return &Service{
		repo:      repo,
		auditRepo: auditRepo,
		idp:       idp,
		cacheTTL:  ttl,
	}
}

func (s *Service) Get(ctx context.Context, id domain.ID) (*domain.User, error) {
	u, err := s.repo.GetByID(ctx, id)
	if err == nil && u != nil && !u.UpdatedAt.IsZero() && time.Since(u.UpdatedAt) < s.cacheTTL {
		return u, nil
	}
	if err != nil {
		log.Printf("cache read error for user %s: %v", id, err)
	}

	oldUser := u

	fresh, err := s.idp.FetchByID(ctx, id)
	if err != nil {
		log.Printf("failed to fetch user %s from IDP: %v", id, err)
		return nil, ErrUserNotFound
	}
	if fresh == nil {
		return nil, ErrUserNotFound
	}

	fresh.UpdatedAt = time.Now().UTC()

	if oldUser != nil {
		s.detectAndLogChanges(ctx, oldUser, fresh)
	}

	if err := s.repo.Save(ctx, fresh); err != nil {
		log.Printf("failed to save user %s to cache: %v", id, err)
	}

	return fresh, nil
}

func (s *Service) GetMe(ctx context.Context, bearerToken string) (*domain.User, error) {
	if bearerToken == "" {
		return nil, ErrInvalidToken
	}

	user, err := s.idp.FetchByToken(ctx, bearerToken)
	if err != nil {
		log.Printf("failed to fetch user via token: %v", err)
		return nil, fmt.Errorf("%w: %v", ErrInvalidToken, err)
	}
	if user == nil {
		return nil, ErrUserNotFound
	}

	cached, err := s.repo.GetByID(ctx, user.ID)
	if err == nil && cached != nil && !cached.UpdatedAt.IsZero() && time.Since(cached.UpdatedAt) < s.cacheTTL {
		return cached, nil
	}

	user.UpdatedAt = time.Now().UTC()

	if cached != nil {
		s.detectAndLogChanges(ctx, cached, user)
	}

	_ = s.repo.Save(ctx, user)

	return user, nil
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

func (s *Service) GetAuditLogs(ctx context.Context, userID domain.ID, limit, offset int) ([]*domain.AuditLog, error) {
	if s.auditRepo == nil {
		return nil, nil
	}
	return s.auditRepo.GetUserAuditLogs(ctx, userID, limit, offset)
}

func (s *Service) detectAndLogChanges(ctx context.Context, oldUser, newUser *domain.User) {
	if s.auditRepo == nil {
		return
	}

	changes := make(map[string]domain.ChangeDetail)

	if oldUser.Username != newUser.Username {
		changes["username"] = domain.ChangeDetail{
			Old: oldUser.Username,
			New: newUser.Username,
		}
	}

	if oldUser.DisplayName != newUser.DisplayName {
		changes["displayName"] = domain.ChangeDetail{
			Old: oldUser.DisplayName,
			New: newUser.DisplayName,
		}
	}

	if oldUser.Email != newUser.Email {
		changes["email"] = domain.ChangeDetail{
			Old: oldUser.Email,
			New: newUser.Email,
		}
	}

	if oldUser.AvatarURL != newUser.AvatarURL {
		changes["avatarUrl"] = domain.ChangeDetail{
			Old: oldUser.AvatarURL,
			New: newUser.AvatarURL,
		}
	}

	if len(changes) == 0 {
		return
	}

	auditLog := &domain.AuditLog{
		ID:        uuid.New().String(),
		UserID:    newUser.ID,
		Action:    "profile_updated",
		Changes:   changes,
		Timestamp: time.Now().UTC(),
	}

	if err := s.auditRepo.Record(ctx, auditLog); err != nil {
		log.Printf("failed to record audit log for user %s: %v", newUser.ID, err)
	} else {
		log.Printf("audit: user %s profile updated: %v", newUser.ID, changes)
	}
}
