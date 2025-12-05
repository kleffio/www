CREATE TABLE IF NOT EXISTS users (
    authentik_uid      VARCHAR(64) PRIMARY KEY,
    theme              VARCHAR(32) NOT NULL DEFAULT 'dark',
    timezone           VARCHAR(64),
    marketing_emails   BOOLEAN NOT NULL DEFAULT FALSE
);
