-- Migration 000022: Add receipt_url to transactions
-- Adds a column to store the Supabase Storage path for scanned receipt images
-- linked to a transaction record.

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS receipt_url TEXT;

COMMENT ON COLUMN public.transactions.receipt_url IS
  'Supabase Storage path to the uploaded receipt image (e.g. receipts/{family_id}/{uuid}.jpg). NULL if no receipt was scanned.';
