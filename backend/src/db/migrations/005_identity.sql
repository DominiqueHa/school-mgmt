-- Ajout identifiant unique + profil complet
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS place_of_birth VARCHAR(100),
  ADD COLUMN IF NOT EXISTS nationality VARCHAR(50),
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS id_card_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS photo_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT TRUE;

-- Mettre à jour l'admin existant
UPDATE users SET 
  username = 'DIR-2026-001',
  must_change_password = FALSE
WHERE email = 'admin@school.com';

-- Index sur username pour login rapide
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
