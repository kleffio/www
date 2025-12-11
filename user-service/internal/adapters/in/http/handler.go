package http

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"

	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
	coresvc "github.com/kleffio/www/user-service/internal/core/service/users"
)

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
	_, _ = w.Write([]byte("ok"))
}

func (h *Handler) GetMe(w http.ResponseWriter, r *http.Request) {
	token := extractBearerToken(r)
	if token == "" {
		jsonError(w, http.StatusUnauthorized, "missing or invalid authorization header")
		return
	}

	user, err := h.svc.GetMe(r.Context(), token)
	if err != nil {
		if errors.Is(err, coresvc.ErrInvalidToken) {
			jsonError(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}
		if errors.Is(err, coresvc.ErrUserNotFound) {
			jsonError(w, http.StatusNotFound, "user not found")
			return
		}
		log.Printf("error getting current user: %v", err)
		jsonError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	jsonResponse(w, http.StatusOK, user)
}

func (h *Handler) PatchMeProfile(w http.ResponseWriter, r *http.Request) {
	token := extractBearerToken(r)
	if token == "" {
		jsonError(w, http.StatusUnauthorized, "missing or invalid authorization header")
		return
	}

	user, err := h.svc.GetMe(r.Context(), token)
	if err != nil {
		if errors.Is(err, coresvc.ErrInvalidToken) {
			jsonError(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}
		log.Printf("error validating token: %v", err)
		jsonError(w, http.StatusUnauthorized, "invalid token")
		return
	}

	var update domain.ProfileUpdate
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		jsonError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	updated, err := h.svc.UpdateProfile(r.Context(), user.ID, &update)
	if err != nil {
		if errors.Is(err, coresvc.ErrInvalidHandle) {
			jsonError(w, http.StatusBadRequest, "invalid handle format (use lowercase letters, numbers, hyphens, underscores only)")
			return
		}
		if errors.Is(err, coresvc.ErrHandleTaken) {
			jsonError(w, http.StatusConflict, "handle already taken")
			return
		}
		if errors.Is(err, coresvc.ErrInvalidUpdate) {
			jsonError(w, http.StatusBadRequest, "invalid profile data")
			return
		}
		log.Printf("error updating profile: %v", err)
		jsonError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	jsonResponse(w, http.StatusOK, updated)
}

func (h *Handler) GetPublicProfile(w http.ResponseWriter, r *http.Request) {
	handle := chi.URLParam(r, "handle")
	if handle == "" {
		jsonError(w, http.StatusBadRequest, "missing handle")
		return
	}

	handle = strings.TrimPrefix(handle, "@")

	user, err := h.svc.GetByHandle(r.Context(), handle)
	if err != nil {
		if errors.Is(err, coresvc.ErrUserNotFound) {
			jsonError(w, http.StatusNotFound, "profile not found")
			return
		}
		log.Printf("error getting profile by handle %s: %v", handle, err)
		jsonError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	jsonResponse(w, http.StatusOK, user.PublicProfile())
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

func (h *Handler) GetAuditLogs(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		jsonError(w, http.StatusBadRequest, "missing user id")
		return
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	if limit <= 0 || limit > 100 {
		limit = 20
	}

	logs, err := h.svc.GetAuditLogs(r.Context(), domain.ID(id), limit, offset)
	if err != nil {
		log.Printf("error getting audit logs for user %s: %v", id, err)
		jsonError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	if logs == nil {
		logs = []*domain.AuditLog{}
	}

	jsonResponse(w, http.StatusOK, logs)
}

// ------- Helpers ------- \\

func extractBearerToken(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return ""
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return ""
	}

	return parts[1]
}

func jsonResponse(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func jsonError(w http.ResponseWriter, status int, message string) {
	jsonResponse(w, status, errorResponse{Error: message})
}
