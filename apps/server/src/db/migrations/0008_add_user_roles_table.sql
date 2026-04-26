-- Create junction table for multi-role support
-- Users can now hold multiple roles simultaneously (customer + winemaker + shop_owner)

CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role varchar(50) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Index for faster lookups
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Migrate existing single roles to the new table
-- All users start with "customer" role if they don't have one
INSERT INTO user_roles (user_id, role)
SELECT id, COALESCE(role, 'customer') FROM users
WHERE id NOT IN (SELECT user_id FROM user_roles);

-- Drop the single role column from users
ALTER TABLE users DROP COLUMN role;

-- Verified: All users now have at least one role in user_roles table
