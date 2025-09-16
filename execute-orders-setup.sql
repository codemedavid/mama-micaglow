-- Execute this SQL in your Supabase SQL Editor
-- This will create the orders table and generate_order_code function

-- Create orders table for group buy orders
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_code VARCHAR(20) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  whatsapp_number VARCHAR(20) NOT NULL,
  batch_id INTEGER REFERENCES group_buy_batches(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL,
  price_per_vial DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_batch_id ON orders(batch_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Create trigger for updating updated_at on orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order code
CREATE OR REPLACE FUNCTION generate_order_code() RETURNS TEXT AS $$
DECLARE
  new_order_code TEXT;
  counter INTEGER;
  date_prefix TEXT;
  max_counter INTEGER;
BEGIN
  -- Get today's date prefix
  date_prefix := 'GB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
  
  -- Find the highest counter for today's orders
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_code FROM LENGTH(date_prefix) + 1) AS INTEGER)), 0)
  INTO max_counter
  FROM orders 
  WHERE order_code LIKE date_prefix || '%';
  
  -- Set counter to max + 1, or 1 if no orders exist
  counter := COALESCE(max_counter, 0) + 1;
  
  -- Generate the new order code
  new_order_code := date_prefix || LPAD(CAST(counter AS TEXT), 3, '0');
  
  RETURN new_order_code;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security for orders tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for orders
DROP POLICY IF EXISTS "Allow all operations for authenticated users on orders" ON orders;
CREATE POLICY "Allow all operations for authenticated users on orders" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all operations for authenticated users on order_items" ON order_items;
CREATE POLICY "Allow all operations for authenticated users on order_items" ON order_items
  FOR ALL USING (auth.role() = 'authenticated');

-- RPC to increment product vials for a batch
CREATE OR REPLACE FUNCTION increment_group_buy_product_vials(
  p_batch_id INTEGER,
  p_product_id INTEGER,
  p_delta INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE group_buy_products
  SET current_vials = current_vials + p_delta
  WHERE batch_id = p_batch_id AND product_id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Ensure RLS and policy to allow updates to group_buy_products by authenticated users
ALTER TABLE group_buy_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow updates for authenticated on group_buy_products" ON group_buy_products;
CREATE POLICY "Allow updates for authenticated on group_buy_products" ON group_buy_products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Enable Supabase Realtime publication for live updates
DO $$
BEGIN
  -- These statements are idempotent; duplicates are ignored by Postgres
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.group_buy_batches';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.group_buy_products';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
