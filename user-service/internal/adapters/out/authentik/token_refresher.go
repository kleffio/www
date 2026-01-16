//go:build !test
// +build !test

package authentik

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	authdomain "github.com/kleffio/www/user-service/internal/core/domain/auth"
	authport "github.com/kleffio/www/user-service/internal/core/ports/auth"
)

type TokenRefresher struct {
	baseURL      string
	clientID     string
	clientSecret string
	http         *http.Client
}

var _ authport.TokenRefresher = (*TokenRefresher)(nil)

func NewTokenRefresher(baseURL, clientID, clientSecret string) *TokenRefresher {
	return &TokenRefresher{
		baseURL:      strings.TrimRight(baseURL, "/"),
		clientID:     clientID,
		clientSecret: clientSecret,
		http: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (r *TokenRefresher) RefreshToken(ctx context.Context, refreshToken string) (*authdomain.OAuthTokenResponse, error) {
	tokenURL := fmt.Sprintf("%s/application/o/token/", r.baseURL)

	data := url.Values{}
	data.Set("grant_type", "refresh_token")
	data.Set("refresh_token", refreshToken)
	data.Set("client_id", r.clientID)
	data.Set("client_secret", r.clientSecret)

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		tokenURL,
		strings.NewReader(data.Encode()),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := r.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusBadRequest || resp.StatusCode == http.StatusUnauthorized {
		return nil, fmt.Errorf("invalid refresh token")
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("token endpoint returned status %d", resp.StatusCode)
	}

	var tokens authdomain.OAuthTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokens); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &tokens, nil
}
