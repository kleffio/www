-- Insert dummy projects
INSERT INTO projects (project_id, name, description, owner_id, repository_url, branch, docker_compose_path, project_status, created_date, updated_date)
VALUES
    ('project123',
     'E-Commerce Platform',
     'Full-stack e-commerce application with React frontend and Spring Boot backend',
     'user-123',
     'https://github.com/example/ecommerce-platform',
     'main',
     '/docker/docker-compose.yml',
     'ACTIVE',
     CURRENT_TIMESTAMP,
     CURRENT_TIMESTAMP),

    ('project456',
     'Analytics Dashboard',
     'Real-time analytics dashboard for monitoring application metrics',
     'user-123',
     'https://github.com/example/analytics-dashboard',
     'develop',
     '/deployment/docker-compose.yml',
     'ACTIVE',
     CURRENT_TIMESTAMP - INTERVAL '5 days',
     CURRENT_TIMESTAMP - INTERVAL '2 days'),

    ('project789',
     'Task Management System',
     'Collaborative task management tool with team features',
     'user-456',
     'https://github.com/example/task-manager',
     'main',
     '/docker-compose.yml',
     'PENDING',
     CURRENT_TIMESTAMP - INTERVAL '10 days',
     CURRENT_TIMESTAMP - INTERVAL '3 days'),

    (gen_random_uuid(),
     'Payment Gateway Integration',
     'Microservice for handling payment processing and transactions',
     'user-789',
     'https://github.com/example/payment-service',
     'feature/stripe-integration',
     '/infra/docker-compose.yml',
     'FAILED',
     CURRENT_TIMESTAMP - INTERVAL '15 days',
     CURRENT_TIMESTAMP - INTERVAL '1 day'),

    (gen_random_uuid(),
     'Authentication Service',
     'OAuth2 and JWT-based authentication microservice',
     'user-456',
     'https://github.com/example/auth-service',
     'main',
     '/docker/docker-compose.prod.yml',
     'ACTIVE',
     CURRENT_TIMESTAMP - INTERVAL '30 days',
     CURRENT_TIMESTAMP - INTERVAL '5 days');

INSERT INTO invitations (project_id, inviter_id, invitee_email, role, status, created_at, updated_at)
VALUES 
    ('proj-001', 'user-owner-1', 'developer@example.com', 'DEVELOPER', 'PENDING', now(), now()),
    ('proj-001', 'user-owner-1', 'viewer@example.com', 'VIEWER', 'PENDING', now(), now()),
    ('proj-002', 'user-owner-2', 'admin@example.com', 'ADMIN', 'ACCEPTED', now(), now()),
    ('proj-003', 'user-owner-1', 'developer2@example.com', 'DEVELOPER', 'EXPIRED', now(), now());

INSERT INTO collaborators (project_id, user_id, role, status, invited_by, invited_at, accepted_at, created_at, updated_at)
VALUES 
    ('project123', 'user-123', 'OWNER', 'ACCEPTED', 'system', now(), now(), now(), now()),
    ('project123', 'user-dev-1', 'DEVELOPER', 'ACCEPTED', 'user-123', now(), now(), now(), now()),
    ('project123', 'user-viewer-1', 'VIEWER', 'ACCEPTED', 'user-123', now(), now(), now(), now()),
    ('project456', 'user-123', 'OWNER', 'ACCEPTED', 'system', now(), now(), now(), now()),
    ('project456', 'user-admin-1', 'ADMIN', 'ACCEPTED', 'user-123', now(), now(), now(), now()),
    ('project789', 'user-456', 'OWNER', 'ACCEPTED', 'system', now(), now(), now(), now()),
    ('project789', 'user-dev-2', 'DEVELOPER', 'PENDING', 'user-456', now(), NULL, now(), now());