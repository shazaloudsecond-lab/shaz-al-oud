-- Migration: Add optional Arabic Product Name
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_ar TEXT;
