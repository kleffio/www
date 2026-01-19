
DROP TABLE IF EXISTS projects CASCADE;


CREATE TABLE projects (
                          project_id UUID PRIMARY KEY DEFAULT,
                          name VARCHAR(255) NOT NULL,
                          description TEXT,
                          owner_id VARCHAR(255) NOT NULL,
                          environment_variables JSONB,
                          project_status VARCHAR(50) NOT NULL,
                          created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS invitations;
CREATE TABLE IF NOT EXISTS invitations
(
    id                  int AUTO_INCREMENT PRIMARY KEY,
    project_id          varchar(45) not null,
    inviter_id          varchar(45) not null,
    invitee_email       varchar(45) not null,
    role                enum ('OWNER', 'ADMIN', 'DEVELOPER', 'VIEWER'),
    status              enum ('PENDING', 'ACCEPTED', 'EXPIRED'),
    expires_at          timestamp,
    created_at          timestamp,
    updated_at          timestamp
);

DROP TABLE IF EXISTS collaborators;
CREATE TABLE IF NOT EXISTS collaborators
(
    id                  int AUTO_INCREMENT PRIMARY KEY,
    project_id          varchar(45) not null,
    user_id             varchar(45) not null,
    role                enum ('OWNER', 'ADMIN', 'DEVELOPER', 'VIEWER') not null,
    status              enum ('PENDING', 'ACCEPTED', 'REFUSED', 'EXPIRED') not null,
    invited_by          varchar(45) not null,
    invited_at          timestamp not null,
    accepted_at         timestamp,
    created_at          timestamp not null,
    updated_at          timestamp not null,
    unique key unique_project_user (project_id, user_id)
);