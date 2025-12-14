package users

import "time"

type AuditLog struct {
	ID        string                  `json:"id"`
	UserID    ID                      `json:"userId"`
	Action    string                  `json:"action"`
	Changes   map[string]ChangeDetail `json:"changes"`
	IPAddress string                  `json:"ipAddress,omitempty"`
	UserAgent string                  `json:"userAgent,omitempty"`
	Timestamp time.Time               `json:"timestamp"`
}

type ChangeDetail struct {
	Old string `json:"old"`
	New string `json:"new"`
}
