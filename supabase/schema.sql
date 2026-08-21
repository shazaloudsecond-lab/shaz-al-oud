-- ==============================================================================
-- SHAZ AL OUD - COMPLETE MASTER DATABASE SCHEMA & PERMISSIONS
-- Target Database: Supabase PostgreSQL (Fresh / New Database Setup)
-- Description: Complete schema with all 24 tables, indexes, explicit GRANT
--              permissions, RLS policies, auth triggers, and seed data.
-- ==============================================================================

-- Enable UUID extension (standard in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant basic schema access
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;


-- ==============================================================================
-- 1. HERO SECTION & HERO CONFIG
-- ==============================================================================

-- Hero Slides Table
CREATE TABLE IF NOT EXISTS hero_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  main_heading TEXT NOT NULL,
  sub_heading TEXT,
  background_image TEXT NOT NULL,
  button_text TEXT,
  button_link TEXT DEFAULT '#',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON hero_section TO postgres, anon, authenticated, service_role;
ALTER TABLE hero_section ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read hero_section" ON hero_section;
DROP POLICY IF EXISTS "Allow authenticated full hero_section" ON hero_section;
DROP POLICY IF EXISTS "Allow public all hero_section" ON hero_section;

CREATE POLICY "Allow public all hero_section" ON hero_section FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full hero_section" ON hero_section FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Hero Config Table (Image Carousel vs Video Hero)
CREATE TABLE IF NOT EXISTS hero_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON hero_config TO postgres, anon, authenticated, service_role;
ALTER TABLE hero_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read hero_config" ON hero_config;
DROP POLICY IF EXISTS "Allow authenticated full hero_config" ON hero_config;
DROP POLICY IF EXISTS "Allow public all hero_config" ON hero_config;

CREATE POLICY "Allow public all hero_config" ON hero_config FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full hero_config" ON hero_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Default hero_config seed
INSERT INTO hero_config (media_type)
SELECT 'image'
WHERE NOT EXISTS (SELECT 1 FROM hero_config);


-- ==============================================================================
-- 2. CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

GRANT ALL ON categories TO postgres, anon, authenticated, service_role;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated full categories" ON categories;
DROP POLICY IF EXISTS "Allow public all categories" ON categories;

CREATE POLICY "Allow public all categories" ON categories FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ==============================================================================
-- 3. PRODUCTS TABLE (Multi-country variant pricing & multi-image support)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand_name TEXT,
  our_signature TEXT,
  slug TEXT UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  original_price NUMERIC(10, 2),
  volume TEXT,
  variants JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  image_url TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_in_stock BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);

GRANT ALL ON products TO postgres, anon, authenticated, service_role;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read products" ON products;
DROP POLICY IF EXISTS "Allow authenticated full products" ON products;
DROP POLICY IF EXISTS "Allow public all products" ON products;

CREATE POLICY "Allow public all products" ON products FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ==============================================================================
-- 4. PROMOTIONAL 2-IMAGE BANNERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS promo_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading TEXT,
  subheading TEXT,
  background_image_url TEXT,
  left_image_url TEXT NOT NULL,
  left_heading TEXT,
  left_subheading TEXT,
  left_link TEXT DEFAULT '#',
  right_image_url TEXT NOT NULL,
  right_heading TEXT,
  right_subheading TEXT,
  right_link TEXT DEFAULT '#',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON promo_banners TO postgres, anon, authenticated, service_role;
ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read promo_banners" ON promo_banners;
DROP POLICY IF EXISTS "Allow authenticated full promo_banners" ON promo_banners;
DROP POLICY IF EXISTS "Allow public all promo_banners" ON promo_banners;

CREATE POLICY "Allow public all promo_banners" ON promo_banners FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full promo_banners" ON promo_banners FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ==============================================================================
-- 5. BADGES (4 Fixed Slot Value Propositions)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position SMALLINT NOT NULL UNIQUE CHECK (position BETWEEN 1 AND 4),
  icon_url TEXT,
  heading TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON badges TO postgres, anon, authenticated, service_role;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read badges" ON badges;
DROP POLICY IF EXISTS "Allow authenticated full badges" ON badges;
DROP POLICY IF EXISTS "Allow public all badges" ON badges;

CREATE POLICY "Allow public all badges" ON badges FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full badges" ON badges FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed initial 4 badge slots
INSERT INTO badges (position, heading, description)
VALUES 
  (1, 'Authentic Fragrance', '100% genuine luxury Arabian oud and oils'),
  (2, 'Fast GCC Delivery', 'Prompt and secure door-to-door delivery'),
  (3, 'Artisanal Craftsmanship', 'Blended by master perfumers with heritage techniques'),
  (4, 'Dedicated Support', 'Direct WhatsApp ordering and customer care')
ON CONFLICT (position) DO NOTHING;


