package dto

type CallbackRequest struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	IDToken      string `json:"id_token"`
	ExpiresIn    int    `json:"expires_in"`
}

type SessionResponse struct {
	SessionID string `json:"session_id"`
}
