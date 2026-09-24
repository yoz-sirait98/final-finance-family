-- ============================================================
-- 000038_security_hardening.sql
-- Family Finance — Pre-Launch Security Hardening Migration
-- ============================================================

-- ── 1. Protect Profile Multi-Tenant Isolation ────────────────
-- Prevent authenticated users from changing their own family_id
-- or id, which would allow cross-family data access/takeover.
CREATE OR REPLACE FUNCTION public.protect_profile_immutable_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent changing family_id to hijack another family's data
    IF NEW.family_id IS DISTINCT FROM OLD.family_id THEN
        RAISE EXCEPTION 'Security violation: Cannot modify family_id on profile';
    END IF;

    -- Prevent changing user ID
    IF NEW.id IS DISTINCT FROM OLD.id THEN
        RAISE EXCEPTION 'Security violation: Cannot modify id on profile';
    END IF;

    -- Prevent regular users from modifying role to elevate permissions
    IF NEW.role IS DISTINCT FROM OLD.role AND auth.role() = 'authenticated' AND OLD.role != 'owner' THEN
        RAISE EXCEPTION 'Security violation: Cannot modify role on profile';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_immutable_fields();


-- ── 2. Restrict system_settings Access ─────────────────────────
-- System settings contains server-side secrets (e.g. WhatsApp Bot API key).
-- Regular authenticated client apps should NEVER read these secrets directly.
DROP POLICY IF EXISTS "Allow authenticated read" ON public.system_settings;
DROP POLICY IF EXISTS "Allow service_role full access on system_settings" ON public.system_settings;

-- Allow only service_role (backend/cron) or family owners if specifically required
CREATE POLICY "Allow service_role full access on system_settings"
    ON public.system_settings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- ── 3. Harden get_dashboard_summary RPC ───────────────────────
