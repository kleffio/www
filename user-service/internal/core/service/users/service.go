package users

import (
	"context"
	"errors"
	"fmt"
	"log"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
	port "github.com/kleffio/www/user-service/internal/core/ports/users"
)

var (
	ErrUserNotFound  = errors.New("user not found")
	ErrInvalidToken  = errors.New("invalid or expired token")
	ErrInvalidHandle = errors.New("invalid handle format")
	ErrHandleTaken   = errors.New("handle already taken")
	ErrInvalidUpdate = errors.New("invalid profile update")
)

var handleRegex = regexp.MustCompile(`^[a-z0-9_-]{2,63}$`)

type Service struct {
	repo           port.UserRepository
	auditRepo      port.AuditRepository
	tokenValidator port.TokenValidator
}

func NewService(
	repo port.UserRepository,
	auditRepo port.AuditRepository,
	tokenValidator port.TokenValidator,
) *Service {
	return &Service{
		repo:           repo,
		auditRepo:      auditRepo,
		tokenValidator: tokenValidator,
	}
}

func (s *Service) GetMe(ctx context.Context, bearerToken string) (*domain.User, error) {
	if bearerToken == "" {
		return nil, ErrInvalidToken
	}

	claims, err := s.tokenValidator.ValidateToken(ctx, bearerToken)
	if err != nil {
		log.Printf("token validation failed: %v", err)
		return nil, ErrInvalidToken
	}

	user, err := s.EnsureUserFromToken(ctx, claims)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *Service) EnsureUserFromToken(ctx context.Context, claims *port.TokenClaims) (*domain.User, error) {
	user, err := s.repo.GetByID(ctx, domain.ID(claims.Sub))
	if err != nil {
		return nil, fmt.Errorf("failed to check existing user: %w", err)
	}

	now := time.Now().UTC()

	if user == nil {
		handle := s.generateUniqueHandle(ctx, claims)
		displayName := s.generateDisplayName(claims)

		user = &domain.User{
			ID:            domain.ID(claims.Sub),
			Email:         claims.Email,
			EmailVerified: claims.EmailVerified,
			LoginUsername: claims.PreferredUsername,
			Handle:        handle,
			DisplayName:   displayName,
			CreatedAt:     now,
			UpdatedAt:     now,
		}

		if err := s.repo.Save(ctx, user); err != nil {
			return nil, fmt.Errorf("failed to create user: %w", err)
		}

		log.Printf("created new user: id=%s handle=%s", user.ID, user.Handle)
		return user, nil
	}

	updated := false
	oldUser := *user

	if user.Email != claims.Email {
		user.Email = claims.Email
		updated = true
	}
	if user.EmailVerified != claims.EmailVerified {
		user.EmailVerified = claims.EmailVerified
		updated = true
	}
	if claims.PreferredUsername != "" && user.LoginUsername != claims.PreferredUsername {
		user.LoginUsername = claims.PreferredUsername
		updated = true
	}

	if updated {
		user.UpdatedAt = now
		if err := s.repo.Save(ctx, user); err != nil {
			return nil, fmt.Errorf("failed to update user: %w", err)
		}

		s.detectAndLogChanges(ctx, &oldUser, user)
		log.Printf("updated user identity: id=%s", user.ID)
	}

	return user, nil
}

func (s *Service) Get(ctx context.Context, id domain.ID) (*domain.User, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	if user == nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (s *Service) GetByHandle(ctx context.Context, handle string) (*domain.User, error) {
	user, err := s.repo.GetByHandle(ctx, handle)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by handle: %w", err)
	}
	if user == nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (s *Service) UpdateProfile(ctx context.Context, id domain.ID, update *domain.ProfileUpdate) (*domain.User, error) {
	// Get existing user
	oldUser, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	if oldUser == nil {
		return nil, ErrUserNotFound
	}

	if update.Handle != nil {
		normalized := strings.ToLower(strings.TrimSpace(*update.Handle))
		if !handleRegex.MatchString(normalized) {
			return nil, ErrInvalidHandle
		}

		if normalized != oldUser.Handle {
			exists, err := s.repo.HandleExists(ctx, normalized, id)
			if err != nil {
				return nil, fmt.Errorf("failed to check handle: %w", err)
			}
			if exists {
				return nil, ErrHandleTaken
			}
		}

		update.Handle = &normalized
	}

	if update.DisplayName != nil {
		trimmed := strings.TrimSpace(*update.DisplayName)
		if trimmed == "" {
			return nil, ErrInvalidUpdate
		}
		if len(trimmed) > 255 {
			return nil, ErrInvalidUpdate
		}
		update.DisplayName = &trimmed
	}

	if err := s.repo.UpdateProfile(ctx, id, update); err != nil {
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}

	newUser, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch updated user: %w", err)
	}

	s.detectAndLogChanges(ctx, oldUser, newUser)

	return newUser, nil
}