-- ==============================================================================
-- 6. FEATURED BANNER TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS featured_banner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  background_image_url TEXT,
  heading TEXT,
  subheading TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON featured_banner TO postgres, anon, authenticated, service_role;
ALTER TABLE featured_banner ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read featured_banner" ON featured_banner;
DROP POLICY IF EXISTS "Allow authenticated full featured_banner" ON featured_banner;
DROP POLICY IF EXISTS "Allow public all featured_banner" ON featured_banner;

CREATE POLICY "Allow public all featured_banner" ON featured_banner FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full featured_banner" ON featured_banner FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ==============================================================================
-- 7. PRODUCT SLIDER CONFIG & ITEMS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS product_slider_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading TEXT DEFAULT 'Signature Highlights',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_slider_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  bg_color TEXT DEFAULT '#ececec',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_slider_items_prod ON product_slider_items(product_id);
CREATE INDEX IF NOT EXISTS idx_slider_items_order ON product_slider_items(display_order);

GRANT ALL ON product_slider_config TO postgres, anon, authenticated, service_role;
GRANT ALL ON product_slider_items TO postgres, anon, authenticated, service_role;

ALTER TABLE product_slider_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_slider_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all product_slider_config" ON product_slider_config;
DROP POLICY IF EXISTS "Allow authenticated full product_slider_config" ON product_slider_config;
DROP POLICY IF EXISTS "Allow public all product_slider_items" ON product_slider_items;
DROP POLICY IF EXISTS "Allow authenticated full product_slider_items" ON product_slider_items;

CREATE POLICY "Allow public all product_slider_config" ON product_slider_config FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full product_slider_config" ON product_slider_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public all product_slider_items" ON product_slider_items FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full product_slider_items" ON product_slider_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed product_slider_config
INSERT INTO product_slider_config (heading, is_active)
SELECT 'Curated Masterpieces', true
WHERE NOT EXISTS (SELECT 1 FROM product_slider_config);


-- ==============================================================================
-- 8. NEWSLETTER CONFIG & SUBSCRIBERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS newsletter_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  heading TEXT DEFAULT 'Join The World of Shaz Al Oud',
  subheading TEXT DEFAULT 'Subscribe for exclusive releases, private invitations, and rare attar drops.',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON newsletter_subscribers(email);

GRANT ALL ON newsletter_config TO postgres, anon, authenticated, service_role;
GRANT ALL ON newsletter_subscribers TO postgres, anon, authenticated, service_role;

ALTER TABLE newsletter_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all newsletter_config" ON newsletter_config;
DROP POLICY IF EXISTS "Allow authenticated full newsletter_config" ON newsletter_config;
DROP POLICY IF EXISTS "Allow public all newsletter_subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated full newsletter_subscribers" ON newsletter_subscribers;

CREATE POLICY "Allow public all newsletter_config" ON newsletter_config FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full newsletter_config" ON newsletter_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public all newsletter_subscribers" ON newsletter_subscribers FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full newsletter_subscribers" ON newsletter_subscribers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed newsletter_config
INSERT INTO newsletter_config (heading, subheading, is_active)
SELECT 'Join The World of Shaz Al Oud', 'Subscribe for exclusive releases, private invitations, and rare attar drops.', true
WHERE NOT EXISTS (SELECT 1 FROM newsletter_config);


-- ==============================================================================
-- 9. VISION SECTION
-- ==============================================================================
CREATE TABLE IF NOT EXISTS vision_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  heading TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON vision_section TO postgres, anon, authenticated, service_role;
ALTER TABLE vision_section ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all vision_section" ON vision_section;
DROP POLICY IF EXISTS "Allow authenticated full vision_section" ON vision_section;

CREATE POLICY "Allow public all vision_section" ON vision_section FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full vision_section" ON vision_section FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ==============================================================================
-- 10. FULL-WIDTH PROMOTIONAL BANNER
-- ==============================================================================
CREATE TABLE IF NOT EXISTS full_banner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  link_url TEXT,
  button_text TEXT DEFAULT 'Discover Now',
  link_type TEXT DEFAULT 'none',
  selected_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON full_banner TO postgres, anon, authenticated, service_role;
ALTER TABLE full_banner ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all full_banner" ON full_banner;
DROP POLICY IF EXISTS "Allow authenticated full full_banner" ON full_banner;

