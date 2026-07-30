-- Allow 'locked' as a valid status for shopping_plans
ALTER TABLE public.shopping_plans DROP CONSTRAINT IF EXISTS shopping_plans_status_check;
ALTER TABLE public.shopping_plans ADD CONSTRAINT shopping_plans_status_check CHECK (status IN ('progress', 'done', 'locked'));
