package repository

import (
	port "github.com/kleffio/www/user-service/internal/core/ports/users"
)

// Repository is a type alias for the port interface
// This allows the repository package to reference the interface cleanly
type Repository = port.Repository