CREATE POLICY "Allow public all full_banner" ON full_banner FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full full_banner" ON full_banner FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ==============================================================================
-- 11. CART ITEMS (Database persistence for anonymous sessions & logged-in users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_product ON cart_items(product_id);

GRANT ALL ON cart_items TO postgres, anon, authenticated, service_role;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select cart_items" ON cart_items;
DROP POLICY IF EXISTS "Allow public insert cart_items" ON cart_items;
DROP POLICY IF EXISTS "Allow public update cart_items" ON cart_items;
DROP POLICY IF EXISTS "Allow public delete cart_items" ON cart_items;
DROP POLICY IF EXISTS "Allow public all cart_items" ON cart_items;

CREATE POLICY "Allow public all cart_items" ON cart_items FOR ALL TO public USING (true) WITH CHECK (true);


-- ==============================================================================
-- 12. USER PROFILES TABLE (Linked with auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

GRANT ALL ON user_profiles TO postgres, anon, authenticated, service_role;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow public insert user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow public update user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated full user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow public all user_profiles" ON user_profiles;

CREATE POLICY "Allow public all user_profiles" ON user_profiles FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full user_profiles" ON user_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Automated trigger function to create profile on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE WHEN NEW.email LIKE 'admin@%' THEN 'admin' ELSE 'user' END
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================
-- 13. PASSWORD RESETS (For 6-digit OTP Brevo flow)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_otp ON password_resets(otp);

GRANT ALL ON password_resets TO postgres, anon, authenticated, service_role;
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all password_resets" ON password_resets;

CREATE POLICY "Allow public all password_resets" ON password_resets FOR ALL TO public USING (true) WITH CHECK (true);


-- ==============================================================================
-- 14. ORDERS TABLE (Full COD Checkout & Country Notification Details)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  delivery_state TEXT,
  delivery_postal_code TEXT,
  delivery_slot TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  country_code TEXT,
  country_name TEXT,
  currency_code TEXT,
  currency_symbol TEXT,
  whatsapp_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_country_code ON orders(country_code);

GRANT ALL ON orders TO postgres, anon, authenticated, service_role;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select orders" ON orders;
DROP POLICY IF EXISTS "Allow public insert orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated full orders" ON orders;
DROP POLICY IF EXISTS "Allow public all orders" ON orders;

CREATE POLICY "Allow public all orders" ON orders FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ==============================================================================
-- 15. ADMIN SETTINGS (Key-Value Store)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);

GRANT ALL ON admin_settings TO postgres, anon, authenticated, service_role;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all admin_settings" ON admin_settings;
DROP POLICY IF EXISTS "Allow authenticated full admin_settings" ON admin_settings;

CREATE POLICY "Allow public all admin_settings" ON admin_settings FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full admin_settings" ON admin_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ==============================================================================
-- 16. COUNTRIES TABLE (Country-specific pricing & WhatsApp routing)
-- ==============================================================================
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

CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);
CREATE INDEX IF NOT EXISTS idx_countries_display_order ON countries(display_order);

GRANT ALL ON countries TO postgres, anon, authenticated, service_role;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all countries" ON countries;
DROP POLICY IF EXISTS "Allow authenticated full countries" ON countries;

CREATE POLICY "Allow public all countries" ON countries FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full countries" ON countries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed Default GCC Countries (Qatar QA is the primary default)
INSERT INTO countries (name, code, currency_name, currency_code, currency_symbol, whatsapp_number, is_active, is_default, display_order)
VALUES
  ('Qatar', 'QA', 'Qatari Riyal', 'QAR', 'ر.ق', '97430000000', true, true, 1),
  ('United Arab Emirates', 'AE', 'UAE Dirham', 'AED', 'د.إ', '971500000000', true, false, 2),
  ('Saudi Arabia', 'SA', 'Saudi Riyal', 'SAR', 'ر.س', '966500000000', true, false, 3),
  ('Bahrain', 'BH', 'Bahraini Dinar', 'BHD', 'د.ب', '97330000000', true, false, 4),
  ('Kuwait', 'KW', 'Kuwaiti Dinar', 'KWD', 'د.ك', '96590000000', true, false, 5),
  ('Oman', 'OM', 'Omani Rial', 'OMR', 'ر.ع.', '96890000000', true, false, 6)
ON CONFLICT (code) DO UPDATE 
SET 
  name = EXCLUDED.name,
  currency_name = EXCLUDED.currency_name,
  currency_code = EXCLUDED.currency_code,
  currency_symbol = EXCLUDED.currency_symbol,
  display_order = EXCLUDED.display_order;


-- ==============================================================================
-- 17. COMPANY DETAILS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS company_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  tagline TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON company_details TO postgres, anon, authenticated, service_role;
ALTER TABLE company_details ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all company_details" ON company_details;
DROP POLICY IF EXISTS "Allow authenticated full company_details" ON company_details;

CREATE POLICY "Allow public all company_details" ON company_details FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full company_details" ON company_details FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed initial company_details
INSERT INTO company_details (company_name, address, phone, email, tagline)
SELECT 'Shaz Al Oud', 'Doha, Qatar', '+974 3000 0000', 'contact@shazaloud.com', 'Luxury Arabian Perfumery & Authentic Pure Ouds'
WHERE NOT EXISTS (SELECT 1 FROM company_details);


