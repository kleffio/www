package authentik

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
	port "github.com/kleffio/www/user-service/internal/core/ports/users"
)

type authentikUser struct {
	UUID     string `json:"uuid"`
	Username string `json:"username"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Avatar   string `json:"avatar"`
}

type usersListResponse struct {
	Results []authentikUser `json:"results"`
}

type Client struct {
	baseURL string
	token   string
	http    *http.Client
}

var _ port.IdentityProvider = (*Client)(nil)

func NewClient(baseURL, token string) *Client {
	return &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		token:   token,
		http: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

type userInfo struct {
	Sub               string   `json:"sub"`
	Email             string   `json:"email"`
	EmailVerified     bool     `json:"email_verified"`
	Name              string   `json:"name"`
	PreferredUsername string   `json:"preferred_username"`
	Nickname          string   `json:"nickname"`
	Groups            []string `json:"groups"`
}

func (c *Client) findCoreUserByEmail(ctx context.Context, email string) (*authentikUser, error) {
	q := url.QueryEscape(email)

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		fmt.Sprintf("%s/api/v3/core/users/?email=%s", c.baseURL, q),
		nil,
	)
	if err != nil {
		return nil, err
	}

	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("authentik core users returned %s", resp.Status)
	}

	var body struct {
		Results []authentikUser `json:"results"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return nil, err
	}
	if len(body.Results) == 0 {
		return nil, fmt.Errorf("user with email %s not found", email)
	}

	u := body.Results[0]
	return &u, nil
}

func (c *Client) FetchByToken(ctx context.Context, bearerToken string) (*domain.User, error) {
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		fmt.Sprintf("%s/application/o/userinfo/", c.baseURL),
		nil,
	)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+bearerToken)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden {
		return nil, fmt.Errorf("invalid or expired token")
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("authentik userinfo returned %s", resp.Status)
	}

	var ui userInfo
	if err := json.NewDecoder(resp.Body).Decode(&ui); err != nil {
		return nil, err
	}

	coreUser, err := c.findCoreUserByEmail(ctx, ui.Email)
	if err != nil {
		return nil, err
	}

	return &domain.User{
		ID:          domain.ID(coreUser.UUID),
		Username:    firstNonEmpty(ui.PreferredUsername, ui.Nickname, ui.Email, coreUser.Username),
		DisplayName: firstNonEmpty(ui.Name, coreUser.Name, ui.Email),
		Email:       ui.Email,
		AvatarURL:   coreUser.Avatar,
	}, nil
}

func (c *Client) FetchByID(ctx context.Context, id domain.ID) (*domain.User, error) {
	q := url.QueryEscape(string(id))

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		fmt.Sprintf("%s/api/v3/core/users/?uuid=%s", c.baseURL, q),
		nil,
	)
	if err != nil {
		return nil, err
	}

	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, fmt.Errorf("user %s not found", id)
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("authentik returned %s", resp.Status)
	}

	var body usersListResponse
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return nil, err
	}
	if len(body.Results) == 0 {
		return nil, fmt.Errorf("user %s not found", id)
	}

	au := body.Results[0]

	return &domain.User{
		ID:          id,
		Username:    au.Username,
		DisplayName: firstNonEmpty(au.Name, au.Username, au.Email),
		Email:       au.Email,
		AvatarURL:   au.Avatar,
	}, nil
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if v != "" {
			return v
		}
	}
	return ""
}
