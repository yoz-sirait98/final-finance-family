-- ============================================================
-- 000019_goals_status_enum.sql
-- Family Finance — Change Saving Goals Status Enum
-- ============================================================

-- Drop the existing constraint
ALTER TABLE public.saving_goals DROP CONSTRAINT IF EXISTS saving_goals_status_check;

-- Convert any existing 'cancelled' to 'inactive'
UPDATE public.saving_goals SET status = 'inactive' WHERE status = 'cancelled';

-- Add the new constraint with active, completed, inactive
ALTER TABLE public.saving_goals ADD CONSTRAINT saving_goals_status_check CHECK (status IN ('active', 'completed', 'inactive'));

-- Update the cron function to use 'inactive' instead of 'cancelled'
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

    -- 2. Inactivate goals that failed to meet their target
    UPDATE public.saving_goals
    SET status = 'inactive', updated_at = NOW()
    WHERE status = 'active'
      AND deadline IS NOT NULL 
      AND deadline < CURRENT_DATE - INTERVAL '3 days'
      AND current_amount < target_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