-- Add family authorization check and strict search_path to prevent
-- cross-tenant information leakage and search_path escalation.
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(
    p_family_id UUID,
    p_month INT,
    p_year INT,
    p_member_id BIGINT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_total_balance NUMERIC;
    v_monthly_income NUMERIC;
    v_monthly_expense NUMERIC;
    
    v_budget_utilization JSON;
    v_category_breakdown JSON;
    v_six_month_trend JSON;
    v_member_breakdown JSON;
    
    v_trend_month INT;
    
    -- Insights Engine
    v_insights JSONB := '[]'::jsonb;
    v_upcoming_expenses NUMERIC;
    v_predicted_balance NUMERIC;
BEGIN
    -- Authorization Check: Ensure authenticated user belongs to requested family
    IF auth.role() = 'authenticated' AND p_family_id IS DISTINCT FROM public.get_auth_family_id() THEN
        RAISE EXCEPTION 'Security violation: Access denied for requested family';
    END IF;

    -- 1. Determine base month for trend calculations (default to December if all months selected)
    IF p_month IS NULL OR p_month = 0 THEN
        v_trend_month := 12;
    ELSE
        v_trend_month := p_month;
    END IF;

    -- 2. Summary Cards
    SELECT COALESCE(SUM(balance), 0) INTO v_total_balance
    FROM public.accounts WHERE family_id = p_family_id AND is_active = true;

    SELECT COALESCE(SUM(amount), 0) INTO v_monthly_income
    FROM public.transactions 
    WHERE family_id = p_family_id AND type = 'income' 
      AND (p_month IS NULL OR p_month = 0 OR EXTRACT(MONTH FROM transaction_date) = p_month)
      AND EXTRACT(YEAR FROM transaction_date) = p_year
      AND (p_member_id IS NULL OR p_member_id = 0 OR member_id = p_member_id);

    SELECT COALESCE(SUM(amount), 0) INTO v_monthly_expense
    FROM public.transactions 
    WHERE family_id = p_family_id AND type = 'expense' 
      AND (p_month IS NULL OR p_month = 0 OR EXTRACT(MONTH FROM transaction_date) = p_month)
      AND EXTRACT(YEAR FROM transaction_date) = p_year
      AND (p_member_id IS NULL OR p_member_id = 0 OR member_id = p_member_id);

    -- 3. Budget Utilization
    SELECT COALESCE(json_agg(
        json_build_object(
            'category_id', b.category_id,
            'category_name', c.name,
            'budget_amount', b.amount,
            'spent', COALESCE((
                SELECT SUM(t.amount) FROM public.transactions t 
                WHERE t.family_id = p_family_id AND t.category_id = b.category_id 
                  AND t.type = 'expense' 
                  AND (p_month IS NULL OR p_month = 0 OR EXTRACT(MONTH FROM t.transaction_date) = p_month)
                  AND EXTRACT(YEAR FROM t.transaction_date) = p_year
                  AND (p_member_id IS NULL OR p_member_id = 0 OR t.member_id = p_member_id)
                  AND t.goal_id IS NULL
            ), 0),
            'percentage', CASE 
                WHEN b.amount > 0 THEN 
                    ROUND((COALESCE((
                        SELECT SUM(t.amount) FROM public.transactions t 
                        WHERE t.family_id = p_family_id AND t.category_id = b.category_id 
                          AND t.type = 'expense' 
                          AND (p_month IS NULL OR p_month = 0 OR EXTRACT(MONTH FROM t.transaction_date) = p_month)
                          AND EXTRACT(YEAR FROM t.transaction_date) = p_year
                          AND (p_member_id IS NULL OR p_member_id = 0 OR t.member_id = p_member_id)
                          AND t.goal_id IS NULL
                    ), 0) / b.amount) * 100, 2)
                ELSE 0 
            END
        )
    ), '[]'::json) INTO v_budget_utilization
    FROM public.budgets b
    JOIN public.categories c ON c.id = b.category_id
    WHERE b.family_id = p_family_id 
      AND (p_month IS NULL OR p_month = 0 OR b.month = p_month) 
      AND b.year = p_year;

    -- 4. Category Breakdown
    SELECT COALESCE(json_agg(
        json_build_object(
            'category_name', c.name,
            'category_icon', c.icon,
            'category_color', c.color,
            'total_amount', cat_sum.total
        )
    ), '[]'::json) INTO v_category_breakdown
    FROM (
        SELECT category_id, SUM(amount) as total
        FROM public.transactions
        WHERE family_id = p_family_id AND type = 'expense'
          AND (p_month IS NULL OR p_month = 0 OR EXTRACT(MONTH FROM transaction_date) = p_month)
          AND EXTRACT(YEAR FROM transaction_date) = p_year
          AND (p_member_id IS NULL OR p_member_id = 0 OR member_id = p_member_id)
        GROUP BY category_id
    ) cat_sum
    JOIN public.categories c ON c.id = cat_sum.category_id;

    -- 5. Member Breakdown
    SELECT COALESCE(json_agg(
        json_build_object(
            'member_id', m.id,
            'member_name', m.name,
            'total_amount', mem_sum.total
        )
    ), '[]'::json) INTO v_member_breakdown
    FROM (
        SELECT member_id, SUM(amount) as total
        FROM public.transactions
        WHERE family_id = p_family_id AND type = 'expense'
          AND (p_month IS NULL OR p_month = 0 OR EXTRACT(MONTH FROM transaction_date) = p_month)
          AND EXTRACT(YEAR FROM transaction_date) = p_year
          AND member_id IS NOT NULL
        GROUP BY member_id
    ) mem_sum
    JOIN public.members m ON m.id = mem_sum.member_id;

    -- 6. Six Month Trend
    SELECT COALESCE(json_agg(
        json_build_object(
            'month', trend_series.m_date,
            'income', COALESCE((
                SELECT SUM(amount) FROM public.transactions 
                WHERE family_id = p_family_id AND type = 'income' 
                  AND DATE_TRUNC('month', transaction_date) = trend_series.m_date
                  AND (p_member_id IS NULL OR p_member_id = 0 OR member_id = p_member_id)
            ), 0),
            'expense', COALESCE((
                SELECT SUM(amount) FROM public.transactions 
                WHERE family_id = p_family_id AND type = 'expense' 
                  AND DATE_TRUNC('month', transaction_date) = trend_series.m_date
                  AND (p_member_id IS NULL OR p_member_id = 0 OR member_id = p_member_id)
            ), 0)
        ) ORDER BY trend_series.m_date ASC
    ), '[]'::json) INTO v_six_month_trend
    FROM (
        SELECT generate_series(
            DATE_TRUNC('month', TO_DATE(p_year || '-' || v_trend_month || '-01', 'YYYY-MM-DD')) - INTERVAL '5 months',
            DATE_TRUNC('month', TO_DATE(p_year || '-' || v_trend_month || '-01', 'YYYY-MM-DD')),
            '1 month'::interval
        )::date AS m_date
    ) trend_series;

    -- 7. Predictive Financial Insights
    SELECT COALESCE(SUM(amount), 0) INTO v_upcoming_expenses
    FROM public.recurring_transactions
    WHERE family_id = p_family_id 
      AND is_active = true 
      AND type = 'expense'
      AND next_due_date <= (CURRENT_DATE + INTERVAL '14 days');

    v_predicted_balance := v_total_balance - v_upcoming_expenses;

    IF v_upcoming_expenses > 0 THEN
        IF v_predicted_balance < 0 THEN
            v_insights := v_insights || jsonb_build_object(
                'type', 'danger',
                'title', 'Peringatan Defisit Kas',
                'description', 'Tagihan berulang 14 hari ke depan melebihi total saldo akun Anda saat ini.'
            );
        ELSE
            v_insights := v_insights || jsonb_build_object(
                'type', 'info',
                'title', 'Tagihan Mendatang Terjadwal',
                'description', 'Akan ada pengeluaran rutin terencana dalam 14 hari ke depan.'
            );
        END IF;
    END IF;

    RETURN json_build_object(
        'total_balance', v_total_balance,
        'monthly_income', v_monthly_income,
        'monthly_expense', v_monthly_expense,
        'net_savings', (v_monthly_income - v_monthly_expense),
        'budget_utilization', v_budget_utilization,
        'category_breakdown', v_category_breakdown,
        'six_month_trend', v_six_month_trend,
        'member_breakdown', v_member_breakdown,
        'insights', v_insights
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- ── 4. Harden check_budget_guardrail RPC ───────────────────────
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
    -- Authorization Check
    IF auth.role() = 'authenticated' AND p_family_id IS DISTINCT FROM public.get_auth_family_id() THEN
        RAISE EXCEPTION 'Security violation: Access denied for requested family';
    END IF;

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

    IF NOT FOUND THEN
        RETURN json_build_object(
            'allowed', true,
            'exceeded', false,
            'remaining_budget', null,
            'projected_balance', null
        );
    END IF;

    -- 2. Calculate currently spent amount
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

    RETURN json_build_object(
        'allowed', true,
        'exceeded', v_exceeded,
        'budget_amount', v_budget_amount,
        'current_spent', v_current_spent,
        'projected_spent', v_projected_spent,
        'remaining_budget', v_remaining_budget,
        'projected_balance', v_projected_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- ── 5. Enforce Valid Transaction & Budget Amounts (DB Constraints) ──
-- In this dual-entry architecture, transfers utilize two synchronized legs:
--   - Outgoing leg: amount < 0 (automatically deducts source account balance via trigger)
--   - Incoming leg: amount > 0 (automatically increases destination account balance via trigger)
-- Income and Expense transactions must be strictly positive (amount > 0).
DO $$
BEGIN
    ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS chk_transactions_positive_amount;
    ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS chk_transactions_valid_amount;

    ALTER TABLE public.transactions 
        ADD CONSTRAINT chk_transactions_valid_amount 
        CHECK (
            (type IN ('income', 'expense') AND amount > 0) OR
            (type = 'transfer' AND amount <> 0)
        );

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_budgets_positive_amount'
    ) THEN
        ALTER TABLE public.budgets 
            ADD CONSTRAINT chk_budgets_positive_amount CHECK (amount >= 0);
    END IF;
END $$;


-- ── 6. Storage Bucket Security Restrictions ───────────────────
-- Restrict file size to 5MB and allowed mime types for receipts
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg']
WHERE id = 'receipts';
