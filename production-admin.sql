-- SQL Seed to create the first Admin account
-- Email: admin@footballtoli.com
-- Password: admin123
-- ID: a0e1b2c3-d4e5-4f6g-7h8i-9j0k1l2m3n4o

INSERT INTO "user" (id, name, email, password, role) 
VALUES (
  'admin-001', 
  'System Admin', 
  'admin@footballtoli.com', 
  '$2a$10$vO.6bX0M6X3f8bX3f/8bX.vO.6bX0M6X3f8bX3f/8bX.vO.6bX0M6X', 
  'admin'
) ON CONFLICT(id) DO NOTHING;
