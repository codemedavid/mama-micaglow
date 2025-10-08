-- Sub-group batches tables
-- This migration creates separate tables for regional/host-managed batches

-- Create sub_group_batches table
CREATE TABLE IF NOT EXISTS sub_group_batches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, active, payment_collection, ordering, processing, shipped, delivered, completed, cancelled
  target_vials INTEGER NOT NULL,
  current_vials INTEGER NOT NULL DEFAULT 0,
  discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  host_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  region_id INTEGER REFERENCES sub_groups(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create sub_group_batch_products table
CREATE TABLE IF NOT EXISTS sub_group_batch_products (
  id SERIAL PRIMARY KEY,
  batch_id INTEGER NOT NULL REFERENCES sub_group_batches(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  target_vials INTEGER NOT NULL,
  current_vials INTEGER NOT NULL DEFAULT 0,
  price_per_vial DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_sub_group_batches_host_id ON sub_group_batches(host_id);
CREATE INDEX IF NOT EXISTS idx_sub_group_batches_region_id ON sub_group_batches(region_id);
CREATE INDEX IF NOT EXISTS idx_sub_group_batches_status ON sub_group_batches(status);
CREATE INDEX IF NOT EXISTS idx_sub_group_batch_products_batch_id ON sub_group_batch_products(batch_id);
CREATE INDEX IF NOT EXISTS idx_sub_group_batch_products_product_id ON sub_group_batch_products(product_id);

-- Trigger to maintain updated_at
CREATE OR REPLACE FUNCTION set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_sub_group_batches ON sub_group_batches;
CREATE TRIGGER set_timestamp_sub_group_batches
BEFORE UPDATE ON sub_group_batches
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp();


