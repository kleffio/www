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
	AvatarURL   *string `json:"avatarUrl"`
	Bio         *string `json:"bio"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (u *User) PublicProfile() *PublicProfile {
	avatarURL := ""
	if u.AvatarURL != nil {
		avatarURL = *u.AvatarURL
	}

	bio := ""
	if u.Bio != nil {
		bio = *u.Bio
	}

	return &PublicProfile{
		Handle:      u.Handle,
		DisplayName: u.DisplayName,
		AvatarURL:   avatarURL,
		Bio:         bio,
		CreatedAt:   u.CreatedAt,
	}
}

type PublicProfile struct {
	Handle      string    `json:"handle"`
	DisplayName string    `json:"displayName"`
	AvatarURL   string    `json:"avatarUrl"`
	Bio         string    `json:"bio"`
	CreatedAt   time.Time `json:"createdAt"`
}

type ProfileUpdate struct {
	Handle      *string `json:"handle,omitempty"`
	DisplayName *string `json:"displayName,omitempty"`
	AvatarURL   *string `json:"avatarUrl,omitempty"`
	Bio         *string `json:"bio,omitempty"`
}
