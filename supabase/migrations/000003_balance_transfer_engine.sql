-- ============================================================
-- 000003_balance_transfer_engine.sql
-- Family Finance — Balance Engine & Atomic Transfers
-- ============================================================

-- ── 1. Balance Update Trigger Function ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        IF OLD.type = 'income' THEN
            UPDATE public.accounts SET balance = balance - OLD.amount, updated_at = NOW() WHERE id = OLD.account_id;
        ELSIF OLD.type = 'expense' THEN
            UPDATE public.accounts SET balance = balance + OLD.amount, updated_at = NOW() WHERE id = OLD.account_id;
        ELSIF OLD.type = 'transfer' THEN
            -- transfer amount can be positive or negative
            UPDATE public.accounts SET balance = balance - OLD.amount, updated_at = NOW() WHERE id = OLD.account_id;
        END IF;
        RETURN OLD;
    END IF;

    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        IF NEW.type = 'income' THEN
            UPDATE public.accounts SET balance = balance + NEW.amount, updated_at = NOW() WHERE id = NEW.account_id;
        ELSIF NEW.type = 'expense' THEN
            UPDATE public.accounts SET balance = balance - NEW.amount, updated_at = NOW() WHERE id = NEW.account_id;
        ELSIF NEW.type = 'transfer' THEN
            -- transfer amount can be positive (incoming) or negative (outgoing)
            UPDATE public.accounts SET balance = balance + NEW.amount, updated_at = NOW() WHERE id = NEW.account_id;
        END IF;
        RETURN NEW;
    END IF;

    -- Handle UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Only recalculate if amount, account, or type actually changed
        IF NEW.amount != OLD.amount OR NEW.account_id != OLD.account_id OR NEW.type != OLD.type THEN
            
            -- Step A: Revert OLD transaction impact
            IF OLD.type = 'income' THEN
                UPDATE public.accounts SET balance = balance - OLD.amount, updated_at = NOW() WHERE id = OLD.account_id;
            ELSIF OLD.type = 'expense' THEN
                UPDATE public.accounts SET balance = balance + OLD.amount, updated_at = NOW() WHERE id = OLD.account_id;
            ELSIF OLD.type = 'transfer' THEN
                UPDATE public.accounts SET balance = balance - OLD.amount, updated_at = NOW() WHERE id = OLD.account_id;
            END IF;

            -- Step B: Apply NEW transaction impact
            IF NEW.type = 'income' THEN
                UPDATE public.accounts SET balance = balance + NEW.amount, updated_at = NOW() WHERE id = NEW.account_id;
            ELSIF NEW.type = 'expense' THEN
                UPDATE public.accounts SET balance = balance - NEW.amount, updated_at = NOW() WHERE id = NEW.account_id;
            ELSIF NEW.type = 'transfer' THEN
                UPDATE public.accounts SET balance = balance + NEW.amount, updated_at = NOW() WHERE id = NEW.account_id;
            END IF;
            
        END IF;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger to the transactions table
DROP TRIGGER IF EXISTS on_transaction_changed ON public.transactions;
CREATE TRIGGER on_transaction_changed
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.trg_update_account_balance();


-- ── 2. Atomic Transfer RPC ──────────────────────────────────────────────────
-- Replaces complex backend controller logic with a single atomic database operation.
CREATE OR REPLACE FUNCTION public.handle_transfer_transaction(
    p_family_id UUID,
    p_member_id BIGINT,
    p_from_account_id BIGINT,
    p_to_account_id BIGINT,
    p_amount NUMERIC,
    p_date DATE,
    p_description VARCHAR
) RETURNS VOID AS $$
DECLARE
    v_out_id BIGINT;
    v_in_id BIGINT;
BEGIN
    -- 1. Strict validation
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Transfer amount must be strictly positive';
    END IF;

    IF p_from_account_id = p_to_account_id THEN
        RAISE EXCEPTION 'Cannot transfer to the same account';
    END IF;

    -- 2. Insert Outgoing Leg (Negative amount to automatically deduct balance via trigger)
    INSERT INTO public.transactions (family_id, member_id, account_id, type, amount, description, transaction_date)
    VALUES (p_family_id, p_member_id, p_from_account_id, 'transfer', -p_amount, p_description, p_date)
    RETURNING id INTO v_out_id;

    -- 3. Insert Incoming Leg (Positive amount), linking it to the outgoing leg
    INSERT INTO public.transactions (family_id, member_id, account_id, type, amount, description, transaction_date, transfer_id)
    VALUES (p_family_id, p_member_id, p_to_account_id, 'transfer', p_amount, p_description, p_date, v_out_id)
    RETURNING id INTO v_in_id;

    -- 4. Cross-link: Update the outgoing leg to point to the incoming leg
    -- This update triggers the balance engine, but because amount/account/type haven't changed,
    -- the balance engine smartly skips redundant calculations.
    UPDATE public.transactions SET transfer_id = v_in_id WHERE id = v_out_id;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
