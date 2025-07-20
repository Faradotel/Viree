-- Insert test users (if they don't already exist)
INSERT INTO users (id, name, email, password_hash, created_at) 
VALUES 
  (
    gen_random_uuid(),
    'John Doe',
    'john.doe@example.com',
    '$2b$10$8.xQVP4sQ0n5oQ2gQ4l0ZuJQGKVKf3B6zKQGKVKf3B6zKQGKVKf3B6',
    NOW()
  ),
  (
    gen_random_uuid(),
    'Jane Smith',
    'jane.smith@example.com',
    '$2b$10$8.xQVP4sQ0n5oQ2gQ4l0ZuJQGKVKf3B6zKQGKVKf3B6zKQGKVKf3B6',
    NOW()
  ),
  (
    gen_random_uuid(),
    'Paul Martin',
    'paul.martin@example.com',
    '$2b$10$8.xQVP4sQ0n5oQ2gQ4l0ZuJQGKVKf3B6zKQGKVKf3B6zKQGKVKf3B6',
    NOW()
  )
ON CONFLICT (email) DO NOTHING;

-- Add some test friend relationships
WITH user_ids AS (
  SELECT id, email FROM users WHERE email IN ('john.doe@example.com', 'jane.smith@example.com', 'paul.martin@example.com')
)
INSERT INTO user_friends (user_id, friend_id, status)
SELECT 
  u1.id,
  u2.id,
  'accepted'
FROM user_ids u1
CROSS JOIN user_ids u2
WHERE u1.email = 'john.doe@example.com' 
  AND u2.email IN ('jane.smith@example.com', 'paul.martin@example.com')
ON CONFLICT (user_id, friend_id) DO NOTHING;
