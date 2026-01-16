//go:build !test
// +build !test

package authentik

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	port "github.com/kleffio/www/user-service/internal/core/ports/users"
)

type AuthentikManager struct {
	baseURL  string
	apiToken string
	http     *http.Client
}

var _ port.AuthentikUserManager = (*AuthentikManager)(nil)

func NewAuthentikManager(baseURL string, apiToken string) *AuthentikManager {
	return &AuthentikManager{
		baseURL:  strings.TrimRight(baseURL, "/"),
		apiToken: apiToken,
		http: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

type updateUsernameRequest struct {
	Username string `json:"username"`
}

type authentikUser struct {
	PK       int    `json:"pk"`
	Username string `json:"username"`
	Email    string `json:"email"`
	UID      string `json:"uid"`
}

type authentikUserList struct {
	Results []authentikUser `json:"results"`
}

func (m *AuthentikManager) resolveUserPK(ctx context.Context, authentikUUID string) (int, error) {
	if m.apiToken == "" {
		return 0, fmt.Errorf("AUTHENTIK_API_TOKEN not configured")
	}

	authentikUUID = strings.TrimSpace(authentikUUID)
	if authentikUUID == "" {
		return 0, fmt.Errorf("authentik UUID is empty")
	}

	listURL := fmt.Sprintf(
		"%s/api/v3/core/users/?uid=%s",
		m.baseURL,
		url.QueryEscape(authentikUUID),
	)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, listURL, nil)
	if err != nil {
		return 0, fmt.Errorf("failed to create authentik lookup request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+m.apiToken)

	resp, err := m.http.Do(req)
	if err != nil {
		return 0, fmt.Errorf("authentik lookup request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return 0, fmt.Errorf("user not found in authentik")
	}
	if resp.StatusCode == http.StatusForbidden {
		return 0, fmt.Errorf("authentik API token lacks permissions (403 Forbidden) - ensure token is for an admin user")
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return 0, fmt.Errorf("authentik lookup returned status %d", resp.StatusCode)
	}

	var list authentikUserList
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return 0, fmt.Errorf("failed to decode authentik user list: %w", err)
	}
	if len(list.Results) == 0 {
		return 0, fmt.Errorf("user not found in authentik (uid=%s)", authentikUUID)
	}

	return list.Results[0].PK, nil
}

func (m *AuthentikManager) UpdateUsername(ctx context.Context, authentikUUID string, username string) error {
	if m.apiToken == "" {
		return fmt.Errorf("AUTHENTIK_API_TOKEN not configured")
	}

	pk, err := m.resolveUserPK(ctx, authentikUUID)
	if err != nil {
		return fmt.Errorf("failed to resolve user PK from UUID %s: %w", authentikUUID, err)
	}

	reqBody := updateUsernameRequest{
		Username: username,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	updateURL := fmt.Sprintf("%s/api/v3/core/users/%d/", m.baseURL, pk)
	req, err := http.NewRequestWithContext(ctx, http.MethodPatch, updateURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+m.apiToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := m.http.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return fmt.Errorf("user not found in Authentik (PK=%d)", pk)
	}

	if resp.StatusCode == http.StatusForbidden {
		return fmt.Errorf("authentik API token lacks permissions (403 Forbidden) - ensure token is for an admin user")
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("authentik API returned status %d", resp.StatusCode)
	}

	return nil
}
