-- ============================================================
-- 000006_budget_guardrail_rpc.sql
-- Family Finance — Budget Guardrail Validation Engine
-- ============================================================

-- ── 1. Budget Guardrail RPC ───────────────────────────────────────────────────
-- Evaluates a proposed transaction against the monthly budget limit.
-- Returns structured JSON so the frontend can display a warning modal instead
-- of throwing a hard database exception.
CREATE OR REPLACE FUNCTION public.check_budget_guardrail(
    p_family_id UUID,
    p_category_id BIGINT,
    p_amount NUMERIC,
    p_date DATE
) RETURNS JSON AS $$
DECLARE
    v_month INTEGER;
    v_year INTEGER;
    v_budget_amount NUMERIC;
    v_current_spent NUMERIC;
    v_projected_spent NUMERIC;
    v_remaining_budget NUMERIC;
    v_projected_balance NUMERIC;
    v_exceeded BOOLEAN;
BEGIN
    -- Extract period
    v_month := EXTRACT(MONTH FROM p_date);
    v_year := EXTRACT(YEAR FROM p_date);

    -- 1. Check if a budget exists for this category and period
    SELECT amount INTO v_budget_amount
    FROM public.budgets
    WHERE family_id = p_family_id 
      AND category_id = p_category_id 
      AND month = v_month 
      AND year = v_year;

    -- If no budget is set, there is no limit to exceed
    IF NOT FOUND THEN
        RETURN json_build_object(
            'allowed', true,
            'exceeded', false,
            'remaining_budget', null,
            'projected_balance', null
        );
    END IF;

    -- 2. Calculate currently spent amount
    -- Only 'expense' types reduce the budget
    SELECT COALESCE(SUM(amount), 0) INTO v_current_spent
    FROM public.transactions
    WHERE family_id = p_family_id
      AND category_id = p_category_id
      AND type = 'expense'
      AND EXTRACT(MONTH FROM transaction_date) = v_month
      AND EXTRACT(YEAR FROM transaction_date) = v_year
      AND goal_id IS NULL;

    -- 3. Calculate projections
    v_projected_spent := v_current_spent + p_amount;
    v_remaining_budget := v_budget_amount - v_current_spent;
    v_projected_balance := v_budget_amount - v_projected_spent;
    v_exceeded := v_projected_spent > v_budget_amount;

    -- 4. Return structured JSON payload to the frontend
    RETURN json_build_object(
        'allowed', true,  -- Frontend can still allow the transaction to proceed
        'exceeded', v_exceeded,
        'remaining_budget', v_remaining_budget,
        'projected_balance', v_projected_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
