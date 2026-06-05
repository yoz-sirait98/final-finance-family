-- ============================================================
-- 000007_dashboard_analytics_rpc.sql
-- Family Finance — Dashboard Analytics Engine
-- ============================================================

-- ── 1. Comprehensive Dashboard RPC ────────────────────────────────────────────
-- Aggregates all analytics required for the Vue 3 Dashboard and Reports pages.
-- Returns a single, rich JSON payload to eliminate N+1 API calls and minimize latency.
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(
    p_family_id UUID,
    p_month INT,
    p_year INT
) RETURNS JSON AS $$
DECLARE
    v_total_balance NUMERIC;
    v_monthly_income NUMERIC;
    v_monthly_expense NUMERIC;
    
    v_budget_utilization JSON;
    v_category_breakdown JSON;
    v_six_month_trend JSON;
    v_member_breakdown JSON;
BEGIN
    -- 1. Summary Cards
    SELECT COALESCE(SUM(balance), 0) INTO v_total_balance
    FROM public.accounts WHERE family_id = p_family_id AND is_active = true;

    SELECT COALESCE(SUM(amount), 0) INTO v_monthly_income
    FROM public.transactions 
    WHERE family_id = p_family_id AND type = 'income' 
      AND EXTRACT(MONTH FROM transaction_date) = p_month 
      AND EXTRACT(YEAR FROM transaction_date) = p_year;

    SELECT COALESCE(SUM(amount), 0) INTO v_monthly_expense
    FROM public.transactions 
    WHERE family_id = p_family_id AND type = 'expense' 
      AND EXTRACT(MONTH FROM transaction_date) = p_month 
      AND EXTRACT(YEAR FROM transaction_date) = p_year;

    -- 2. Budget Utilization
    SELECT COALESCE(json_agg(
        json_build_object(
            'category_id', b.category_id,
            'category_name', c.name,
            'budget_amount', b.amount,
            'spent', COALESCE((
                SELECT SUM(t.amount) FROM public.transactions t 
                WHERE t.family_id = p_family_id AND t.category_id = b.category_id 
                  AND t.type = 'expense' 
                  AND EXTRACT(MONTH FROM t.transaction_date) = p_month 
                  AND EXTRACT(YEAR FROM t.transaction_date) = p_year
            ), 0)
        )
    ), '[]'::json) INTO v_budget_utilization
    FROM public.budgets b
    JOIN public.categories c ON b.category_id = c.id
    WHERE b.family_id = p_family_id AND b.month = p_month AND b.year = p_year;

    -- 3. Category Breakdown (Expense)
    SELECT COALESCE(json_agg(
        json_build_object(
            'category_name', c.name,
            'color', c.color,
            'total', t_agg.total
        )
    ), '[]'::json) INTO v_category_breakdown
    FROM (
        SELECT category_id, SUM(amount) as total
        FROM public.transactions
        WHERE family_id = p_family_id AND type = 'expense'
          AND EXTRACT(MONTH FROM transaction_date) = p_month 
          AND EXTRACT(YEAR FROM transaction_date) = p_year
        GROUP BY category_id
    ) t_agg
    JOIN public.categories c ON t_agg.category_id = c.id;

    -- 4. Six Month Trend
    SELECT COALESCE(json_agg(
        json_build_object(
            'month', month_val,
            'year', year_val,
            'income', COALESCE(income, 0),
            'expense', COALESCE(expense, 0)
        ) ORDER BY year_val ASC, month_val ASC
    ), '[]'::json) INTO v_six_month_trend
    FROM (
        SELECT 
            EXTRACT(MONTH FROM transaction_date) as month_val,
            EXTRACT(YEAR FROM transaction_date) as year_val,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM public.transactions
        WHERE family_id = p_family_id
          -- Rolling 6 months calculation
          AND transaction_date >= make_date(p_year, p_month, 1) - INTERVAL '5 months'
          AND transaction_date < make_date(p_year, p_month, 1) + INTERVAL '1 month'
        GROUP BY EXTRACT(YEAR FROM transaction_date), EXTRACT(MONTH FROM transaction_date)
    ) trend_data;

    -- 5. Member Breakdown (Expense)
    SELECT COALESCE(json_agg(
        json_build_object(
            'member_name', m.name,
            'total', t_agg.total
        )
    ), '[]'::json) INTO v_member_breakdown
    FROM (
        SELECT member_id, SUM(amount) as total
        FROM public.transactions
        WHERE family_id = p_family_id AND type = 'expense' AND member_id IS NOT NULL
          AND EXTRACT(MONTH FROM transaction_date) = p_month 
          AND EXTRACT(YEAR FROM transaction_date) = p_year
        GROUP BY member_id
    ) t_agg
    JOIN public.members m ON t_agg.member_id = m.id;

    -- Return full dashboard payload
    RETURN json_build_object(
        'total_balance', v_total_balance,
        'monthly_income', v_monthly_income,
        'monthly_expense', v_monthly_expense,
        'monthly_net', v_monthly_income - v_monthly_expense,
        'budget_utilization', v_budget_utilization,
        'category_breakdown', v_category_breakdown,
        'six_month_trend', v_six_month_trend,
        'member_breakdown', v_member_breakdown
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
