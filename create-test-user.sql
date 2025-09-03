INSERT INTO "User" (id, email, username, name, password, "createdAt", "updatedAt") 
VALUES (
  'test-user-1',
  'test@example.com',
  'testuser',
  'Test User',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O',
  NOW(),
  NOW()
) ON CONFLICT (email) DO