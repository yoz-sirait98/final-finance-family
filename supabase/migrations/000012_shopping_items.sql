-- ============================================================
-- 000012_shopping_items.sql
-- Collaborative Shopping List Schema
-- ============================================================

-- ── 1. shopping_items Table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shopping_items (
    id BIGSERIAL PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(16,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'needed' CHECK (status IN ('needed', 'bought')),
    transaction_id BIGINT REFERENCES public.transactions(id) ON DELETE SET NULL,
    added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS shopping_items_family_id_status_idx ON public.shopping_items(family_id, status);
CREATE INDEX IF NOT EXISTS shopping_items_transaction_id_idx ON public.shopping_items(transaction_id);

-- ── 2. Enable Realtime ────────────────────────────────────────────────────────
-- Add the table to the Supabase realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_items;

-- ── 3. Row Level Security (RLS) ───────────────────────────────────────────────
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their family's shopping items"
    ON public.shopping_items FOR SELECT
    USING (family_id = (SELECT family_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert shopping items into their family"
    ON public.shopping_items FOR INSERT
    WITH CHECK (family_id = (SELECT family_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their family's shopping items"
    ON public.shopping_items FOR UPDATE
    USING (family_id = (SELECT family_id FROM public.profiles WHERE id = auth.uid()))
    WITH CHECK (family_id = (SELECT family_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their family's shopping items"
    ON public.shopping_items FOR DELETE
    USING (family_id = (SELECT family_id FROM public.profiles WHERE id = auth.uid()));


-- ── 4. Smart Trigger: Auto-Sync Transaction Price ─────────────────────────────
-- When a shopping item's price is updated, if it belongs to a transaction, 
-- update the parent transaction's total amount.
CREATE OR REPLACE FUNCTION public.sync_transaction_from_shopping_item()
RETURNS trigger AS $$
BEGIN
    -- Only act if the price actually changed and it is linked to a transaction
    IF NEW.transaction_id IS NOT NULL AND NEW.price <> OLD.price THEN
        UPDATE public.transactions
        SET amount = (SELECT COALESCE(SUM(price), 0) FROM public.shopping_items WHERE transaction_id = NEW.transaction_id)
        WHERE id = NEW.transaction_id;
        
        -- Note: Updating the transactions table will automatically fire the existing 
        -- `update_account_balance` trigger on the `transactions` table, 
        -- which keeps the bank account balances perfectly in sync!
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_shopping_item_price_update ON public.shopping_items;
CREATE TRIGGER on_shopping_item_price_update
    AFTER UPDATE OF price ON public.shopping_items
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_transaction_from_shopping_item();

-- Also handle deletion of a shopping item that belongs to a transaction
CREATE OR REPLACE FUNCTION public.sync_transaction_on_shopping_item_delete()
RETURNS trigger AS $$
BEGIN
    IF OLD.transaction_id IS NOT NULL THEN
        UPDATE public.transactions
        SET amount = (SELECT COALESCE(SUM(price), 0) FROM public.shopping_items WHERE transaction_id = OLD.transaction_id)
        WHERE id = OLD.transaction_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_shopping_item_delete ON public.shopping_items;
CREATE TRIGGER on_shopping_item_delete
    AFTER DELETE ON public.shopping_items
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_transaction_on_shopping_item_delete();
