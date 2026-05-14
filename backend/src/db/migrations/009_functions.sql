-- Table des fonctions
CREATE TABLE IF NOT EXISTS functions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  label VARCHAR(100) NOT NULL,
  description TEXT,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  is_mixable BOOLEAN DEFAULT TRUE,
  is_exclusive BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (name, role_id)
);

-- Table de liaison user <-> functions
CREATE TABLE IF NOT EXISTS user_functions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  function_id UUID REFERENCES functions(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE (user_id, function_id)
);

-- Fonctions par défaut pour super_admin
INSERT INTO functions (name, label, description, role_id, is_mixable, is_exclusive)
SELECT 'technician', 'Technicien', 'Gestion technique du système', r.id, FALSE, TRUE
FROM roles r WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Fonctions pour admin
INSERT INTO functions (name, label, description, role_id, is_mixable, is_exclusive)
SELECT f.name, f.label, f.description, r.id, f.is_mixable, f.is_exclusive
FROM roles r, (VALUES
  ('director', 'Directeur', 'Directeur général de l''école', FALSE, TRUE),
  ('deputy_director', 'Directeur Adjoint', 'Adjoint du directeur', TRUE, FALSE),
  ('censor', 'Censeur', 'Censeur de l''établissement', TRUE, FALSE),
  ('accountant', 'Comptable', 'Gestion financière', TRUE, FALSE),
  ('supervisor', 'Surveillant', 'Surveillance des élèves', TRUE, FALSE),
  ('secretary', 'Secrétaire', 'Secrétariat de direction', TRUE, FALSE)
) AS f(name, label, description, is_mixable, is_exclusive)
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Fonctions pour teacher
INSERT INTO functions (name, label, description, role_id, is_mixable, is_exclusive)
SELECT f.name, f.label, f.description, r.id, f.is_mixable, f.is_exclusive
FROM roles r, (VALUES
  ('head_teacher', 'Professeur Principal', 'Professeur principal de classe', TRUE, FALSE),
  ('subject_teacher', 'Professeur de Matière', 'Enseignant d''une matière', TRUE, FALSE)
) AS f(name, label, description, is_mixable, is_exclusive)
WHERE r.name = 'teacher'
ON CONFLICT DO NOTHING;

-- Fonctions pour student
INSERT INTO functions (name, label, description, role_id, is_mixable, is_exclusive)
SELECT f.name, f.label, f.description, r.id, f.is_mixable, f.is_exclusive
FROM roles r, (VALUES
  ('class_representative_1', 'Délégué de Classe (1er)', '1er délégué de classe', TRUE, FALSE),
  ('class_representative_2', 'Délégué de Classe (2ème)', '2ème délégué de classe', TRUE, FALSE),
  ('school_representative_1', 'Délégué Général (1er)', '1er délégué général', TRUE, FALSE),
  ('school_representative_2', 'Délégué Général (2ème)', '2ème délégué général', TRUE, FALSE)
) AS f(name, label, description, is_mixable, is_exclusive)
WHERE r.name = 'student'
ON CONFLICT DO NOTHING;

-- Fonctions pour under_admin
INSERT INTO functions (name, label, description, role_id, is_mixable, is_exclusive)
SELECT f.name, f.label, f.description, r.id, f.is_mixable, f.is_exclusive
FROM roles r, (VALUES
  ('head_staff', 'Chef du Personnel', 'Responsable du personnel', TRUE, FALSE),
  ('driver', 'Chauffeur', 'Chauffeur de bus scolaire', TRUE, FALSE),
  ('guard', 'Gardien', 'Gardien de l''établissement', TRUE, FALSE),
  ('cleaner', 'Agent d''Entretien', 'Entretien des locaux', TRUE, FALSE)
) AS f(name, label, description, is_mixable, is_exclusive)
WHERE r.name = 'under_admin'
ON CONFLICT DO NOTHING;

-- Fonctions pour parent
INSERT INTO functions (name, label, description, role_id, is_mixable, is_exclusive)
SELECT f.name, f.label, f.description, r.id, f.is_mixable, f.is_exclusive
FROM roles r, (VALUES
  ('pta_member', 'Membre APE', 'Membre de l''Association Parents d''Élèves', TRUE, FALSE),
  ('pta_president', 'Président APE', 'Président de l''Association Parents d''Élèves', TRUE, FALSE)
) AS f(name, label, description, is_mixable, is_exclusive)
WHERE r.name = 'parent'
ON CONFLICT DO NOTHING;

-- Index
CREATE INDEX IF NOT EXISTS idx_functions_role_id ON functions(role_id);
CREATE INDEX IF NOT EXISTS idx_user_functions_user_id ON user_functions(user_id);
