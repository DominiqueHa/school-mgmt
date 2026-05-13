-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des rôles
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id UUID REFERENCES roles(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des années scolaires
CREATE TABLE IF NOT EXISTS school_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des classes
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  level VARCHAR(50) NOT NULL,
  school_year_id UUID REFERENCES school_years(id),
  max_students INT DEFAULT 30,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des élèves
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  class_id UUID REFERENCES classes(id),
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Données initiales : rôles
INSERT INTO roles (name) VALUES
  ('admin'),
  ('teacher'),
  ('student'),
  ('parent')
ON CONFLICT (name) DO NOTHING;

-- Rôle personnel administratif (gardien, chauffeur, nettoyeur, etc.)
INSERT INTO roles (name) VALUES ('under_admin') ON CONFLICT (name) DO NOTHING;
