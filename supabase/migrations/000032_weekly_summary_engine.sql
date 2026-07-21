-- ============================================================
-- 000032_weekly_summary_engine.sql
-- Automates Sunday Weekly Financial Summaries via WhatsApp
-- ============================================================

-- Ensure pg_net and pg_cron are enabled
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.generate_weekly_summary_notifications()
RETURNS VOID AS $$
DECLARE
    v_family RECORD;
    v_category RECORD;
    v_total_spent NUMERIC;
    v_total_income NUMERIC;
    v_start_date DATE;
    v_end_date DATE;
    v_message TEXT;
    v_category_breakdown TEXT;
    v_payload JSONB;
    v_bot_url TEXT;
    v_api_key TEXT;
    v_currency_formatter CONSTANT TEXT := 'FM999,999,999,999';
BEGIN
    -- 1. Fetch Bot Configuration from secure system_settings
    SELECT value INTO v_bot_url FROM public.system_settings WHERE key = 'bot_url';
    SELECT value INTO v_api_key FROM public.system_settings WHERE key = 'bot_api_key';

    IF v_bot_url IS NULL OR v_api_key IS NULL OR v_api_key = 'PLACEHOLDER_KEY' THEN
        RAISE WARNING 'Bot URL or API Key is not configured in system_settings. Skipping summary generation.';
        RETURN;
    END IF;

    -- Define the period (Last 7 days, up to today)
    v_end_date := CURRENT_DATE;
    v_start_date := v_end_date - INTERVAL '7 days';

    -- 2. Loop through all active families that have a WhatsApp Group configured
    FOR v_family IN 
        SELECT id, name, whatsapp_group_id 
        FROM public.families 
        WHERE whatsapp_group_id IS NOT NULL 
          AND length(trim(whatsapp_group_id)) > 0
    LOOP
        v_total_spent := 0;
        v_total_income := 0;
        v_category_breakdown := '';

        -- A. Calculate Total Income for the week
        SELECT COALESCE(SUM(amount), 0) INTO v_total_income
        FROM public.transactions
        WHERE family_id = v_family.id
          AND type = 'income'
          AND transaction_date > v_start_date 
          AND transaction_date <= v_end_date;

        -- B. Calculate Total Expenses and build Category Breakdown
        FOR v_category IN
            SELECT c.name as cat_name, COALESCE(SUM(t.amount), 0) as cat_total
            FROM public.transactions t
            JOIN public.categories c ON t.category_id = c.id
            WHERE t.family_id = v_family.id
              AND t.type = 'expense'
              AND t.transaction_date > v_start_date 
              AND t.transaction_date <= v_end_date
            GROUP BY c.name
            ORDER BY cat_total DESC
        LOOP
            v_total_spent := v_total_spent + v_category.cat_total;
            v_category_breakdown := v_category_breakdown || '  • ' || v_category.cat_name || ': Rp ' || to_char(v_category.cat_total, v_currency_formatter) || E'\n';
        END LOOP;

        -- Only send if there was some activity (spent or earned)
        IF v_total_spent > 0 OR v_total_income > 0 THEN
            
            -- C. Construct the final WhatsApp Message
            v_message := '📊 *Weekly Family Finance Summary* 📊' || E'\n' ||
                         '*' || v_family.name || ' Family*' || E'\n' ||
                         '*Period:* ' || to_char(v_start_date + interval '1 day', 'DD Mon YYYY') || ' to ' || to_char(v_end_date, 'DD Mon YYYY') || E'\n\n' ||
                         '💸 *Total Income:* + Rp ' || to_char(v_total_income, v_currency_formatter) || E'\n' ||
                         '🛒 *Total Spent:* - Rp ' || to_char(v_total_spent, v_currency_formatter) || E'\n\n';

            IF v_total_spent > 0 THEN
                v_message := v_message || '*Breakdown by Category:*' || E'\n' || v_category_breakdown || E'\n';
            END IF;

            v_message := v_message || 'Great job managing your budget this week! Open the FamFin app to see your full analytics.';

            -- D. Prepare JSON Payload for the webhook
            v_payload := jsonb_build_object(
                'groupId', v_family.whatsapp_group_id,
                'message', v_message
            );

            -- E. Fire the webhook via pg_net
            PERFORM net.http_post(
                url := v_bot_url,
                body := v_payload,
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'x-api-key', v_api_key
                )
            );

        END IF;

    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── Schedule via pg_cron ───────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    
    -- Remove old schedule to avoid duplicates
    BEGIN
      PERFORM cron.unschedule('weekly_summary_notifications_job');
    EXCEPTION WHEN OTHERS THEN 
      -- Ignore if not found
    END;
    
    -- Schedule to run every Sunday at 08:00 AM (0 8 * * 0)
    PERFORM cron.schedule(
        'weekly_summary_notifications_job', 
        '0 8 * * 0', 
        'SELECT public.generate_weekly_summary_notifications();'
    );
  END IF;
END
$$;
