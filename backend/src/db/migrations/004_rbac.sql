-- Nouveaux rôles hiérarchiques
INSERT INTO roles (name) VALUES
  ('director'),
  ('deputy_director'),
  ('censor'),
  ('accountant')
ON CONFLICT (name) DO NOTHING;

-- Table des permissions
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table de liaison rôle <-> permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- Permissions disponibles
INSERT INTO permissions (name, description, category) VALUES
  -- Utilisateurs
  ('create_user', 'Créer un utilisateur', 'users'),
  ('edit_user', 'Modifier un utilisateur', 'users'),
  ('delete_user', 'Supprimer un utilisateur', 'users'),
  ('view_users', 'Voir la liste des utilisateurs', 'users'),

  -- Élèves
  ('create_student', 'Créer un élève', 'students'),
  ('edit_student', 'Modifier un élève', 'students'),
  ('delete_student', 'Supprimer un élève', 'students'),
  ('view_students', 'Voir les élèves', 'students'),

  -- Enseignants
  ('create_teacher', 'Créer un enseignant', 'teachers'),
  ('edit_teacher', 'Modifier un enseignant', 'teachers'),
  ('delete_teacher', 'Supprimer un enseignant', 'teachers'),
  ('view_teachers', 'Voir les enseignants', 'teachers'),

  -- Structure
  ('manage_structure', 'Gérer années et classes', 'structure'),
  ('view_structure', 'Voir la structure', 'structure'),

  -- Finances
  ('view_finances', 'Voir les finances', 'finances'),
  ('manage_finances', 'Gérer les finances', 'finances'),

  -- Permissions
  ('manage_permissions', 'Gérer les permissions des rôles', 'admin'),
  ('view_permissions', 'Voir les permissions', 'admin')

ON CONFLICT (name) DO NOTHING;

-- Le directeur a toutes les permissions par défaut
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'director'
ON CONFLICT DO NOTHING;
