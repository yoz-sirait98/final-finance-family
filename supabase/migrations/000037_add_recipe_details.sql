-- Migration 000037: Add recipe detail columns (name, description, difficulty, tips)
-- Supports AI Chef recipe saving and full recipe metadata.

ALTER TABLE public.recipes 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'easy',
  ADD COLUMN IF NOT EXISTS tips TEXT;

-- Synchronize existing records between name and title
UPDATE public.recipes SET name = title WHERE name IS NULL AND title IS NOT NULL;
UPDATE public.recipes SET title = name WHERE title IS NULL AND name IS NOT NULL;

-- Allow title to be optional
ALTER TABLE public.recipes ALTER COLUMN title DROP NOT NULL;
