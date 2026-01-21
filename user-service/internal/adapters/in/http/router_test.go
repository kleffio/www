package http

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRouterSmoke(t *testing.T) {
	h := NewHandler(&mockUserService{})
	r := NewRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
}
