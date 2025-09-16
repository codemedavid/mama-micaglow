-- Fix the status constraint for group_buy_batches table
-- This script will update the existing constraint to allow all the required status values

-- First, drop the existing constraint
ALTER TABLE group_buy_batches DROP CONSTRAINT IF EXISTS group_buy_batches_status_check;

-- Add the new constraint with all required status values
ALTER TABLE group_buy_batches ADD CONSTRAINT group_buy_batches_status_check 
CHECK (status IN ('draft', 'active', 'completed', 'cancelled'));

-- Verify the constraint was added (updated for newer PostgreSQL versions)
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'group_buy_batches'::regclass 
AND contype = 'c';