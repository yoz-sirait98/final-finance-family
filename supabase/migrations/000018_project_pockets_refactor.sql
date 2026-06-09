-- Refactor Project Pockets to not deduct from current_amount

DROP TRIGGER IF EXISTS trg_project_pocket_sync ON public.transactions;
DROP FUNCTION IF EXISTS public.on_project_pocket_transaction();
