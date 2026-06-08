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
        -- Prevent recursive deletion by breaking the link on the counterpart first
        UPDATE public.transactions 
        SET transfer_id = NULL 
        WHERE id = OLD.transfer_id;
        
        -- Delete the counterpart transfer transaction
        DELETE FROM public.transactions 
        WHERE id = OLD.transfer_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger BEFORE DELETE to the transactions table
DROP TRIGGER IF EXISTS on_transaction_delete ON public.transactions;
CREATE TRIGGER on_transaction_delete
    BEFORE DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.trg_cascade_delete_transfer();
