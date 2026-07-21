-- ============================================================
-- 000024_fix_recurring_catchup_and_concurrency.sql
-- Fixes pg_cron execution failures by adding:
-- 1. Concurrency locks (FOR UPDATE) to prevent duplicates.
-- 2. Multi-month catch-up loop to process all missed occurrences.
-- ============================================================

CREATE OR REPLACE FUNCTION public.process_recurring_transactions()
RETURNS VOID AS $$
DECLARE
    r RECORD;
    v_next_due DATE;
    v_processed BOOLEAN;
BEGIN
    LOOP
        v_processed := false;
        
        -- Lock the rows we are processing to prevent concurrent client/cron executions
        FOR r IN 
            SELECT * FROM public.recurring_transactions 
            WHERE is_active = true 
              AND next_due_date <= CURRENT_DATE
              AND (end_date IS NULL OR next_due_date <= end_date)
            FOR UPDATE
        LOOP
            -- 1. Insert the realized transaction
            INSERT INTO public.transactions (
                family_id, member_id, account_id, category_id, type, amount, description, transaction_date
            ) VALUES (
                r.family_id, 
                r.member_id, 
                r.account_id, 
                r.category_id, 
                r.type, 
                r.amount, 
                COALESCE(r.description, 'Recurring') || ' (Auto)', 
                r.next_due_date
            );

            -- 2. Calculate the next due date based on frequency
            IF r.frequency = 'weekly' THEN
                v_next_due := r.next_due_date + INTERVAL '1 week';
            ELSIF r.frequency = 'monthly' THEN
                v_next_due := r.next_due_date + INTERVAL '1 month';
            ELSIF r.frequency = 'yearly' THEN
                v_next_due := r.next_due_date + INTERVAL '1 year';
            END IF;

            -- 3. Check against end_date and update next_due_date
            IF r.end_date IS NOT NULL AND v_next_due > r.end_date THEN
                UPDATE public.recurring_transactions 
                SET is_active = false, next_due_date = v_next_due, updated_at = NOW() 
                WHERE id = r.id;
            ELSE
                UPDATE public.recurring_transactions 
                SET next_due_date = v_next_due, updated_at = NOW() 
                WHERE id = r.id;
            END IF;
            
            v_processed := true;
        END LOOP;
        
        -- Exit the loop if no rows were processed in this iteration
        IF NOT v_processed THEN
            EXIT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
