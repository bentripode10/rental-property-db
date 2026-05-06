-- ═══════════════════════════════════════════════════════════════════════════
-- RENTAL PROPERTY DATABASE — SUPABASE SCHEMA
-- Run this entire file in Supabase → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Properties ──────────────────────────────────────────────────────────────
CREATE TABLE properties (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  address             TEXT NOT NULL,
  city                TEXT NOT NULL,
  state               TEXT NOT NULL DEFAULT 'TX',
  zip                 TEXT,
  county              TEXT,
  status              TEXT NOT NULL DEFAULT 'occupied' CHECK (status IN ('occupied','vacant','under_renovation')),
  purchase_price      NUMERIC(12,2),
  purchase_date       DATE,
  land_value          NUMERIC(12,2),
  bedrooms            INTEGER,
  bathrooms           NUMERIC(3,1),
  square_feet         INTEGER,
  year_built          INTEGER,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tenants ─────────────────────────────────────────────────────────────────
CREATE TABLE tenants (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id         UUID REFERENCES properties(id) ON DELETE SET NULL,
  name                TEXT NOT NULL,
  email               TEXT,
  phone               TEXT,
  move_in_date        DATE,
  move_out_date       DATE,
  emergency_contact   TEXT,
  emergency_phone     TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Leases ──────────────────────────────────────────────────────────────────
CREATE TABLE leases (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id         UUID REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id           UUID REFERENCES tenants(id) ON DELETE SET NULL,
  start_date          DATE NOT NULL,
  end_date            DATE NOT NULL,
  monthly_rent        NUMERIC(10,2) NOT NULL,
  security_deposit    NUMERIC(10,2),
  late_fee            NUMERIC(8,2),
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','month_to_month','terminated')),
  pet_policy          TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Transactions ─────────────────────────────────────────────────────────────
CREATE TABLE transactions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id         UUID REFERENCES properties(id) ON DELETE CASCADE,
  date                DATE NOT NULL,
  description         TEXT NOT NULL,
  amount              NUMERIC(10,2) NOT NULL,
  type                TEXT NOT NULL CHECK (type IN ('income','expense')),
  source              TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('bank','credit_card','venmo','cash','manual')),
  category            TEXT,  -- Schedule E category
  reconcile_status    TEXT DEFAULT 'unmatched' CHECK (reconcile_status IN ('matched','flagged','unmatched','approved')),
  depreciable_flag    BOOLEAN DEFAULT FALSE,
  document_id         UUID,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Capital Expenditures / Depreciation ─────────────────────────────────────
CREATE TABLE capital_expenditures (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id         UUID REFERENCES properties(id) ON DELETE CASCADE,
  description         TEXT NOT NULL,
  cost                NUMERIC(12,2) NOT NULL,
  useful_life_years   NUMERIC(4,1) NOT NULL,
  placed_in_service   DATE NOT NULL,
  capex_type          TEXT NOT NULL DEFAULT 'improvement' CHECK (capex_type IN ('structure','land','improvement','appliance')),
  irs_class           TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Property Tax ─────────────────────────────────────────────────────────────
CREATE TABLE property_tax (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id         UUID REFERENCES properties(id) ON DELETE CASCADE,
  tax_year            INTEGER NOT NULL,
  assessed_value      NUMERIC(12,2),
  land_value          NUMERIC(12,2),
  improvement_value   NUMERIC(12,2),
  tax_rate            NUMERIC(6,4),
  annual_amount       NUMERIC(10,2),
  installment         TEXT,
  due_date            DATE,
  paid_date           DATE,
  paid_amount         NUMERIC(10,2),
  status              TEXT DEFAULT 'upcoming' CHECK (status IN ('paid','due','upcoming','overdue','partial')),
  appeal_status       TEXT CHECK (appeal_status IN ('none','filed','pending','won','lost')),
  appeal_original_val NUMERIC(12,2),
  appeal_requested_val NUMERIC(12,2),
  appeal_result       TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Insurance Policies ───────────────────────────────────────────────────────
CREATE TABLE insurance_policies (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id         UUID REFERENCES properties(id) ON DELETE CASCADE,
  insurer             TEXT NOT NULL,
  policy_number       TEXT,
  policy_type         TEXT DEFAULT 'DP-3',
  agent_name          TEXT,
  agent_phone         TEXT,
  agent_email         TEXT,
  annual_premium      NUMERIC(10,2),
  deductible          NUMERIC(10,2),
  effective_date      DATE,
  renewal_date        DATE,
  dwelling_coverage   NUMERIC(12,2),
  liability_coverage  NUMERIC(12,2),
  loss_of_rents       NUMERIC(10,2),
  other_structures    NUMERIC(10,2),
  water_backup        BOOLEAN DEFAULT FALSE,
  wind_hail           BOOLEAN DEFAULT TRUE,
  flood               BOOLEAN DEFAULT FALSE,
  earthquake          BOOLEAN DEFAULT FALSE,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Insurance Claims ─────────────────────────────────────────────────────────
CREATE TABLE insurance_claims (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id         UUID REFERENCES properties(id) ON DELETE CASCADE,
  policy_id           UUID REFERENCES insurance_policies(id) ON DELETE SET NULL,
  claim_date          DATE NOT NULL,
  claim_type          TEXT NOT NULL,
  description         TEXT,
  amount_claimed      NUMERIC(10,2),
  amount_paid         NUMERIC(10,2),
  deductible_applied  NUMERIC(10,2),
  status              TEXT DEFAULT 'open' CHECK (status IN ('open','closed','approved','denied')),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Listings ─────────────────────────────────────────────────────────────────
CREATE TABLE listings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id         UUID REFERENCES properties(id) ON DELETE CASCADE,
  asking_rent         NUMERIC(10,2),
  listed_date         DATE,
  listing_copy        TEXT,
  status              TEXT DEFAULT 'draft' CHECK (status IN ('draft','live','paused','leased')),
  zillow_status       TEXT DEFAULT 'not_posted',
  zillow_url          TEXT,
  zillow_posted_date  DATE,
  homes_status        TEXT DEFAULT 'not_posted',
  homes_url           TEXT,
  homes_posted_date   DATE,
  facebook_status     TEXT DEFAULT 'not_posted',
  facebook_url        TEXT,
  facebook_posted_date DATE,
  apartments_status   TEXT DEFAULT 'not_posted',
  apartments_url      TEXT,
  apartments_posted_date DATE,
  realtor_status      TEXT DEFAULT 'not_posted',
  realtor_url         TEXT,
  realtor_posted_date DATE,
  days_on_market      INTEGER DEFAULT 0,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Inquiries ────────────────────────────────────────────────────────────────
CREATE TABLE inquiries (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id         UUID REFERENCES properties(id) ON DELETE CASCADE,
  listing_id          UUID REFERENCES listings(id) ON DELETE SET NULL,
  prospect_name       TEXT NOT NULL,
  phone               TEXT,
  email               TEXT,
  platform            TEXT,
  inquiry_date        DATE DEFAULT CURRENT_DATE,
  status              TEXT DEFAULT 'new' CHECK (status IN ('new','showing_scheduled','applied','approved','declined','no_show','leased')),
  move_in_requested   DATE,
  num_occupants       INTEGER,
  has_pets            BOOLEAN DEFAULT FALSE,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Documents ────────────────────────────────────────────────────────────────
CREATE TABLE documents (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type         TEXT NOT NULL, -- 'transaction','property','insurance','lease','tax'
  entity_id           UUID NOT NULL,
  file_name           TEXT NOT NULL,
  file_path           TEXT NOT NULL,
  file_type           TEXT,
  file_size_kb        INTEGER,
  uploaded_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY — Each user only sees their own data
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE properties           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants              ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases               ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE capital_expenditures ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_tax         ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies   ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims     ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries            ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents            ENABLE ROW LEVEL SECURITY;

-- Create policies for each table (pattern: user_id matches authenticated user)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'properties','tenants','leases','transactions',
    'capital_expenditures','property_tax','insurance_policies',
    'insurance_claims','listings','inquiries','documents'
  ] LOOP
    EXECUTE format('
      CREATE POLICY "Users manage own data" ON %I
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    ', tbl);
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKET for documents / receipts
-- Run this separately in Supabase Dashboard → Storage → New Bucket
-- ═══════════════════════════════════════════════════════════════════════════
-- Bucket name: documents
-- Public: false (private, authenticated access only)
-- Max file size: 50MB

-- ═══════════════════════════════════════════════════════════════════════════
-- HELPFUL VIEWS
-- ═══════════════════════════════════════════════════════════════════════════

-- Portfolio summary view
CREATE OR REPLACE VIEW portfolio_summary AS
SELECT
  p.id,
  p.address,
  p.city,
  p.status,
  p.purchase_price,
  l.monthly_rent,
  l.end_date AS lease_end,
  l.status AS lease_status,
  t.name AS tenant_name,
  COALESCE(SUM(CASE WHEN tx.type='income'  THEN tx.amount ELSE 0 END), 0) AS ytd_income,
  COALESCE(SUM(CASE WHEN tx.type='expense' THEN tx.amount ELSE 0 END), 0) AS ytd_expenses
FROM properties p
LEFT JOIN leases l ON l.property_id = p.id AND l.status IN ('active','month_to_month')
LEFT JOIN tenants t ON t.id = l.tenant_id
LEFT JOIN transactions tx ON tx.property_id = p.id
  AND EXTRACT(YEAR FROM tx.date) = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY p.id, p.address, p.city, p.status, p.purchase_price,
         l.monthly_rent, l.end_date, l.status, t.name;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'properties','tenants','leases','transactions',
    'capital_expenditures','property_tax','insurance_policies',
    'insurance_claims','listings','inquiries'
  ] LOOP
    EXECUTE format('
      CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    ', tbl);
  END LOOP;
END $$;
