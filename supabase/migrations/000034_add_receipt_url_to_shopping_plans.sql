-- Migration 000034: Add receipt_url to shopping_plans
-- Adds a column to store the Supabase Storage path for scanned receipt images
-- linked to a shopping plan record.

ALTER TABLE public.shopping_plans
  ADD COLUMN IF NOT EXISTS receipt_url TEXT;

COMMENT ON COLUMN public.shopping_plans.receipt_url IS
  'Supabase Storage path to the uploaded receipt image (e.g. receipts/{family_id}/{uuid}.jpg). NULL if no receipt was scanned.';
