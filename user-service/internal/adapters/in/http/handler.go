package http

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"

	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
	coresvc "github.com/kleffio/www/user-service/internal/core/service/users"
)

type UserService interface {
	Get(ctx context.Context, id domain.ID) (*domain.User, error)
	Refresh(ctx context.Context, id domain.ID) (*domain.User, error)
	ResolveMany(ctx context.Context, ids []domain.ID) (map[domain.ID]*domain.User, error)
}

type Handler struct {
	svc UserService
}

func NewHandler(svc UserService) *Handler {
	return &Handler{svc: svc}
}

type errorResponse struct {
	Error string `json:"error"`
}

// ------- Handlers ------- \\

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("ok"))
}

func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		jsonError(w, http.StatusBadRequest, "missing user id")
		return
	}

	user, err := h.svc.Get(r.Context(), domain.ID(id))
	if err != nil {
		if errors.Is(err, coresvc.ErrUserNotFound) {
			jsonError(w, http.StatusNotFound, "user not found")
			return
		}
		log.Printf("error getting user %s: %v", id, err)
		jsonError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	if user == nil {
		jsonError(w, http.StatusNotFound, "user not found")
		return
	}

	jsonResponse(w, http.StatusOK, user)
}

func (h *Handler) Refresh(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		jsonError(w, http.StatusBadRequest, "missing user id")
		return
	}

	user, err := h.svc.Refresh(r.Context(), domain.ID(id))
	if err != nil {
		if errors.Is(err, coresvc.ErrUserNotFound) {
			jsonError(w, http.StatusNotFound, "user not found")
			return
		}
		log.Printf("error refreshing user %s: %v", id, err)
		jsonError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	if user == nil {
		jsonError(w, http.StatusNotFound, "user not found")
		return
	}

	jsonResponse(w, http.StatusOK, user)
}

type resolveRequest struct {
	IDs []string `json:"ids"`
}

func (h *Handler) ResolveMany(w http.ResponseWriter, r *http.Request) {
	var req resolveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if len(req.IDs) == 0 {
		jsonResponse(w, http.StatusOK, map[string]any{})
		return
	}

	if len(req.IDs) > 100 {
		jsonError(w, http.StatusBadRequest, "too many ids (max 100)")
		return
	}

	ids := make([]domain.ID, len(req.IDs))
	for i, id := range req.IDs {
		ids[i] = domain.ID(id)
	}

	users, err := h.svc.ResolveMany(r.Context(), ids)
	if err != nil {
		log.Printf("error resolving users: %v", err)
		jsonError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	out := make(map[string]any, len(users))
	for id, u := range users {
		out[string(id)] = u
	}

	jsonResponse(w, http.StatusOK, out)
}

// ------- Helpers ------- \\

func jsonResponse(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func jsonError(w http.ResponseWriter, status int, message string) {
	jsonResponse(w, status, errorResponse{Error: message})
}
