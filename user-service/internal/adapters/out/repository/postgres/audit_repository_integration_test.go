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

func mustTestDSNAudit(t *testing.T) string {
	t.Helper()
	dsn := os.Getenv("USER_SERVICE_TEST_PG_DSN")
	if dsn == "" {
		t.Skip("USER_SERVICE_TEST_PG_DSN not set")
	}
	return dsn
}

func cleanupAudit(t *testing.T, repo *PostgresAuditRepository) {
	t.Helper()
	_, err := repo.db.ExecContext(context.Background(), `DELETE FROM audit_logs`)
	if err != nil {
		t.Fatalf("cleanup audit_logs failed: %v", err)
	}
}

func TestPostgresAuditRepository_RecordGetCount(t *testing.T) {
	ctx := context.Background()

	repo, err := NewPostgresAuditRepository(mustTestDSNAudit(t))
	if err != nil {
		t.Fatalf("NewPostgresAuditRepository: %v", err)
	}
	defer repo.Close()

	if err := repo.CreateTable(ctx); err != nil {
		t.Fatalf("CreateTable: %v", err)
	}
	cleanupAudit(t, repo)

	userID := domain.ID("sub_user_1")

	t1 := time.Now().UTC().Add(-2 * time.Minute).Truncate(time.Microsecond)
	t2 := time.Now().UTC().Add(-1 * time.Minute).Truncate(time.Microsecond)

	log1 := &domain.AuditLog{
		ID:        "log1",
		UserID:    userID,
		Action:    "profile.update",
		Changes:   map[string]domain.ChangeDetail{"username": {Old: "a", New: "b"}},
		IPAddress: "",
		UserAgent: "",
		Timestamp: t1,
	}
	log2 := &domain.AuditLog{
		ID:        "log2",
		UserID:    userID,
		Action:    "profile.update",
		Changes:   map[string]domain.ChangeDetail{"displayName": {Old: "x", New: "y"}},
		IPAddress: "127.0.0.1",
		UserAgent: "curl/8",
		Timestamp: t2,
	}

	if err := repo.Record(ctx, log1); err != nil {
		t.Fatalf("Record log1: %v", err)
	}
	if err := repo.Record(ctx, log2); err != nil {
		t.Fatalf("Record log2: %v", err)
	}

	total, err := repo.CountByUser(ctx, string(userID))
	if err != nil {
		t.Fatalf("CountByUser: %v", err)
	}
	if total != 2 {
		t.Fatalf("expected total=2 got %d", total)
	}

	logs, err := repo.GetUserAuditLogs(ctx, userID, 10, 0)
	if err != nil {
		t.Fatalf("GetUserAuditLogs: %v", err)
	}
	if len(logs) != 2 {
		t.Fatalf("expected 2 logs, got %d", len(logs))
	}
	if logs[0].ID != "log2" {
		t.Fatalf("expected newest first (log2), got %s", logs[0].ID)
	}

	var found1 *domain.AuditLog
	for _, l := range logs {
		if l.ID == "log1" {
			found1 = l
		}
	}
	if found1 == nil {
		t.Fatalf("expected to find log1")
	}
	if found1.IPAddress != "" {
		t.Fatalf("expected empty ip for log1, got %q", found1.IPAddress)
	}
	if found1.UserAgent != "" {
		t.Fatalf("expected empty user-agent for log1, got %q", found1.UserAgent)
	}

	page1, err := repo.GetUserAuditLogs(ctx, userID, 1, 0)
	if err != nil {
		t.Fatalf("GetUserAuditLogs page1: %v", err)
	}
	if len(page1) != 1 || page1[0].ID != "log2" {
		t.Fatalf("expected page1 to be [log2]")
	}

	page2, err := repo.GetUserAuditLogs(ctx, userID, 1, 1)
	if err != nil {
		t.Fatalf("GetUserAuditLogs page2: %v", err)
	}
	if len(page2) != 1 || page2[0].ID != "log1" {
		t.Fatalf("expected page2 to be [log1]")
	}
}
