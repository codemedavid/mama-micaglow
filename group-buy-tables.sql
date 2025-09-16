
-- Group buy batches
CREATE TABLE IF NOT EXISTS group_buy_batches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  target_vials INTEGER NOT NULL,
  current_vials INTEGER DEFAULT 0 NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 20.00 NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by INTEGER REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Group buy products (many-to-many relationship)
CREATE TABLE IF NOT EXISTS group_buy_products (
  id SERIAL PRIMARY KEY,
  batch_id INTEGER REFERENCES group_buy_batches(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  target_vials INTEGER NOT NULL,
  current_vials INTEGER DEFAULT 0 NOT NULL,
  price_per_vial DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(batch_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_buy_batches_status ON group_buy_batches(status);
CREATE INDEX IF NOT EXISTS idx_group_buy_batches_created_by ON group_buy_batches(created_by);
CREATE INDEX IF NOT EXISTS idx_group_buy_products_batch_id ON group_buy_products(batch_id);
CREATE INDEX IF NOT EXISTS idx_group_buy_products_product_id ON group_buy_products(product_id);

-- Enable Row Level Security
ALTER TABLE group_buy_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_buy_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations for authenticated users" ON group_buy_batches
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON group_buy_products
  FOR ALL USING (auth.role() = 'authenticated');
