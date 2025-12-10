package authentik

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	domain "github.com/kleffio/www/user-service/internal/core/domain/users"
	port "github.com/kleffio/www/user-service/internal/core/ports/users"
)

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

func (c *Client) FetchByID(ctx context.Context, id domain.ID) (*domain.User, error) {
	uuidNoHyphens := strings.ReplaceAll(string(id), "-", "")

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		fmt.Sprintf("%s/api/v3/core/users/?uuid=%s", c.baseURL, uuidNoHyphens),
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
		ID:          domain.ID(au.UUID),
		Username:    au.Username,
		DisplayName: firstNonEmpty(au.Name, au.Username),
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
