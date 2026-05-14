-- Grades hiérarchiques
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL,
  level INTEGER NOT NULL,
  role_id UUID REFERENCES roles(id),
  can_validate_profile BOOLEAN DEFAULT FALSE,
  can_approve_iraci BOOLEAN DEFAULT FALSE,
  can_control_iraci BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Liaison user <-> grades
CREATE TABLE IF NOT EXISTS user_grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  grade_id UUID REFERENCES grades(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE (user_id, grade_id)
);

-- Grades par défaut
INSERT INTO grades (name, label, level, can_validate_profile, can_approve_iraci, can_control_iraci)
VALUES
  ('super_admin_grade', 'Technicien Système', 1, FALSE, FALSE, TRUE),
  ('director_grade', 'Directeur Général', 2, TRUE, TRUE, TRUE),
  ('deputy_grade', 'Directeur Adjoint', 3, TRUE, TRUE, FALSE),
  ('censor_grade', 'Censeur', 4, FALSE, TRUE, FALSE),
  ('accountant_grade', 'Comptable', 4, FALSE, TRUE, FALSE),
  ('teacher_grade', 'Enseignant', 5, FALSE, FALSE, FALSE),
  ('staff_grade', 'Personnel', 6, FALSE, FALSE, FALSE)
ON CONFLICT (name) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_user_grades_user_id ON user_grades(user_id);
