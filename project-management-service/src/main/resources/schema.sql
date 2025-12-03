
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

-- Index for owners currently not necessary
-- CREATE INDEX idx_projects_owner_id ON projects(owner_id);