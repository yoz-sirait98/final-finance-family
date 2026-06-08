-- ============================================================
-- 000010_cascade_delete_transfers.sql
-- Family Finance — Cascade Delete for Transfer Legs
-- ============================================================

-- Create trigger function to cascade delete the counterpart transfer leg
CREATE OR REPLACE FUNCTION public.trg_cascade_delete_transfer()
RETURNS TRIGGER AS $$
BEGIN
    -- If the transaction is a transfer and has a linked transfer transaction
    IF OLD.type = 'transfer' AND OLD.transfer_id IS NOT NULL THEN
        -- Delete the counterpart transfer transaction.
        -- Since this is an AFTER trigger, the parent row is already deleted.
        -- When the cascade delete triggers on the counterpart, it will attempt to
        -- delete the parent row, match 0 rows, and naturally stop recursion.
        DELETE FROM public.transactions 
        WHERE id = OLD.transfer_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger AFTER DELETE to the transactions table
DROP TRIGGER IF EXISTS on_transaction_delete ON public.transactions;
CREATE TRIGGER on_transaction_delete
    AFTER DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.trg_cascade_delete_transfer();
