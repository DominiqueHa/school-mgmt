-- Types d'actions IRACI
CREATE TABLE IF NOT EXISTS iraci_action_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL,
  description TEXT,
  steps JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Requêtes IRACI
CREATE TABLE IF NOT EXISTS iraci_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type_id UUID REFERENCES iraci_action_types(id),
  initiator_id UUID REFERENCES users(id),
  target_user_id UUID REFERENCES users(id),
  current_step VARCHAR(20) DEFAULT 'initiation'
    CHECK (current_step IN ('initiation', 'reception', 'approbation', 'controle', 'integration', 'completed', 'rejected')),
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'cancelled')),
  data JSONB DEFAULT '{}',
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Historique IRACI
CREATE TABLE IF NOT EXISTS iraci_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES iraci_requests(id) ON DELETE CASCADE,
  step VARCHAR(20) NOT NULL,
  actor_id UUID REFERENCES users(id),
  action VARCHAR(20) NOT NULL
    CHECK (action IN ('initiated', 'received', 'approved', 'rejected', 'controlled', 'integrated', 'cancelled')),
  comment TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Types d'actions par défaut
INSERT INTO iraci_action_types (code, label, description, steps) VALUES
  ('CREATE_USER', 'Création d''utilisateur', 'Processus de création d''un nouvel utilisateur', 
   '["initiation", "reception", "approbation", "controle", "integration"]'),
  ('VALIDATE_PROFILE', 'Validation de profil', 'Validation du profil complété par l''utilisateur',
   '["initiation", "approbation", "integration"]'),
  ('ASSIGN_ROLE', 'Attribution de rôle', 'Attribution d''un nouveau rôle à un utilisateur',
   '["initiation", "approbation", "controle", "integration"]'),
  ('FINANCIAL_OP', 'Opération financière', 'Validation d''une opération financière',
   '["initiation", "reception", "approbation", "controle", "integration"]')
ON CONFLICT (code) DO NOTHING;

-- Index
CREATE INDEX IF NOT EXISTS idx_iraci_requests_initiator ON iraci_requests(initiator_id);
CREATE INDEX IF NOT EXISTS idx_iraci_requests_target ON iraci_requests(target_user_id);
CREATE INDEX IF NOT EXISTS idx_iraci_requests_status ON iraci_requests(status);
CREATE INDEX IF NOT EXISTS idx_iraci_history_request ON iraci_history(request_id);
