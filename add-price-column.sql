-- Add the missing price_per_vial column to group_buy_products table
ALTER TABLE group_buy_products 
ADD COLUMN IF NOT EXISTS price_per_vial DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Update any existing records to have a default price (if needed)
-- You can adjust this value based on your needs
UPDATE group_buy_products 
SET price_per_vial = 0 
WHERE price_per_vial IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'group_buy_products' 
AND table_schema = 'public'
ORDER BY ordinal_position;
