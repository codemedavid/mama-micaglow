-- Create RPC functions for updating batch progress

-- Function to increment group buy product vials
CREATE OR REPLACE FUNCTION increment_group_buy_product_vials(
    p_batch_id INTEGER,
    p_product_id INTEGER,
    p_delta INTEGER
)
RETURNS VOID AS $$
BEGIN
    -- Update the current_vials for the specific product in the batch
    UPDATE group_buy_products 
    SET current_vials = current_vials + p_delta
    WHERE batch_id = p_batch_id AND product_id = p_product_id;
    
    -- Update the total current_vials for the batch
    UPDATE group_buy_batches 
    SET current_vials = (
        SELECT COALESCE(SUM(current_vials), 0)
        FROM group_buy_products 
        WHERE batch_id = p_batch_id
    )
    WHERE id = p_batch_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment sub-group batch product vials
CREATE OR REPLACE FUNCTION increment_subgroup_batch_product_vials(
    p_batch_id INTEGER,
    p_product_id INTEGER,
    p_delta INTEGER
)
RETURNS VOID AS $$
BEGIN
    -- Update the current_vials for the specific product in the sub-group batch
    UPDATE sub_group_batch_products 
    SET current_vials = current_vials + p_delta
    WHERE batch_id = p_batch_id AND product_id = p_product_id;
    
    -- Update the total current_vials for the sub-group batch
    UPDATE sub_group_batches 
    SET current_vials = (
        SELECT COALESCE(SUM(current_vials), 0)
        FROM sub_group_batch_products 
        WHERE batch_id = p_batch_id
    )
    WHERE id = p_batch_id;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate all batch progress (useful for fixing existing data)
CREATE OR REPLACE FUNCTION recalculate_batch_progress(p_batch_id INTEGER)
RETURNS VOID AS $$
DECLARE
    total_vials INTEGER;
BEGIN
    -- Recalculate group buy batch progress
    SELECT COALESCE(SUM(oi.quantity), 0) INTO total_vials
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.batch_id = p_batch_id;
    
    -- Update group buy batch
    UPDATE group_buy_batches 
    SET current_vials = total_vials
    WHERE id = p_batch_id;
    
    -- Update individual product progress in group buy
    UPDATE group_buy_products 
    SET current_vials = (
        SELECT COALESCE(SUM(oi.quantity), 0)
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.batch_id = p_batch_id AND oi.product_id = group_buy_products.product_id
    )
    WHERE batch_id = p_batch_id;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate sub-group batch progress
CREATE OR REPLACE FUNCTION recalculate_subgroup_batch_progress(p_batch_id INTEGER)
RETURNS VOID AS $$
DECLARE
    total_vials INTEGER;
BEGIN
    -- Recalculate sub-group batch progress
    SELECT COALESCE(SUM(soi.quantity), 0) INTO total_vials
    FROM sub_group_orders sgo
    JOIN sub_group_order_items soi ON sgo.id = soi.order_id
    WHERE sgo.batch_id = p_batch_id;
    
    -- Update sub-group batch
    UPDATE sub_group_batches 
    SET current_vials = total_vials
    WHERE id = p_batch_id;
    
    -- Update individual product progress in sub-group batch
    UPDATE sub_group_batch_products 
    SET current_vials = (
        SELECT COALESCE(SUM(soi.quantity), 0)
        FROM sub_group_orders sgo
        JOIN sub_group_order_items soi ON sgo.id = soi.order_id
        WHERE sgo.batch_id = p_batch_id AND soi.product_id = sub_group_batch_products.product_id
    )
    WHERE batch_id = p_batch_id;
END;
$$ LANGUAGE plpgsql;
