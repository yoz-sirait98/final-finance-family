-- Migration to add a checkbox state to shopping_items

ALTER TABLE public.shopping_items 
ADD COLUMN is_checked BOOLEAN NOT NULL DEFAULT FALSE;
