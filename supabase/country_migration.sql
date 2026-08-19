-- Migration: Country Management and Country-Specific Pricing & WhatsApp Notifications

-- 1. Create countries table
CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  currency_name TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  currency_symbol TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for countries
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read countries" 
ON countries FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow authenticated full countries" 
ON countries FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 2. Ensure orders table supports country & currency fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS country_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS country_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency_symbol TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;
