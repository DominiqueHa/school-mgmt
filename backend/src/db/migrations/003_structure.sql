-- Matières
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  coefficient NUMERIC(4,2) DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Affectation enseignant -> matière -> classe
CREATE TABLE IF NOT EXISTS teacher_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  school_year_id UUID REFERENCES school_years(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (teacher_id, subject_id, class_id, school_year_id)
);
