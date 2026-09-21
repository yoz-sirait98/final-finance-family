-- ============================================================
-- 000035_family_scheduler.sql
-- Family Scheduler & Task Management Engine
-- ============================================================

-- ── 1. task_categories ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(100) DEFAULT 'Folder',
    color VARCHAR(50) DEFAULT '#6366f1',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. tasks ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_member_id BIGINT REFERENCES public.members(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.task_categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_all_day BOOLEAN DEFAULT FALSE NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    external_provider TEXT,
    external_calendar_id TEXT,
    external_event_id TEXT,
    external_event_link TEXT,
    external_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ── 3. task_reminders ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) DEFAULT 'notification' CHECK (reminder_type IN ('notification', 'alarm', 'both')) NOT NULL,
    minutes_before INTEGER DEFAULT 15 NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    is_triggered BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. task_recurrences ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_recurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    frequency VARCHAR(50) DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')) NOT NULL,
    interval INTEGER DEFAULT 1 NOT NULL,
    days_of_week INTEGER[],
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. Performance Indexes ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_task_categories_family ON public.task_categories(family_id);
CREATE INDEX IF NOT EXISTS idx_tasks_family ON public.tasks(family_id);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON public.tasks(task_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_member ON public.tasks(assigned_member_id);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON public.tasks(updated_at);
CREATE INDEX IF NOT EXISTS idx_task_reminders_task ON public.task_reminders(task_id);
CREATE INDEX IF NOT EXISTS idx_task_reminders_family ON public.task_reminders(family_id);
CREATE INDEX IF NOT EXISTS idx_task_recurrences_task ON public.task_recurrences(task_id);

-- ── 6. Row Level Security (RLS) Policies ──────────────────────
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_recurrences ENABLE ROW LEVEL SECURITY;

-- task_categories policies
CREATE POLICY "Users can manage task_categories in their family"
ON public.task_categories FOR ALL TO authenticated
USING (family_id = public.get_auth_family_id())
WITH CHECK (family_id = public.get_auth_family_id());

-- tasks policies
CREATE POLICY "Users can manage tasks in their family"
ON public.tasks FOR ALL TO authenticated
USING (family_id = public.get_auth_family_id())
WITH CHECK (family_id = public.get_auth_family_id());

-- task_reminders policies
CREATE POLICY "Users can manage task_reminders in their family"
ON public.task_reminders FOR ALL TO authenticated
USING (family_id = public.get_auth_family_id())
WITH CHECK (family_id = public.get_auth_family_id());

-- task_recurrences policies
CREATE POLICY "Users can manage task_recurrences in their family"
ON public.task_recurrences FOR ALL TO authenticated
USING (family_id = public.get_auth_family_id())
WITH CHECK (family_id = public.get_auth_family_id());

-- ── 7. Seed Default Categories for Families ───────────────────
CREATE OR REPLACE FUNCTION public.seed_default_task_categories(p_family_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.task_categories (family_id, name, icon, color, is_default)
    VALUES
        (p_family_id, 'Family & Kids', 'Users', '#ec4899', TRUE),
        (p_family_id, 'Home & Chores', 'Home', '#10b981', TRUE),
        (p_family_id, 'Work', 'Briefcase', '#3b82f6', TRUE),
        (p_family_id, 'Finance', 'DollarSign', '#f59e0b', TRUE),
        (p_family_id, 'Health & Medical', 'HeartPulse', '#ef4444', TRUE),
        (p_family_id, 'Personal', 'User', '#8b5cf6', TRUE)
    ON CONFLICT DO NOTHING;
END;
$$;

-- Seed existing families
DO $$
DECLARE
    f RECORD;
BEGIN
    FOR f IN SELECT id FROM public.families LOOP
        PERFORM public.seed_default_task_categories(f.id);
    END LOOP;
END $$;
