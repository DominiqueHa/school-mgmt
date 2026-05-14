-- Séparer les données personnelles dans une table profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  gender VARCHAR(10),
  date_of_birth DATE,
  place_of_birth VARCHAR(100),
  nationality VARCHAR(50) DEFAULT 'Béninoise',
  address TEXT,
  phone VARCHAR(20),
  id_card_number VARCHAR(50),
  photo_url VARCHAR(255),
  education_level VARCHAR(50),
  profile_status VARCHAR(20) DEFAULT 'incomplete'
    CHECK (profile_status IN ('incomplete', 'pending_validation', 'validated', 'rejected')),
  submitted_at TIMESTAMP,
  validated_at TIMESTAMP,
  validated_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Migrer les données existantes de users vers profiles
INSERT INTO profiles (
  user_id, first_name, last_name, gender, date_of_birth,
  place_of_birth, nationality, address, phone,
  id_card_number, photo_url, education_level, profile_status
)
SELECT
  id, first_name, last_name, gender, date_of_birth,
  place_of_birth, nationality, address, phone,
  id_card_number, photo_url, education_level,
  CASE WHEN first_name IS NOT NULL THEN 'pending_validation' ELSE 'incomplete' END
FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Index
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(profile_status);
