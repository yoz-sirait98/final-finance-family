-- ============================================================
-- 000009_goals_inactive_status.sql
-- Family Finance — Goal Inactive Status & Cron Engine
-- ============================================================

-- ── 1. Update saving_goals status constraint ──────────────────────────────────
-- Postgres automatically names constraints if not specified. We must dynamically
-- find the CHECK constraint on the `status` column to drop it safely.
DO $$
DECLARE
    const_name text;
BEGIN
    -- Find the check constraint on saving_goals for column status
    SELECT con.conname INTO const_name
    FROM pg_constraint con
    JOIN pg_attribute a ON a.attnum = ANY(con.conkey)
    JOIN pg_class c ON c.oid = con.conrelid
    WHERE c.relname = 'saving_goals' 
      AND a.attname = 'status'
      AND con.contype = 'c';
    
    IF const_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.saving_goals DROP CONSTRAINT ' || const_name;
    END IF;
END $$;

-- Add the new constraint allowing 'inactive'
ALTER TABLE public.saving_goals 
ADD CONSTRAINT saving_goals_status_check 
CHECK (status IN ('active', 'completed', 'cancelled', 'inactive'));

-- ── 2. Overdue Goals Engine ───────────────────────────────────────────────────
-- Sweeps active goals that are more than 3 days past their deadline.
-- If the target was met, they are marked 'completed'. Otherwise, 'cancelled'.
CREATE OR REPLACE FUNCTION public.process_overdue_goals()
RETURNS VOID AS $$
BEGIN
    -- 1. Complete goals that met their target
    UPDATE public.saving_goals
    SET status = 'completed', updated_at = NOW()
    WHERE status = 'active'
      AND deadline IS NOT NULL 
      AND deadline < CURRENT_DATE - INTERVAL '3 days'
      AND current_amount >= target_amount;

    -- 2. Cancel goals that failed to meet their target
    UPDATE public.saving_goals
    SET status = 'cancelled', updated_at = NOW()
    WHERE status = 'active'
      AND deadline IS NOT NULL 
      AND deadline < CURRENT_DATE - INTERVAL '3 days'
      AND current_amount < target_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 3. Schedule via pg_cron ───────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    BEGIN
      PERFORM cron.unschedule('process_overdue_goals_job');
    EXCEPTION WHEN OTHERS THEN 
      -- Ignore if it doesn't exist
    END;
    
    -- Run every day at 02:00 AM
    PERFORM cron.schedule(
        'process_overdue_goals_job', 
        '0 2 * * *', 
        'SELECT public.process_overdue_goals();'
    );
  END IF;
END
$$;
