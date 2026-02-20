-- Initialize admin user for development
-- Only runs if admin user doesn't exist

MERGE INTO users KEY(email) VALUES (
    RANDOM_UUID(),
    'System Administrator',
    'admin@eventflow.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'admin',
    'active'
);

-- The default password is: admin123
-- Password hash generated with BCryptPasswordEncoder
-- IMPORTANT: Change this password in production!
