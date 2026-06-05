-- ============================================================
-- 000005_activity_logging_engine.sql
-- Family Finance — Activity Logging (Audit Trail) Engine
-- ============================================================

-- ── 1. Reusable Audit Trigger Function ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_log_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_family_id UUID;
    v_member_id BIGINT;
    v_action VARCHAR(50);
    v_old_data JSONB := NULL;
    v_new_data JSONB := NULL;
BEGIN
    -- Map Postgres TG_OP to our action enum
    v_action := TG_OP;
    IF v_action = 'INSERT' THEN
        v_action := 'CREATE';
    END IF;

    -- Extract data based on operation type
    IF TG_OP = 'DELETE' THEN
        v_family_id := OLD.family_id;
        v_old_data := to_jsonb(OLD);
        -- Dynamically extract member_id if the table has it (e.g. transactions)
        v_member_id := (v_old_data->>'member_id')::BIGINT;
    ELSE
        v_family_id := NEW.family_id;
        v_new_data := to_jsonb(NEW);
        IF TG_OP = 'UPDATE' THEN
            v_old_data := to_jsonb(OLD);
        END IF;
        v_member_id := (v_new_data->>'member_id')::BIGINT;
    END IF;

    -- Avoid logging if no data actually changed (for UPDATE)
    IF TG_OP = 'UPDATE' AND v_old_data = v_new_data THEN
        RETURN NEW;
    END IF;

    -- Insert the audit log
    INSERT INTO public.activity_logs (
        family_id,
        user_id,
        member_id,
        action,
        entity_type,
        entity_id,
        before_data,
        after_data
    ) VALUES (
        v_family_id,
        auth.uid(), -- The currently authenticated user making the change
        v_member_id,
        v_action,
        TG_TABLE_NAME, -- Dynamically captures 'transactions', 'accounts', etc.
        COALESCE(NEW.id, OLD.id),
        v_old_data,
        v_new_data
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 2. Attach Triggers to Core Tables ─────────────────────────────────────────

-- Accounts
DROP TRIGGER IF EXISTS audit_accounts ON public.accounts;
CREATE TRIGGER audit_accounts AFTER INSERT OR UPDATE OR DELETE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.trg_log_activity();

-- Budgets
DROP TRIGGER IF EXISTS audit_budgets ON public.budgets;
CREATE TRIGGER audit_budgets AFTER INSERT OR UPDATE OR DELETE ON public.budgets
FOR EACH ROW EXECUTE FUNCTION public.trg_log_activity();

-- Categories
DROP TRIGGER IF EXISTS audit_categories ON public.categories;
CREATE TRIGGER audit_categories AFTER INSERT OR UPDATE OR DELETE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.trg_log_activity();

-- Members
DROP TRIGGER IF EXISTS audit_members ON public.members;
CREATE TRIGGER audit_members AFTER INSERT OR UPDATE OR DELETE ON public.members
FOR EACH ROW EXECUTE FUNCTION public.trg_log_activity();

-- Recurring Transactions
DROP TRIGGER IF EXISTS audit_recurring_txns ON public.recurring_transactions;
CREATE TRIGGER audit_recurring_txns AFTER INSERT OR UPDATE OR DELETE ON public.recurring_transactions
FOR EACH ROW EXECUTE FUNCTION public.trg_log_activity();

-- Saving Goals
DROP TRIGGER IF EXISTS audit_saving_goals ON public.saving_goals;
CREATE TRIGGER audit_saving_goals AFTER INSERT OR UPDATE OR DELETE ON public.saving_goals
FOR EACH ROW EXECUTE FUNCTION public.trg_log_activity();

-- Transactions
DROP TRIGGER IF EXISTS audit_transactions ON public.transactions;
CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.trg_log_activity();
