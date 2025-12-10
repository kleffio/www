package http_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	httpadpt "github.com/kleffio/www/user-service/internal/adapters/in/http"
	coresvc "github.com/kleffio/www/user-service/internal/core/service/users"
)

func TestRouter_HealthEndpointsRegistered(t *testing.T) {
	h := httpadpt.NewHandler(&coresvc.Service{})
	router := httpadpt.NewRouter(h)

	ts := httptest.NewServer(router)
	defer ts.Close()

	for _, path := range []string{"/healthz", "/health"} {
		resp, err := http.Get(ts.URL + path)
		if err != nil {
			t.Fatalf("GET %s failed: %v", path, err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200 for %s, got %d", path, resp.StatusCode)
		}
	}
}
