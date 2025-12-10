package users

import "time"

type ID string

type User struct {
	ID          ID        `json:"id"`
	Username    string    `json:"username"`
	DisplayName string    `json:"displayName"`
	Email       string    `json:"email"`
	AvatarURL   string    `json:"avatarUrl"`
	UpdatedAt   time.Time `json:"updatedAt"`
}