func (s *Service) ResolveMany(ctx context.Context, ids []domain.ID) (map[domain.ID]*domain.User, error) {
	result := make(map[domain.ID]*domain.User)
	for _, id := range ids {
		user, err := s.repo.GetByID(ctx, id)
		if err != nil {
			log.Printf("failed to resolve user %s: %v", id, err)
			continue
		}
		if user != nil {
			result[id] = user
		}
	}
	return result, nil
}

func (s *Service) GetAuditLogs(ctx context.Context, userID domain.ID, limit, offset int) ([]*domain.AuditLog, error) {
	if s.auditRepo == nil {
		return nil, nil
	}
	return s.auditRepo.GetUserAuditLogs(ctx, userID, limit, offset)
}

// --- Helpers ---

func (s *Service) generateUniqueHandle(ctx context.Context, claims *port.TokenClaims) string {
	if claims.PreferredUsername != "" {
		candidate := normalizeHandle(claims.PreferredUsername)
		if candidate != "" && !s.handleExists(ctx, candidate) {
			return candidate
		}
	}

	if claims.Email != "" {
		parts := strings.Split(claims.Email, "@")
		if len(parts) > 0 {
			candidate := normalizeHandle(parts[0])
			if candidate != "" && !s.handleExists(ctx, candidate) {
				return candidate
			}
		}
	}

	for i := 0; i < 10; i++ {
		candidate := fmt.Sprintf("user_%s", uuid.New().String()[:8])
		if !s.handleExists(ctx, candidate) {
			return candidate
		}
	}

	return fmt.Sprintf("user_%s", uuid.New().String()[:12])
}

func (s *Service) generateDisplayName(claims *port.TokenClaims) string {
	if claims.PreferredUsername != "" {
		return claims.PreferredUsername
	}
	if claims.Email != "" {
		parts := strings.Split(claims.Email, "@")
		if len(parts) > 0 && parts[0] != "" {
			return parts[0]
		}
	}
	return "User"
}

func normalizeHandle(input string) string {
	lower := strings.ToLower(input)
	normalized := regexp.MustCompile(`[^a-z0-9_-]`).ReplaceAllString(lower, "")
	if len(normalized) < 2 || len(normalized) > 63 {
		return ""
	}
	return normalized
}

func (s *Service) handleExists(ctx context.Context, handle string) bool {
	exists, err := s.repo.HandleExists(ctx, handle, "")
	if err != nil {
		log.Printf("failed to check handle existence: %v", err)
		return true
	}
	return exists
}

func (s *Service) detectAndLogChanges(ctx context.Context, oldUser, newUser *domain.User) {
	if s.auditRepo == nil {
		return
	}

	changes := make(map[string]domain.ChangeDetail)

	if oldUser.Handle != newUser.Handle {
		changes["handle"] = domain.ChangeDetail{
			Old: oldUser.Handle,
			New: newUser.Handle,
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
	if ptrStr(oldUser.AvatarURL) != ptrStr(newUser.AvatarURL) {
		changes["avatarUrl"] = domain.ChangeDetail{
			Old: ptrStr(oldUser.AvatarURL),
			New: ptrStr(newUser.AvatarURL),
		}
	}
	if ptrStr(oldUser.Bio) != ptrStr(newUser.Bio) {
		changes["bio"] = domain.ChangeDetail{
			Old: ptrStr(oldUser.Bio),
			New: ptrStr(newUser.Bio),
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
		log.Printf("failed to record audit log: %v", err)
	}
}

func ptrStr(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
