-- SMRMP full schema for Supabase (public)
-- Paste into: Supabase → SQL Editor → New query → Run
-- Safe to re-run (IF NOT EXISTS / duplicate_object guards)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========== ENUMS ==========
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'admin', 'curator', 'conservation',
    'maintenance', 'researcher', 'visitor'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE artifact_category AS ENUM (
    'weapon', 'textile', 'document', 'ceramic',
    'jewelry', 'ceremonial', 'photograph',
    'coin', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE description_source AS ENUM (
    'manual', 'ai_approved', 'ai_draft'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE condition_status AS ENUM (
    'excellent', 'good', 'fair', 'poor', 'critical'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE exhibition_status AS ENUM (
    'draft', 'active', 'upcoming', 'closed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_type AS ENUM (
    'adult', 'student', 'child', 'foreign', 'group'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'pending', 'completed', 'failed', 'refunded'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM (
    'telebirr', 'chapa', 'cash', 'card'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM (
    'valid', 'used', 'expired', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ========== TABLES ==========

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'visitor',
  museum_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(500) NOT NULL,
  category artifact_category NOT NULL,
  historical_period VARCHAR(255),
  origin VARCHAR(255),
  materials TEXT,
  description TEXT,
  ai_description TEXT,
  description_source description_source DEFAULT 'manual',
  location VARCHAR(255),
  condition_status condition_status DEFAULT 'good',
  qr_code VARCHAR(100) NOT NULL UNIQUE,
  keywords TEXT[] DEFAULT '{}',
  is_on_loan BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  last_edited_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS artifact_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  file_url VARCHAR(1000) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exhibitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(500) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  status exhibition_status NOT NULL DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  cover_image_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exhibition_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id UUID NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
  artifact_id UUID NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (exhibition_id, artifact_id)
);

CREATE TABLE IF NOT EXISTS conservation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES users(id),
  condition_before condition_status,
  condition_after condition_status,
  observations TEXT,
  action_taken TEXT,
  next_inspection_date DATE,
  requires_restoration BOOLEAN DEFAULT FALSE,
  inspected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_ticket_code VARCHAR(100) NOT NULL UNIQUE,
  ticket_type ticket_type NOT NULL,
  visitor_name VARCHAR(255) NOT NULL,
  visitor_phone VARCHAR(50),
  visitor_email VARCHAR(255),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_method payment_method,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_reference VARCHAR(255),
  visit_date DATE,
  status ticket_status NOT NULL DEFAULT 'valid',
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_artifacts_category ON artifacts(category);
CREATE INDEX IF NOT EXISTS idx_artifacts_qr_code ON artifacts(qr_code);
CREATE INDEX IF NOT EXISTS idx_artifacts_condition ON artifacts(condition_status);
CREATE INDEX IF NOT EXISTS idx_artifact_images_artifact ON artifact_images(artifact_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_status ON exhibitions(status);
CREATE INDEX IF NOT EXISTS idx_exhibition_artifacts_exhibition ON exhibition_artifacts(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_exhibition_artifacts_artifact ON exhibition_artifacts(artifact_id);
CREATE INDEX IF NOT EXISTS idx_conservation_artifact ON conservation_logs(artifact_id);
CREATE INDEX IF NOT EXISTS idx_tickets_payment_status ON tickets(payment_status);
CREATE INDEX IF NOT EXISTS idx_tickets_visit_date ON tickets(visit_date);
CREATE INDEX IF NOT EXISTS idx_tickets_qr ON tickets(qr_ticket_code);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
