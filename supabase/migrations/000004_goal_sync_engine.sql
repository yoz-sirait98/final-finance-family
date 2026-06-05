-- ============================================================
-- 000004_goal_sync_engine.sql
-- Family Finance — Saving Goals Pocket Synchronization
-- ============================================================

-- ── 1. Sync from Account to Goal ──────────────────────────────────────────────
-- When an account's balance changes, automatically update any linked saving goals.
CREATE OR REPLACE FUNCTION public.trg_sync_goal_pocket()
RETURNS TRIGGER AS $$
BEGIN
    -- Only act if the balance actually changed
    IF NEW.balance IS DISTINCT FROM OLD.balance THEN
        UPDATE public.saving_goals
        SET current_amount = NEW.balance,
            updated_at = NOW()
        WHERE account_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_account_balance_changed ON public.accounts;
CREATE TRIGGER on_account_balance_changed
    AFTER UPDATE OF balance ON public.accounts
    FOR EACH ROW EXECUTE FUNCTION public.trg_sync_goal_pocket();


-- ── 2. Sync from Goal creation/linkage ────────────────────────────────────────
-- When a goal is created or edited to point to a new account, immediately
-- pull the current balance of that account so it doesn't wait for a transaction.
CREATE OR REPLACE FUNCTION public.trg_init_goal_pocket()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.account_id IS NOT NULL THEN
        -- Safely fetch the current balance of the newly linked account
        NEW.current_amount := COALESCE(
            (SELECT balance FROM public.accounts WHERE id = NEW.account_id LIMIT 1), 
            0
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_goal_linked ON public.saving_goals;
CREATE TRIGGER on_goal_linked
    BEFORE INSERT OR UPDATE OF account_id ON public.saving_goals
    FOR EACH ROW EXECUTE FUNCTION public.trg_init_goal_pocket();
