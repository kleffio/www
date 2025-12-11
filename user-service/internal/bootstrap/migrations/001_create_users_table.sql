CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    authentik_id VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    login_username VARCHAR(255),
    handle VARCHAR(63) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT users_handle_format CHECK (handle ~ '^[a-z0-9_-]+$'),
    CONSTRAINT users_handle_length CHECK (LENGTH(handle) >= 2 AND LENGTH(handle) <= 63)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_handle ON users(handle);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_authentik_id ON users(authentik_id) WHERE authentik_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

CREATE OR REPLACE FUNCTION update_users_updated_at()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();