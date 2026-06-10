-- ============================================================
-- 000021_add_gemini_api_key_to_families.sql
-- Add gemini_api_key to public.families table
-- ============================================================

ALTER TABLE public.families ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;
