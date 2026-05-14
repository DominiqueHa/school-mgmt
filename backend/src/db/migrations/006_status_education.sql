-- Statut du compte sur users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  ADD COLUMN IF NOT EXISTS education_level VARCHAR(50);

-- Mettre le directeur comme actif
UPDATE users SET status = 'active' WHERE username = 'DIR-2026-001';

-- Statut d'inscription sur students
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS enrollment_status VARCHAR(20) DEFAULT 'enrolled'
    CHECK (enrollment_status IN ('enrolled', 'suspended', 'graduated', 'transferred', 'dropped'));

-- Statut professionnel sur teachers
ALTER TABLE teachers
  ADD COLUMN IF NOT EXISTS employment_status VARCHAR(20) DEFAULT 'active'
    CHECK (employment_status IN ('active', 'on_leave', 'suspended', 'retired', 'terminated')),
  ADD COLUMN IF NOT EXISTS contract_type VARCHAR(20) DEFAULT 'permanent'
    CHECK (contract_type IN ('permanent', 'temporary', 'volunteer'));

-- Statut professionnel sur staff
ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS employment_status VARCHAR(20) DEFAULT 'active'
    CHECK (employment_status IN ('active', 'on_leave', 'suspended', 'retired', 'terminated')),
  ADD COLUMN IF NOT EXISTS contract_type VARCHAR(20) DEFAULT 'permanent'
    CHECK (contract_type IN ('permanent', 'temporary', 'volunteer'));
