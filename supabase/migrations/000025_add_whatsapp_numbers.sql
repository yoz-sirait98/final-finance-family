-- ============================================================
-- 000025_add_whatsapp_numbers.sql
-- Adds phone numbers and notification toggles to the members table
-- ============================================================

ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN NOT NULL DEFAULT true;

-- Update the activity logger to track these new fields if they change
-- (The existing activity logger function uses ROW TO JSON so no changes to the trigger are strictly necessary, 
-- but this migration explicitly provisions the columns).
