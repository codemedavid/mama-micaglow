-- Add sample products to the products table
-- This will help test the group buy functionality

-- Insert sample products (only if they don't exist)
INSERT INTO products (name, description, category, price_per_vial, price_per_box, vials_per_box, is_active, created_by)
VALUES 
  ('BPC-157', 'Body Protection Compound-157 for tissue repair and healing', 'Healing', 200, 2000, 10, true, 1),
  ('TB-500', 'Thymosin Beta-4 for muscle recovery and injury prevention', 'Recovery', 260, 2600, 10, true, 1),
  ('Ipamorelin', 'Growth hormone releasing peptide for muscle growth', 'Growth', 150, 1500, 10, true, 1),
  ('Sermorelin', 'Growth hormone releasing hormone for anti-aging', 'Anti-Aging', 180, 1800, 10, true, 1),
  ('CJC-1295', 'Growth hormone releasing hormone for muscle building', 'Growth', 220, 2200, 10, true, 1)
ON CONFLICT (name) DO NOTHING;

-- Verify the products were added
SELECT id, name, category, price_per_vial, price_per_box 
FROM products 
WHERE is_active = true 
ORDER BY name;
