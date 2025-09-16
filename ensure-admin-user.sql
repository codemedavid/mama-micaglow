-- Ensure there's at least one admin user in the database
-- This script will create a default admin user if none exists

-- First, check if there are any admin users
-- If not, create a default admin user

INSERT INTO users (clerk_id, email, first_name, last_name, role, is_active)
VALUES (
  'admin_default_123', 
  'admin@mamamicalglow.com', 
  'Default', 
  'Admin', 
  'admin', 
  true
)
ON CONFLICT (clerk_id) DO NOTHING;

-- Also ensure there's a user with ID 1 (for fallback)
INSERT INTO users (id, clerk_id, email, first_name, last_name, role, is_active)
VALUES (
  1,
  'fallback_admin_1', 
  'fallback@mamamicalglow.com', 
  'Fallback', 
  'Admin', 
  'admin', 
  true
)
ON CONFLICT (id) DO NOTHING;
