-- Populate products table with initial product data
-- This migration adds all the products from the provided CSV data

-- First, we need to ensure we have a default admin user to reference for created_by
-- We'll use user ID 1 as the default admin user
INSERT INTO users (id, clerk_id, email, first_name, last_name, role, is_active, created_at, updated_at)
VALUES (1, 'admin_default', 'admin@example.com', 'Admin', 'User', 'admin', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert all products
INSERT INTO products (name, description, category, price_per_vial, price_per_box, vials_per_box, is_active, specifications, created_by, created_at, updated_at) VALUES
-- Bacteriostatic Water
('Bacteriostatic Water (Benzyl Alcohol 0.9%)', '3 ml/vial, 10 vials/kits', 'Bacteriostatic Water', 172.50, 1725.00, 10, true, '{"concentration": "0.9%", "volume_per_vial": "3ml", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Bacteriostatic Water (Benzyl Alcohol 0.9%)', '10 ml/vial, 10 vials/kits', 'Bacteriostatic Water', 201.25, 2012.50, 10, true, '{"concentration": "0.9%", "volume_per_vial": "10ml", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Semaglutide
('Semaglutide', '2 mg/vial, 10 vials/kit', 'Semaglutide', 465.75, 4657.50, 10, true, '{"concentration": "2mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Semaglutide', '5 mg/vial, 10 vials/kit', 'Semaglutide', 477.25, 4772.50, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Semaglutide', '10 mg/vial, 10 vials/kit', 'Semaglutide', 523.25, 5232.50, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Semaglutide', '15 mg/vial, 10 vials/kit', 'Semaglutide', 603.75, 6037.50, 10, true, '{"concentration": "15mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Semaglutide', '20 mg/vial, 10 vials/kit', 'Semaglutide', 707.25, 7072.50, 10, true, '{"concentration": "20mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Tirzepatide
('Tirzepatide', '5 mg/vial, 10 vials/kits', 'Tirzepatide', 488.75, 4887.50, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Tirzepatide', '10 mg/vial, 10 vials/kits', 'Tirzepatide', 575.00, 5750.00, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Tirzepatide', '15 mg/vial, 10 vials/kits', 'Tirzepatide', 730.25, 7302.50, 10, true, '{"concentration": "15mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Tirzepatide', '20 mg/vial, 10 vials/kits', 'Tirzepatide', 805.00, 8050.00, 10, true, '{"concentration": "20mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Tirzepatide', '30 mg/vial, 10 vials/kits', 'Tirzepatide', 937.25, 9372.50, 10, true, '{"concentration": "30mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Tirzepatide', '40 mg/vial, 10 vials/kits', 'Tirzepatide', 1035.00, 10350.00, 10, true, '{"concentration": "40mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Retatrutide
('Retatrutide', '5 mg/vial, 10 vials/kits', 'Retatrutide', 575.00, 5750.00, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Retatrutide', '10 mg/vial, 10 vials/kits', 'Retatrutide', 862.50, 8625.00, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Retatrutide', '15 mg/vial, 10 vials/kits', 'Retatrutide', 1035.00, 10350.00, 10, true, '{"concentration": "15mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Retatrutide', '20 mg/vial, 10 vials/kits', 'Retatrutide', 1150.00, 11500.00, 10, true, '{"concentration": "20mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- MOTS-c
('MOTS-c', '10 mg/vial, 10 vials/kits', 'MOTS-c', 1380.00, 13800.00, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('MOTS-c', '10 mg/vial, 10 vials/kits', 'MOTS-c', 546.25, 5462.50, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('MOTS-c', '40 mg/vial, 10 vials/kits', 'MOTS-c', 1207.50, 12075.00, 10, true, '{"concentration": "40mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Ipamorelin
('Ipamorelin', '5 mg/vial, 10 vials/kits', 'Ipamorelin', 345.00, 3450.00, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- BCP-157
('BCP-157', '5 mg/vial, 10 vials/kits', 'BCP-157', 345.00, 3450.00, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('BCP-157', '10 mg/vial, 10 vials/kits', 'BCP-157', 500.25, 5002.50, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- TB-500
('TB-500', '5 mg/vial, 10 vials/kits', 'TB-500', 534.75, 5347.50, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('TB-500', '10 mg/vial, 10 vials/kits', 'TB-500', 862.50, 8625.00, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- BPC + TB Combinations
('BPC 10mg + TB 5mg', '10 mg/vial, 10 vials/kits', 'Peptide Combinations', 713.00, 7130.00, 10, true, '{"bpc_concentration": "10mg", "tb_concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('BPC 10mg + TB 10mg', '20 mg/vial, 10 vials/kits', 'Peptide Combinations', 1150.00, 11500.00, 10, true, '{"bpc_concentration": "10mg", "tb_concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- AOD-9604
('AOD-9604', '5 mg/vial, 10 vials/kits', 'AOD-9604', 632.50, 6325.00, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- HCG
('HCG', '5000 iu, 10 vials/kits', 'HCG', 632.50, 6325.00, 10, true, '{"concentration": "5000iu", "vials_per_kit": 10}', 1, NOW(), NOW()),
('HCG', '10000 iu, 10 vials/kits', 'HCG', 862.50, 8625.00, 10, true, '{"concentration": "10000iu", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- PT-141
('PT-141', '10 mg/vial, 10 vials/kits', 'PT-141', 500.25, 5002.50, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- DSIP
('DSIP', '5 mg/vial, 10 vials/kits', 'DSIP', 345.00, 3450.00, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('DSIP', '15 mg/vial, 10 vials/kits', 'DSIP', 690.00, 6900.00, 10, true, '{"concentration": "15mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Selank
('Selank', '10 mg/vial, 10 vials/kits', 'Selank', 460.00, 4600.00, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Oxytocin
('Oxytocin', '2 mg/vial, 10 vials/kits', 'Oxytocin', 345.00, 3450.00, 10, true, '{"concentration": "2mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Epitalon
('Epitalon', '10 mg/vial, 10 vials/kits', 'Epitalon', 414.00, 4140.00, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Adipotide
('Adipotide', '2 mg/vial, 10 vials/kits', 'Adipotide', 603.75, 6037.50, 10, true, '{"concentration": "2mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Adipotide', '5 mg/vial, 10 vials/kits', 'Adipotide', 1190.25, 11902.50, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Semax
('Semax', '10 mg/vial, 10 vials/kits', 'Semax', 488.75, 4887.50, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- SS-31
('SS-31', '10 mg/vial, 10 vials/kits', 'SS-31', 661.25, 6612.50, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- GHRP-6 Acetate
('GHRP-6 Acetate', '5 mg/vial, 10 vials/kits', 'GHRP-6', 460.00, 4600.00, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('GHRP-6 Acetate', '10 mg/vial, 10 vials/kits', 'GHRP-6', 431.25, 4312.50, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- CJC-1295 NO dac
('CJC-1295 NO dac', '5 mg/vial, 10 vials/kits', 'CJC-1295', 563.50, 5635.00, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('CJC-1295 NO dac', '10 mg/vial, 10 vials/kits', 'CJC-1295', 690.00, 6900.00, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- CJC-1295 with dac
('CJC-1295 with dac', '5 mg/vial, 10 vials/kits', 'CJC-1295', 575.00, 5750.00, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('CJC-1295 with dac', '10 mg/vial, 10 vials/kits', 'CJC-1295', 862.50, 8625.00, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Sermorelin Acetate
('Sermorelin Acetate', '5 mg/vial, 10 vials/kits', 'Sermorelin', 534.75, 5347.50, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- IGF-1
('IGF-1LR3', '0.1 mg/vial, 10 vials/kits', 'IGF-1', 368.00, 3680.00, 10, true, '{"concentration": "0.1mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('IGF-1', '1 mg/vial, 10 vials/kits', 'IGF-1', 1219.00, 12190.00, 10, true, '{"concentration": "1mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Tesamorelin
('Tesamorelin', '5 mg/vial, 10 vials/kits', 'Tesamorelin', 718.75, 7187.50, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Tesamorelin', '10 mg/vial, 10 vials/kits', 'Tesamorelin', 1236.25, 12362.50, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Hexarelin Acetate
('Hexarelin Acetate', '50 mg/vial, 10 vials/kits', 'Hexarelin', 442.75, 4427.50, 10, true, '{"concentration": "50mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- GHK-Cu
('GHK-Cu', '100 mg/vial, 10 vials/kits', 'GHK-Cu', 385.25, 3852.50, 10, true, '{"concentration": "100mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Kisspeptin-10
('Kisspeptin-10', '10 mg/vial, 10 vials/kits', 'Kisspeptin', 776.25, 7762.50, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Thymalin
('Thymalin', '10 mg/vial, 10 vials/kits', 'Thymalin', 460.00, 4600.00, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Thymosin Alpha-1
('Thymosin Alpha-1', '10 mg/vial, 10 vials/kits', 'Thymosin Alpha-1', 661.25, 6612.50, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Melanotan
('Melanotan', '5 mg/vial, 10 vials/kits', 'Melanotan', 431.25, 4312.50, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Dermorphin
('Dermorphin', '5 mg/vial, 10 vials/kits', 'Dermorphin', 460.00, 4600.00, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Glutathione
('Glutathione', '1500 mg/vial, 10 vials/kits', 'Glutathione', 546.25, 5462.50, 10, true, '{"concentration": "1500mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Insulin
('Insulin', '100 3ml/vials/kits', 'Insulin', 362.25, 3622.50, 100, true, '{"concentration": "100iu", "volume_per_vial": "3ml", "vials_per_kit": 100}', 1, NOW(), NOW()),

-- NAD+
('NAD+', '100 mg/vial, 10 vials/kits', 'NAD+', 373.75, 3737.50, 10, true, '{"concentration": "100mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('NAD+', '500 mg/vial, 10 vials/kits', 'NAD+', 603.75, 6037.50, 10, true, '{"concentration": "500mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- 5-amino-1mq
('5-amino-1mq', '5 mg/vial', '5-amino-1mq', 529.00, 5290.00, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- HMG
('HMG', '75 iu', 'HMG', 517.50, 5175.00, 10, true, '{"concentration": "75iu", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- EPO
('EPO', '3000 iu', 'EPO', 805.00, 8050.00, 10, true, '{"concentration": "3000iu", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Cerebrolysin
('Cerebrolysin', '60 mg, 6 vials', 'Cerebrolysin', 642.08, 3852.50, 6, true, '{"concentration": "60mg", "vials_per_kit": 6}', 1, NOW(), NOW()),

-- Hyaluronic acid
('Hyaluronic acid', '5 mg/vial, 10 vials/kits', 'Hyaluronic Acid', 287.50, 2875.00, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Cagrilintide
('Cagrilintide', '5 mg/vial, 10 vials/kits', 'Cagrilintide', 805.00, 8050.00, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Cagrilintide', '10 mg/vial, 10 vials/kits', 'Cagrilintide', 1150.00, 11500.00, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Ara-290
('Ara-290', '10 mg/vial, 10 vials/kits', 'Ara-290', 460.00, 4600.00, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- KPV
('KPV', '10 mg/vial, 10 vials/kits', 'KPV', 517.50, 5175.00, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- LC120
('LC120', '10 mg/vial, 10 vials/kits', 'LC120', 575.00, 5750.00, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Lipo-C with vitamins B12
('Lipo-C with vitamins B12', '10 mg/vial, 10 vials/kits', 'Lipo-C', 575.00, 5750.00, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Survodutide
('Survodutide', '10 mg/vial, 10 vials/kits', 'Survodutide', 201.25, 2012.50, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Cagrilintide + Semaglutide
('Cagrilintide + Semaglutide', '5 mg/vial, 10 vials/kits', 'Peptide Combinations', 805.00, 8050.00, 10, true, '{"cagrilintide_concentration": "5mg", "semaglutide_concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- GLOW (BPC-157 + GHK-Cu + TB500)
('GLOW (BPC-157 + GHK-Cu + TB500)', '70 mg/vial, 10 vials/kits', 'Peptide Combinations', 1150.00, 11500.00, 10, true, '{"bpc_concentration": "10mg", "ghk_cu_concentration": "10mg", "tb500_concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- KLOW (CJCU-TR10-BC10-KPV10)
('KLOW (CJCU-TR10-BC10-KPV10)', '80 mg/vial, 10 vials/kits', 'Peptide Combinations', 1150.00, 11500.00, 10, true, '{"cjc_concentration": "10mg", "tr_concentration": "10mg", "bc_concentration": "10mg", "kpv_concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- PNC 27
('PNC 27', '5 mg/vial, 10 vials/kits', 'PNC 27', 690.00, 6900.00, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('PNC 27', '5 mg/vial, 10 vials/kits', 'PNC 27', 414.00, 4140.00, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Pinealon
('Pinealon', '10 mg/vial, 10 vials/kits', 'Pinealon', 460.00, 4600.00, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Pinealon', '20 mg/vial, 10 vials/kits', 'Pinealon', 701.50, 7015.00, 10, true, '{"concentration": "20mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- HGH 191AA (Somatropin)
('HGH 191AA (Somatropin)', '10 iu, 10 vials', 'HGH', 460.00, 4600.00, 10, true, '{"concentration": "10iu", "vials_per_kit": 10}', 1, NOW(), NOW()),
('HGH 191AA (Somatropin)', '15 iu, 10 vials', 'HGH', 575.00, 5750.00, 10, true, '{"concentration": "15iu", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- HGH Fragment 176-191
('HGH Fragment 176-191', '5 mg, 10 vials', 'HGH Fragment', 632.50, 6325.00, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Lemon Bottle
('Lemon Bottle', '10 mg/vial, 10 vials/kits', 'Lemon Bottle', 546.25, 5462.50, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Vasoactive Intestinal Peptide
('Vasoactive Intestinal Peptide', '5 mg/vial, 10 vials/kits', 'VIP', 632.50, 6325.00, 10, true, '{"concentration": "5mg", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Vasoactive Intestinal Peptide', '10 mg/vial, 10 vials/kits', 'VIP', 1006.25, 10062.50, 10, true, '{"concentration": "10mg", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Phosphate Buffered Saline
('Phosphate Buffered Saline', '3 ml/vial, 10 vials/kits', 'PBS', 172.50, 1725.00, 10, true, '{"concentration": "PBS", "volume_per_vial": "3ml", "vials_per_kit": 10}', 1, NOW(), NOW()),

-- Acetic Acid 0.6%
('Acetic Acid 0.6%', '3 ml/vial, 10 vials/kits', 'Acetic Acid', 172.50, 1725.00, 10, true, '{"concentration": "0.6%", "volume_per_vial": "3ml", "vials_per_kit": 10}', 1, NOW(), NOW()),
('Acetic Acid 0.6%', '10 ml/vial, 10 vials/kits', 'Acetic Acid', 201.25, 2012.50, 10, true, '{"concentration": "0.6%", "volume_per_vial": "10ml", "vials_per_kit": 10}', 1, NOW(), NOW());

-- Update the migration journal
INSERT INTO drizzle_migrations (id, hash, created_at) VALUES (4, 'populate_products_data', NOW());
