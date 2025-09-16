-- Supabase Database Setup for Mama_MicaGlow
-- Run this script in your Supabase SQL editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'customer' NOT NULL CHECK (role IN ('admin', 'host', 'customer')),
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  price_per_vial DECIMAL(10,2) NOT NULL,
  price_per_box DECIMAL(10,2) NOT NULL,
  vials_per_box INTEGER DEFAULT 10 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  image_url VARCHAR(500),
  specifications JSONB,
  created_by INTEGER REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create group_buy_batches table
CREATE TABLE IF NOT EXISTS group_buy_batches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  target_vials INTEGER NOT NULL,
  current_vials INTEGER DEFAULT 0 NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 20 NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by INTEGER REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create group_buy_products table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS group_buy_products (
  id SERIAL PRIMARY KEY,
  batch_id INTEGER REFERENCES group_buy_batches(id) NOT NULL,
  product_id INTEGER REFERENCES products(id) NOT NULL,
  target_vials INTEGER NOT NULL,
  current_vials INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create sub_groups table
CREATE TABLE IF NOT EXISTS sub_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  region VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  host_id INTEGER REFERENCES users(id) NOT NULL,
  join_fee DECIMAL(10,2) DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_group_buy_batches_status ON group_buy_batches(status);
CREATE INDEX IF NOT EXISTS idx_sub_groups_region ON sub_groups(region);
CREATE INDEX IF NOT EXISTS idx_sub_groups_host_id ON sub_groups(host_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_buy_batches_updated_at BEFORE UPDATE ON group_buy_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sub_groups_updated_at BEFORE UPDATE ON sub_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (replace with your actual Clerk user ID)
-- You'll need to get this from your Clerk dashboard
INSERT INTO users (clerk_id, email, first_name, last_name, role) 
VALUES ('user_admin_123', 'admin@mamamicalglow.com', 'Admin', 'User', 'admin')
ON CONFLICT (clerk_id) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, category, price_per_vial, price_per_box, vials_per_box, created_by) VALUES
('BPC-157', 'Body Protection Compound 157 - Healing and Recovery Peptide', 'Healing & Recovery', 250.00, 2500.00, 10, 1),
('TB-500', 'Thymosin Beta-4 - Muscle and Joint Support', 'Muscle & Joint Support', 300.00, 3000.00, 10, 1),
('Ipamorelin', 'Growth Hormone Releasing Peptide', 'Growth Hormone', 200.00, 2000.00, 10, 1),
('Sermorelin', 'Growth Hormone Releasing Hormone', 'Growth Hormone', 180.00, 1800.00, 10, 1),
('CJC-1295', 'Growth Hormone Releasing Hormone Analog', 'Growth Hormone', 220.00, 2200.00, 10, 1)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_buy_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_buy_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_groups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - you may want to customize these)
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub' 
            AND role = 'admin'
        )
    );

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
CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order code
CREATE OR REPLACE FUNCTION generate_order_code() RETURNS TEXT AS $$
DECLARE
  order_code TEXT;
  counter INTEGER;
BEGIN
  -- Generate format: GB-YYYYMMDD-XXX (e.g., GB-20241216-001)
  SELECT 'GB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(COALESCE(MAX(CAST(SUBSTRING(order_code FROM 12) AS INTEGER)), 0) + 1 AS TEXT), 3, '0')
  INTO order_code
  FROM orders 
  WHERE order_code LIKE 'GB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%';
  
  RETURN order_code;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security for orders tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for orders
CREATE POLICY "Allow all operations for authenticated users on orders" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on order_items" ON order_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
