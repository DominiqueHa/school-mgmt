-- Ajout du rôle super_admin
INSERT INTO roles (name) VALUES ('super_admin') ON CONFLICT (name) DO NOTHING;

-- Rendre email nullable
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Ajout de la colonne school_id pour le multi-établissement
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS school_id UUID DEFAULT NULL;

-- Créer le compte super admin
INSERT INTO users (
  username, email, password_hash, first_name, last_name,
  role_id, status, must_change_password
)
SELECT
  'SUPER-ADMIN',
  'superadmin@school-mgmt.com',
  '$2b$12$JVTcxeRSLS8AkmEV7kjk3eIzazlTKfbPxdCx7Z1mWY25eG99ZgRay',
  'Super',
  'Admin',
  r.id,
  'active',
  FALSE
FROM roles r
WHERE r.name = 'super_admin'
ON CONFLICT (username) DO NOTHING;

-- Toutes les permissions au super_admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Permissions granulaires
INSERT INTO permissions (name, description, category) VALUES
  ('create_director', 'Créer un directeur d''école', 'admin'),
  ('manage_schools', 'Gérer les établissements', 'admin'),
  ('grant_create', 'Donner la permission de créer', 'permissions'),
  ('grant_edit', 'Donner la permission de modifier', 'permissions'),
  ('grant_delete', 'Donner la permission de supprimer', 'permissions')
ON CONFLICT (name) DO NOTHING;
