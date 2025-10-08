-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO site_settings (key, value, description, category) VALUES
('regions_enabled', 'true', 'Enable or disable regional sub-groups feature', 'features'),
('group_buy_enabled', 'true', 'Enable or disable group buy feature', 'features'),
('individual_purchase_enabled', 'true', 'Enable or disable individual purchase feature', 'features');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);

-- Trigger to maintain updated_at
CREATE OR REPLACE FUNCTION update_site_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_site_settings
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_site_settings_timestamp();

