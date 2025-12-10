package authentik_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kleffio/www/user-service/internal/adapters/out/authentik"
	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
)

func TestClient_FetchByID_Success(t *testing.T) {
	const uuid = "d3c5cf51-8d51-4a86-9b1c-7b8d9b5b873a"

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if got := r.URL.Query().Get("uuid"); got != "d3c5cf518d514a869b1c7b8d9b5b873a" {
			t.Fatalf("expected uuid param without hyphens, got %q", got)
		}
		resp := map[string]any{
			"results": []any{
				map[string]any{
					"uuid":     uuid,
					"username": "isaac",
					"name":     "Isaac Wallace",
					"email":    "isaac@example.com",
					"avatar":   "https://example.com/a.png",
				},
			},
		}
		_ = json.NewEncoder(w).Encode(resp)
	}))
	defer ts.Close()

	client := authentik.NewClient(ts.URL, "token")
	u, err := client.FetchByID(context.Background(), domain.ID(uuid))
	if err != nil {
		t.Fatalf("FetchByID() error = %v", err)
	}
	if u.Username != "isaac" || u.Email != "isaac@example.com" {
		t.Fatalf("unexpected user: %#v", u)
	}
}
