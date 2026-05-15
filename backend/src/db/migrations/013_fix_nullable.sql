-- Rendre first_name et last_name nullable dans users
-- Ces données sont maintenant dans la table profiles
ALTER TABLE users
  ALTER COLUMN first_name DROP NOT NULL,
  ALTER COLUMN last_name DROP NOT NULL;
