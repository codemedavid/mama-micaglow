-- Migration to add/update products: PT-141 10mg and Selank 5mg
-- This migration updates PT-141 pricing and adds Selank 5mg

-- Update PT-141 10mg pricing
UPDATE products 
SET 
  price_per_vial = 506.43,
  price_per_box = 5064.27,
  updated_at = NOW()
WHERE 
  name = 'PT-141' 
  AND description LIKE '%10 mg/vial%'
  AND category = 'PT-141';

-- Insert Selank 5mg if it doesn't exist
INSERT INTO products (name, description, category, price_per_vial, price_per_box, vials_per_box, is_active, specifications, created_by, created_at, updated_at)
SELECT 
  'Selank',
  '5 mg/vial, 10 vials/kit',
  'Selank',
  372.54,
  3725.00,
  10,
  true,
  '{"concentration": "5mg", "vials_per_kit": 10}',
  1,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM products 
  WHERE name = 'Selank' 
  AND description LIKE '%5 mg/vial%'
  AND category = 'Selank'
);

-- Insert Epitalon 10mg if it doesn't exist
INSERT INTO products (name, description, category, price_per_vial, price_per_box, vials_per_box, is_active, specifications, created_by, created_at, updated_at)
SELECT 
  'Epitalon',
  '10 mg/vial, 10 vials/kit',
  'Epitalon',
  1018.68,
  10186.75,
  10,
  true,
  '{"concentration": "10mg", "vials_per_kit": 10}',
  1,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM products 
  WHERE name = 'Epitalon' 
  AND description LIKE '%10 mg/vial%'
  AND category = 'Epitalon'
);

-- Update the migration journal
INSERT INTO drizzle_migrations (id, hash, created_at) 
VALUES (9, 'add_update_products', NOW())
ON CONFLICT (id) DO NOTHING;

