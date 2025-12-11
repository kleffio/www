package users

import "time"

type ID string

type User struct {
	ID            ID     `json:"id"`
	AuthentikID   string `json:"-"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"emailVerified"`

	LoginUsername string `json:"-"`

	Handle      string  `json:"handle"`
	DisplayName string  `json:"displayName"`
	AvatarURL   *string `json:"avatarUrl,omitempty"`
	Bio         *string `json:"bio,omitempty"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (u *User) PublicProfile() *PublicProfile {
	return &PublicProfile{
		Handle:      u.Handle,
		DisplayName: u.DisplayName,
		AvatarURL:   u.AvatarURL,
		Bio:         u.Bio,
		CreatedAt:   u.CreatedAt,
	}
}

type PublicProfile struct {
	Handle      string    `json:"handle"`
	DisplayName string    `json:"displayName"`
	AvatarURL   *string   `json:"avatarUrl,omitempty"`
	Bio         *string   `json:"bio,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
}

type ProfileUpdate struct {
	Handle      *string `json:"handle,omitempty"`
	DisplayName *string `json:"displayName,omitempty"`
	AvatarURL   *string `json:"avatarUrl,omitempty"`
	Bio         *string `json:"bio,omitempty"`
}
