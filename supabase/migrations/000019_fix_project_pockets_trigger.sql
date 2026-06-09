-- Actually drop the project pockets trigger (names were swapped in 000018)

DROP TRIGGER IF EXISTS on_project_pocket_transaction ON public.transactions;
DROP FUNCTION IF EXISTS public.trg_project_pocket_sync();