-- ==============================================================================
-- 18. ABOUT SECTION 1 (Hero / Intro: Left Image, Right Story)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS about_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  heading TEXT,
  subheading TEXT,
  description TEXT,
  story TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON about_section TO postgres, anon, authenticated, service_role;
ALTER TABLE about_section ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all about_section" ON about_section;
DROP POLICY IF EXISTS "Allow authenticated full about_section" ON about_section;

CREATE POLICY "Allow public all about_section" ON about_section FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full about_section" ON about_section FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed about_section
INSERT INTO about_section (heading, subheading, description, story, is_active)
SELECT 
  'The Art of Pure Luxury & Craftsmanship',
  'A Legacy of Authentic Arabian Perfumery',
  'Rooted in centuries of Arabian perfumery traditions, Shaz Al Oud curates the purest agarwood, amber, and exotic florals.',
  'Each essence is aged and blended with meticulous devotion to create an unmistakable sillage of royalty.',
  true
WHERE NOT EXISTS (SELECT 1 FROM about_section);


-- ==============================================================================
-- 19. ABOUT SECTION 2 (Story: Left Content, Right Image)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS about_section_two (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  heading TEXT,
  subheading TEXT,
  description TEXT,
  story TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON about_section_two TO postgres, anon, authenticated, service_role;
ALTER TABLE about_section_two ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all about_section_two" ON about_section_two;
DROP POLICY IF EXISTS "Allow authenticated full about_section_two" ON about_section_two;

CREATE POLICY "Allow public all about_section_two" ON about_section_two FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full about_section_two" ON about_section_two FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed about_section_two
INSERT INTO about_section_two (heading, subheading, description, story, is_active)
SELECT 
  'Uncompromising Quality & Sourcing',
  'From Sacred Groves to Your Signature Scent',
  'We ethically source wild harvest dehn al oud from the finest forests across Cambodia, India, and Malaysia.',
  'Every drop undergoes rigorous testing to guarantee authentic depth without synthetic diluents.',
  true
WHERE NOT EXISTS (SELECT 1 FROM about_section_two);


-- ==============================================================================
-- 20. ABOUT SECTION 3 (Left Image, Right Accordion / FAQ)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS about_section_three (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  heading TEXT,
  subheading TEXT,
  bg_color TEXT DEFAULT '#D8CBB6',
  items JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON about_section_three TO postgres, anon, authenticated, service_role;
ALTER TABLE about_section_three ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all about_section_three" ON about_section_three;
DROP POLICY IF EXISTS "Allow authenticated full about_section_three" ON about_section_three;

CREATE POLICY "Allow public all about_section_three" ON about_section_three FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full about_section_three" ON about_section_three FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed about_section_three
INSERT INTO about_section_three (heading, subheading, bg_color, items, is_active)
SELECT 
  'Craftsmanship & Heritage Questions',
  'Discover the Secrets Behind Our Fragrances',
  '#D8CBB6',
  '[
    {"id": "acc-1", "title": "How are our ouds sourced?", "content": "We work directly with certified distillers in Assam, Trat, and Kalimantan to obtain pure, unadulterated oils."},
    {"id": "acc-2", "title": "What makes our blends long-lasting?", "content": "Our extrait de parfum concentrations feature exceptionally high pure oil percentages for remarkable longevity and projection."},
    {"id": "acc-3", "title": "Do you deliver across the entire GCC?", "content": "Yes, we provide expedited delivery with tracking across Qatar, UAE, Saudi Arabia, Bahrain, Kuwait, and Oman."}
  ]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM about_section_three);


-- ==============================================================================
-- 21. ABOUT SECTION 4 (Full-Width Blended Brand Statement)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS about_section_four (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  heading TEXT,
  subheading TEXT,
  description TEXT,
  story TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON about_section_four TO postgres, anon, authenticated, service_role;
ALTER TABLE about_section_four ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all about_section_four" ON about_section_four;
DROP POLICY IF EXISTS "Allow authenticated full about_section_four" ON about_section_four;

CREATE POLICY "Allow public all about_section_four" ON about_section_four FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full about_section_four" ON about_section_four FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed about_section_four
INSERT INTO about_section_four (heading, subheading, description, story, is_active)
SELECT 
  'An Everlasting Statement of Royalty',
  'The Scent of Elegance & Prestige',
  'Immerse yourself in a sensorial journey that transcends time and trends.',
  'Shaz Al Oud represents timeless Arabian luxury, curated for those who appreciate rare perfumes.',
  true
WHERE NOT EXISTS (SELECT 1 FROM about_section_four);


-- ==============================================================================
-- Schema-wide final grant for all roles
-- ==============================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
