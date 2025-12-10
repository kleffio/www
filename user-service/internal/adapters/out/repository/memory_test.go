package repository_test

import (
	"context"
	"testing"
	"time"

	"github.com/kleffio/www/user-service/internal/adapters/out/repository"
	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
)

func TestMemoryRepository_GetSave(t *testing.T) {
	ctx := context.Background()
	id := domain.ID("u1")

	repo := repository.NewMemoryRepository()
	u := &domain.User{ID: id, Username: "test", UpdatedAt: time.Now()}

	if err := repo.Save(ctx, u); err != nil {
		t.Fatalf("Save() error = %v", err)
	}

	got, err := repo.GetByID(ctx, id)
	if err != nil {
		t.Fatalf("GetByID() error = %v", err)
	}
	if got == nil || got.Username != "test" {
		t.Fatalf("unexpected user: %#v", got)
	}
	if got == u {
		t.Fatalf("expected copy, got same pointer")
	}
}
