-- Just create the generate_order_code function
-- Run this if the tables already exist but the function is missing

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
