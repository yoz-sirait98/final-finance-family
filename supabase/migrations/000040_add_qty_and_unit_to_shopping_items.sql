-- Migration 000040: Add qty and unit to shopping_items
-- Supports tracking item quantity and measurement units (e.g., Tomato 1kg 20000)

ALTER TABLE public.shopping_items 
ADD COLUMN IF NOT EXISTS qty NUMERIC DEFAULT 1,
ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT 'pcs';

-- Update any existing rows that have NULL values
UPDATE public.shopping_items
SET qty = 1
WHERE qty IS NULL;

UPDATE public.shopping_items
SET unit = 'pcs'
WHERE unit IS NULL;
