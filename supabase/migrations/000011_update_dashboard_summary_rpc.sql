-- ============================================================
-- 000011_update_dashboard_summary_rpc.sql
-- Family Finance — Update Dashboard Summary RPC with Filters
-- ============================================================

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
BEGIN
    -- 1. Determine base month for trend calculations (default to December if all months selected)
    IF p_month IS NULL OR p_month = 0 THEN
        v_trend_month := 12;
    ELSE
        v_trend_month := p_month;
    END IF;

    -- 2. Summary Cards
    -- Note: Account balances are not associated with a specific member, so total balance is unfiltered by member
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
            ), 0)
        )
    ), '[]'::json) INTO v_budget_utilization
    FROM public.budgets b
    JOIN public.categories c ON b.category_id = c.id
    WHERE b.family_id = p_family_id 
      AND (p_month IS NULL OR p_month = 0 OR b.month = p_month) 
      AND b.year = p_year;

    -- 4. Category Breakdown (Expense)
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
          AND (p_month IS NULL OR p_month = 0 OR EXTRACT(MONTH FROM transaction_date) = p_month)
          AND EXTRACT(YEAR FROM transaction_date) = p_year
          AND (p_member_id IS NULL OR p_member_id = 0 OR member_id = p_member_id)
        GROUP BY category_id
    ) t_agg
    JOIN public.categories c ON t_agg.category_id = c.id;

    -- 5. Six Month Trend
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
          AND transaction_date >= make_date(p_year, v_trend_month, 1) - INTERVAL '5 months'
          AND transaction_date < make_date(p_year, v_trend_month, 1) + INTERVAL '1 month'
          AND (p_member_id IS NULL OR p_member_id = 0 OR member_id = p_member_id)
        GROUP BY EXTRACT(YEAR FROM transaction_date), EXTRACT(MONTH FROM transaction_date)
    ) trend_data;

    -- 6. Member Breakdown (Expense)
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
          AND (p_month IS NULL OR p_month = 0 OR EXTRACT(MONTH FROM transaction_date) = p_month)
          AND EXTRACT(YEAR FROM transaction_date) = p_year
          AND (p_member_id IS NULL OR p_member_id = 0 OR member_id = p_member_id)
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
