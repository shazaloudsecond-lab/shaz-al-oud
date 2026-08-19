-- Run this SQL in your Supabase SQL Editor:

-- 1. HERO SECTION TABLE
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

-- Enable RLS for hero_section
ALTER TABLE hero_section ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read hero_section" 
ON hero_section FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow authenticated full hero_section" 
ON hero_section FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);


-- 2. CATEGORIES TABLE
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

-- Enable RLS for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read categories" 
ON categories FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow authenticated full categories" 
ON categories FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);


-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand_name TEXT,
  our_signature TEXT,
  slug TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  price NUMERIC(10, 2) NOT NULL,
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

-- Enable RLS for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read products" 
ON products FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow authenticated full products" 
ON products FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);


-- 4. PROMOTIONAL 2-IMAGE BANNERS TABLE
CREATE TABLE IF NOT EXISTS promo_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading TEXT,
  left_image_url TEXT NOT NULL,
  left_link TEXT DEFAULT '#',
  right_image_url TEXT NOT NULL,
  right_link TEXT DEFAULT '#',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for promo_banners
ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read promo_banners" 
ON promo_banners FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow authenticated full promo_banners" 
ON promo_banners FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);




-- 5. BADGES TABLE (4 fixed slots)
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position SMALLINT NOT NULL UNIQUE CHECK (position BETWEEN 1 AND 4),
  icon_url TEXT,
  heading TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read badges"
ON badges FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated full badges"
ON badges FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- 6. FEATURED BANNER TABLE
CREATE TABLE IF NOT EXISTS featured_banner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  heading TEXT,
  subheading TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE featured_banner ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read featured_banner"
ON featured_banner FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated full featured_banner"
ON featured_banner FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- 7. PRODUCT SLIDER
CREATE TABLE IF NOT EXISTS product_slider_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS product_slider_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_slider_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_slider_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read product_slider_config" ON product_slider_config FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated full product_slider_config" ON product_slider_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read product_slider_items" ON product_slider_items FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated full product_slider_items" ON product_slider_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE product_slider_items ADD COLUMN IF NOT EXISTS bg_color TEXT;


-- 8. NEWSLETTER CONFIG & SUBSCRIBERS
CREATE TABLE IF NOT EXISTS newsletter_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  heading TEXT,
  subheading TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE newsletter_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read newsletter_config" ON newsletter_config FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated full newsletter_config" ON newsletter_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public insert newsletter_subscribers" ON newsletter_subscribers FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow authenticated full newsletter_subscribers" ON newsletter_subscribers FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 9. VISION SECTION
CREATE TABLE IF NOT EXISTS vision_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  heading TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vision_section ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read vision_section" ON vision_section FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated full vision_section" ON vision_section FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 10. HERO CONFIG (Image Carousel vs Single Video)
CREATE TABLE IF NOT EXISTS hero_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO hero_config (media_type)
SELECT 'image'
WHERE NOT EXISTS (SELECT 1 FROM hero_config);

ALTER TABLE hero_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read hero_config" ON hero_config FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated full hero_config" ON hero_config FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 11. FULL BANNER (Single Full-Width Promotional Banner)
CREATE TABLE IF NOT EXISTS full_banner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  link_url TEXT,
  button_text TEXT,
  link_type TEXT,
  selected_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE full_banner ADD COLUMN IF NOT EXISTS button_text TEXT;
ALTER TABLE full_banner ADD COLUMN IF NOT EXISTS link_type TEXT;
ALTER TABLE full_banner ADD COLUMN IF NOT EXISTS selected_id TEXT;

ALTER TABLE full_banner ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read full_banner" ON full_banner FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated full full_banner" ON full_banner FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 12. USER CART ITEMS TABLE (Database persistence for cart)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select cart_items" ON cart_items FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert cart_items" ON cart_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update cart_items" ON cart_items FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete cart_items" ON cart_items FOR DELETE TO public USING (true);


-- 13. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select user_profiles" ON user_profiles FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert user_profiles" ON user_profiles FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update user_profiles" ON user_profiles FOR UPDATE TO public USING (true) WITH CHECK (true);


-- 14. PASSWORD RESETS TABLE (For Brevo OTP flow)
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert password_resets" ON password_resets FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select password_resets" ON password_resets FOR SELECT TO public USING (true);
CREATE POLICY "Allow public update password_resets" ON password_resets FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete password_resets" ON password_resets FOR DELETE TO public USING (true);


-- 15. ORDERS TABLE (For user order history and COD checkout)
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
  total_amount NUMERIC(10, 2) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_slot TEXT;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select orders" ON orders FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert orders" ON orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow authenticated full orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 16. ADMIN SETTINGS TABLE (Key-value store for admin configuration)
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Only authenticated users (admins) can read/write settings
CREATE POLICY "Allow authenticated full admin_settings" ON admin_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow service role (API routes) to read settings
CREATE POLICY "Allow service role admin_settings" ON admin_settings
  FOR SELECT TO public USING (true);


-- 17. COUNTRIES TABLE (Country-specific pricing & WhatsApp routing)
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

-- Ensure orders table supports country & currency fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS country_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS country_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency_symbol TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;


-- 18. COMPANY DETAILS TABLE
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

ALTER TABLE company_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read company_details" 
ON company_details FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow authenticated full company_details" 
ON company_details FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- 19. ABOUT SECTION TABLE
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

ALTER TABLE about_section ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read about_section" 
ON about_section FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow authenticated full about_section" 
ON about_section FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- 20. ABOUT SECTION TWO (Left Content, Right Image)
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

ALTER TABLE about_section_two ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read about_section_two" 
ON about_section_two FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow authenticated full about_section_two" 
ON about_section_two FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- 21. ABOUT SECTION THREE (Left Image, Right Accordion)
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

ALTER TABLE about_section_three ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read about_section_three" 
ON about_section_three FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow authenticated full about_section_three" 
ON about_section_three FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- 22. ABOUT SECTION FOUR (Blended Image & Content Banner)
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

ALTER TABLE about_section_four ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read about_section_four" 
ON about_section_four FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow authenticated full about_section_four" 
ON about_section_four FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

