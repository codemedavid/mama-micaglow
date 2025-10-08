-- Create orders and order_items tables for individual and group buy orders
CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_code" varchar(50) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(255),
	"customer_phone" varchar(50),
	"whatsapp_number" varchar(50),
	"shipping_address" text,
	"shipping_city" varchar(100),
	"shipping_province" varchar(100),
	"shipping_zip_code" varchar(20),
	"batch_id" integer,
	"subtotal" numeric(10, 2) DEFAULT 0,
	"shipping_cost" numeric(10, 2) DEFAULT 0,
	"total_amount" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payment_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_code_unique" UNIQUE("order_code")
);

CREATE TABLE IF NOT EXISTS "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"price_per_vial" numeric(10, 2),
	"price_per_box" numeric(10, 2),
	"total_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints later (after all tables are created)
-- We'll add these in a separate migration to avoid dependency issues

-- Create RPC function for individual orders
CREATE OR REPLACE FUNCTION create_individual_order(
    p_customer_name TEXT,
    p_customer_email TEXT,
    p_customer_phone TEXT,
    p_shipping_address TEXT,
    p_shipping_city TEXT,
    p_shipping_province TEXT,
    p_shipping_zip_code TEXT,
    p_subtotal DECIMAL(10,2),
    p_shipping_cost DECIMAL(10,2),
    p_total_amount DECIMAL(10,2),
    p_user_id INTEGER,
    p_items JSONB
) RETURNS INTEGER AS $$
DECLARE
    order_id INTEGER;
    order_code TEXT;
    item JSONB;
BEGIN
    -- Generate order code
    SELECT 'IND-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0')
    INTO order_code;
    
    -- Create the order
    INSERT INTO orders (
        order_code,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        shipping_city,
        shipping_province,
        shipping_zip_code,
        subtotal,
        shipping_cost,
        total_amount,
        status,
        payment_status,
        user_id,
        created_at,
        updated_at
    ) VALUES (
        order_code,
        p_customer_name,
        p_customer_email,
        p_customer_phone,
        p_shipping_address,
        p_shipping_city,
        p_shipping_province,
        p_shipping_zip_code,
        p_subtotal,
        p_shipping_cost,
        p_total_amount,
        'pending',
        'pending',
        p_user_id,
        NOW(),
        NOW()
    ) RETURNING id INTO order_id;
    
    -- Insert order items
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            price_per_box,
            total_price,
            created_at
        ) VALUES (
            order_id,
            (item->>'product_id')::INTEGER,
            (item->>'quantity')::INTEGER,
            (item->>'price_per_box')::DECIMAL(10,2),
            (item->>'total_price')::DECIMAL(10,2),
            NOW()
        );
    END LOOP;
    
    RETURN order_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate order codes (used by group buy checkout)
CREATE OR REPLACE FUNCTION generate_order_code() RETURNS TEXT AS $$
DECLARE
    order_code TEXT;
BEGIN
    -- Generate order code with format: GRP-YYYY-XXXXXX
    SELECT 'GRP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0')
    INTO order_code;
    
    RETURN order_code;
END;
$$ LANGUAGE plpgsql;
