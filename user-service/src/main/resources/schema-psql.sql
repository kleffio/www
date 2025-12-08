CREATE TABLE users (
    authentik_uid VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    theme VARCHAR(50) NOT NULL DEFAULT 'dark',
    timezone VARCHAR(100),
    marketing_emails BOOLEAN NOT NULL DEFAULT false
);