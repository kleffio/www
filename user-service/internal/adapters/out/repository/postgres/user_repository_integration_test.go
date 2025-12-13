//go:build integration
// +build integration

package postgres

import (
	"context"
	"os"
	"testing"
	"time"

	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
)

func mustTestDSN(t *testing.T) string {
	t.Helper()
	dsn := os.Getenv("USER_SERVICE_TEST_PG_DSN")
	if dsn == "" {
		t.Skip("USER_SERVICE_TEST_PG_DSN not set")
	}
	return dsn
}

func cleanupUsers(t *testing.T, repo *PostgresUserRepository) {
	t.Helper()
	_, err := repo.db.ExecContext(context.Background(), `DELETE FROM users`)
	if err != nil {
		t.Fatalf("cleanup users failed: %v", err)
	}
}

func strPtr(s string) *string { return &s }

func TestPostgresUserRepository_CRUDAndHelpers(t *testing.T) {
	ctx := context.Background()

	repo, err := NewPostgresUserRepository(mustTestDSN(t))
	if err != nil {
		t.Fatalf("NewPostgresUserRepository: %v", err)
	}
	defer repo.Close()

	if err := repo.CreateTable(ctx); err != nil {
		t.Fatalf("CreateTable: %v", err)
	}
	cleanupUsers(t, repo)

	now := time.Now().UTC().Truncate(time.Microsecond)

	u := &domain.User{
		ID:            "sub_user_1",
		AuthentikID:   "auth_uuid_1",
		Email:         "a@b.com",
		EmailVerified: true,
		LoginUsername: "loginname",
		Username:      "handle_one",
		DisplayName:   "Handle One",
		AvatarURL:     strPtr("https://cdn.example.com/a.png"),
		Bio:           strPtr("bio text"),
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	if err := repo.Save(ctx, u); err != nil {
		t.Fatalf("Save: %v", err)
	}

	got, err := repo.GetByID(ctx, u.ID)
	if err != nil {
		t.Fatalf("GetByID: %v", err)
	}
	if got == nil {
		t.Fatalf("expected user, got nil")
	}
	if got.ID != u.ID || got.Email != u.Email || got.Username != u.Username || got.DisplayName != u.DisplayName {
		t.Fatalf("unexpected user: %+v", got)
	}
	if got.AuthentikID != u.AuthentikID {
		t.Fatalf("authentik id mismatch: want %q got %q", u.AuthentikID, got.AuthentikID)
	}
	if got.LoginUsername != u.LoginUsername {
		t.Fatalf("login username mismatch: want %q got %q", u.LoginUsername, got.LoginUsername)
	}
	if got.AvatarURL == nil || *got.AvatarURL != *u.AvatarURL {
		t.Fatalf("avatar mismatch: want %v got %v", u.AvatarURL, got.AvatarURL)
	}
	if got.Bio == nil || *got.Bio != *u.Bio {
		t.Fatalf("bio mismatch: want %v got %v", u.Bio, got.Bio)
	}

	got2, err := repo.GetByUsername(ctx, u.Username)
	if err != nil {
		t.Fatalf("GetByUsername: %v", err)
	}
	if got2 == nil || got2.ID != u.ID {
		t.Fatalf("expected same user by username")
	}

	exists, err := repo.UsernameExists(ctx, u.Username, "someone_else")
	if err != nil {
		t.Fatalf("UsernameExists: %v", err)
	}
	if !exists {
		t.Fatalf("expected username to exist")
	}
	exists, err = repo.UsernameExists(ctx, u.Username, u.ID)
	if err != nil {
		t.Fatalf("UsernameExists exclude self: %v", err)
	}
	if exists {
		t.Fatalf("expected username to NOT exist when excluding same id")
	}

	newUsername := "handle_two"
	newDisplay := "Handle Two"
	newAvatar := "https://cdn.example.com/b.png"
	newBio := "new bio"

	upd := &domain.ProfileUpdate{
		Username:    &newUsername,
		DisplayName: &newDisplay,
		AvatarURL:   &newAvatar,
		Bio:         &newBio,
	}
	if err := repo.UpdateProfile(ctx, u.ID, upd); err != nil {
		t.Fatalf("UpdateProfile: %v", err)
	}

	got3, err := repo.GetByID(ctx, u.ID)
	if err != nil {
		t.Fatalf("GetByID after update: %v", err)
	}
	if got3 == nil {
		t.Fatalf("expected user, got nil")
	}
	if got3.Username != newUsername || got3.DisplayName != newDisplay {
		t.Fatalf("update mismatch: %+v", got3)
	}
	if got3.AvatarURL == nil || *got3.AvatarURL != newAvatar {
		t.Fatalf("avatar mismatch after update")
	}
	if got3.Bio == nil || *got3.Bio != newBio {
		t.Fatalf("bio mismatch after update")
	}

	if err := repo.UpdateProfile(ctx, u.ID, &domain.ProfileUpdate{}); err != nil {
		t.Fatalf("UpdateProfile no-op should not error: %v", err)
	}

	missingUsername := "doesntmatter"
	if err := repo.UpdateProfile(ctx, domain.ID("missing_user"), &domain.ProfileUpdate{Username: &missingUsername}); err == nil {
		t.Fatalf("expected error for missing user")
	}

	gotNil, err := repo.GetByID(ctx, domain.ID("missing_user"))
	if err != nil {
		t.Fatalf("GetByID missing: %v", err)
	}
	if gotNil != nil {
		t.Fatalf("expected nil user for missing id")
	}
}
