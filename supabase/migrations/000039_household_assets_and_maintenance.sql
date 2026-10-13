-- Migration 000039: Household Assets, Vehicle/Home Maintenance & Warranty Tracker
-- Family-scoped physical assets, warranties, maintenance schedules, and service logs

-- ── 1. Household Assets & Vehicles Table ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('vehicle', 'appliance', 'electronics', 'furniture', 'property', 'other')),
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    purchase_date DATE,
    purchase_price NUMERIC(16,2) DEFAULT 0 CHECK (purchase_price >= 0),
    current_value NUMERIC(16,2) CHECK (current_value IS NULL OR current_value >= 0),
    location TEXT,
    assigned_member_id BIGINT REFERENCES public.members(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'under_repair', 'disposed', 'sold')),
    image_url TEXT,
    notes TEXT,
    license_plate TEXT,
    current_odometer INT DEFAULT 0 CHECK (current_odometer >= 0),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. Asset Warranties Table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.asset_warranties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    warranty_type TEXT NOT NULL DEFAULT 'manufacturer' CHECK (warranty_type IN ('manufacturer', 'store', 'extended', 'lifetime')),
    start_date DATE NOT NULL,
    end_date DATE,
    provider_name TEXT,
    provider_contact TEXT,
    policy_number TEXT,
    document_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expiring_soon', 'expired', 'claimed', 'void')),
    claim_instructions TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 3. Asset Maintenance Schedules Table ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.asset_maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    frequency_type TEXT NOT NULL DEFAULT 'months' CHECK (frequency_type IN ('days', 'months', 'odometer', 'one_time')),
    interval_value INT CHECK (interval_value IS NULL OR interval_value > 0),
    last_performed_date DATE,
    last_performed_odometer INT CHECK (last_performed_odometer IS NULL OR last_performed_odometer >= 0),
    next_due_date DATE,
    next_due_odometer INT CHECK (next_due_odometer IS NULL OR next_due_odometer >= 0),
    estimated_cost NUMERIC(16,2) DEFAULT 0 CHECK (estimated_cost >= 0),
    assigned_member_id BIGINT REFERENCES public.members(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 4. Asset Maintenance Logs Table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.asset_maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES public.asset_maintenance_schedules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    performed_date DATE NOT NULL,
    performed_by TEXT,
    cost NUMERIC(16,2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
    odometer INT CHECK (odometer IS NULL OR odometer >= 0),
    transaction_id BIGINT REFERENCES public.transactions(id) ON DELETE SET NULL,
    invoice_url TEXT,
    description TEXT,
    performed_member_id BIGINT REFERENCES public.members(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 5. Performance Indexes ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_assets_family_category ON public.assets(family_id, category, status);
CREATE INDEX IF NOT EXISTS idx_assets_family_assigned ON public.assets(family_id, assigned_member_id);
CREATE INDEX IF NOT EXISTS idx_asset_warranties_family_end_date ON public.asset_warranties(family_id, end_date);
CREATE INDEX IF NOT EXISTS idx_asset_warranties_asset_id ON public.asset_warranties(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_maintenance_schedules_next_due ON public.asset_maintenance_schedules(family_id, next_due_date, is_active);
CREATE INDEX IF NOT EXISTS idx_asset_maintenance_schedules_asset_id ON public.asset_maintenance_schedules(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_maintenance_logs_asset_id ON public.asset_maintenance_logs(asset_id, performed_date DESC);
CREATE INDEX IF NOT EXISTS idx_asset_maintenance_logs_family ON public.asset_maintenance_logs(family_id, performed_date DESC);

-- ── 6. Enable Row Level Security (RLS) ───────────────────────────────
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_maintenance_logs ENABLE ROW LEVEL SECURITY;

-- ── 7. RLS Policies: public.assets ────────────────────────────────────
DROP POLICY IF EXISTS "assets_family_select" ON public.assets;
CREATE POLICY "assets_family_select"
    ON public.assets FOR SELECT
    USING (family_id = public.get_auth_family_id());

DROP POLICY IF EXISTS "assets_family_insert" ON public.assets;
CREATE POLICY "assets_family_insert"
    ON public.assets FOR INSERT
    WITH CHECK (family_id = public.get_auth_family_id());

DROP POLICY IF EXISTS "assets_family_update" ON public.assets;
CREATE POLICY "assets_family_update"
    ON public.assets FOR UPDATE
    USING (family_id = public.get_auth_family_id());

DROP POLICY IF EXISTS "assets_family_delete" ON public.assets;
CREATE POLICY "assets_family_delete"
    ON public.assets FOR DELETE
    USING (family_id = public.get_auth_family_id());

-- ── 8. RLS Policies: public.asset_warranties ──────────────────────────
DROP POLICY IF EXISTS "asset_warranties_family_select" ON public.asset_warranties;
CREATE POLICY "asset_warranties_family_select"
    ON public.asset_warranties FOR SELECT
    USING (family_id = public.get_auth_family_id());

DROP POLICY IF EXISTS "asset_warranties_family_insert" ON public.asset_warranties;
CREATE POLICY "asset_warranties_family_insert"
    ON public.asset_warranties FOR INSERT
    WITH CHECK (family_id = public.get_auth_family_id());

DROP POLICY IF EXISTS "asset_warranties_family_update" ON public.asset_warranties;
CREATE POLICY "asset_warranties_family_update"
    ON public.asset_warranties FOR UPDATE
    USING (family_id = public.get_auth_family_id());

DROP POLICY IF EXISTS "asset_warranties_family_delete" ON public.asset_warranties;
CREATE POLICY "asset_warranties_family_delete"
    ON public.asset_warranties FOR DELETE
    USING (family_id = public.get_auth_family_id());

-- ── 9. RLS Policies: public.asset_maintenance_schedules ───────────────
DROP POLICY IF EXISTS "asset_maintenance_schedules_family_select" ON public.asset_maintenance_schedules;
CREATE POLICY "asset_maintenance_schedules_family_select"
    ON public.asset_maintenance_schedules FOR SELECT
    USING (family_id = public.get_auth_family_id());

DROP POLICY IF EXISTS "asset_maintenance_schedules_family_insert" ON public.asset_maintenance_schedules;
CREATE POLICY "asset_maintenance_schedules_family_insert"
    ON public.asset_maintenance_schedules FOR INSERT
    WITH CHECK (family_id = public.get_auth_family_id());

DROP POLICY IF EXISTS "asset_maintenance_schedules_family_update" ON public.asset_maintenance_schedules;
CREATE POLICY "asset_maintenance_schedules_family_update"
    ON public.asset_maintenance_schedules FOR UPDATE
    USING (family_id = public.get_auth_family_id());

DROP POLICY IF EXISTS "asset_maintenance_schedules_family_delete" ON public.asset_maintenance_schedules;
CREATE POLICY "asset_maintenance_schedules_family_delete"
    ON public.asset_maintenance_schedules FOR DELETE
    USING (family_id = public.get_auth_family_id());

-- ── 10. RLS Policies: public.asset_maintenance_logs ───────────────────
DROP POLICY IF EXISTS "asset_maintenance_logs_family_select" ON public.asset_maintenance_logs;
CREATE POLICY "asset_maintenance_logs_family_select"
    ON public.asset_maintenance_logs FOR SELECT
    USING (family_id = public.get_auth_family_id());

DROP POLICY IF EXISTS "asset_maintenance_logs_family_insert" ON public.asset_maintenance_logs;
CREATE POLICY "asset_maintenance_logs_family_insert"
    ON public.asset_maintenance_logs FOR INSERT
    WITH CHECK (family_id = public.get_auth_family_id());

DROP POLICY IF EXISTS "asset_maintenance_logs_family_update" ON public.asset_maintenance_logs;
CREATE POLICY "asset_maintenance_logs_family_update"
    ON public.asset_maintenance_logs FOR UPDATE
    USING (family_id = public.get_auth_family_id());

DROP POLICY IF EXISTS "asset_maintenance_logs_family_delete" ON public.asset_maintenance_logs;
CREATE POLICY "asset_maintenance_logs_family_delete"
    ON public.asset_maintenance_logs FOR DELETE
    USING (family_id = public.get_auth_family_id());

-- ── 11. Trigger: Auto-Update Schedule and Asset Odometer on Log ───────
CREATE OR REPLACE FUNCTION public.handle_asset_maintenance_log_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_freq_type TEXT;
    v_interval INT;
BEGIN
    -- 1. Advance maintenance schedule if linked
    IF NEW.schedule_id IS NOT NULL THEN
        SELECT frequency_type, interval_value INTO v_freq_type, v_interval
        FROM public.asset_maintenance_schedules
        WHERE id = NEW.schedule_id;

        IF FOUND THEN
            UPDATE public.asset_maintenance_schedules
            SET 
                last_performed_date = NEW.performed_date,
                last_performed_odometer = COALESCE(NEW.odometer, last_performed_odometer),
                next_due_date = CASE 
                    WHEN v_freq_type = 'months' AND v_interval > 0 THEN (NEW.performed_date + (v_interval || ' months')::interval)::date
                    WHEN v_freq_type = 'days' AND v_interval > 0 THEN (NEW.performed_date + (v_interval || ' days')::interval)::date
                    WHEN v_freq_type = 'one_time' THEN NULL
                    ELSE next_due_date
                END,
                next_due_odometer = CASE
                    WHEN v_freq_type = 'odometer' AND v_interval > 0 THEN COALESCE(NEW.odometer, 0) + v_interval
                    ELSE next_due_odometer
                END,
                updated_at = now()
            WHERE id = NEW.schedule_id;
        END IF;
    END IF;

    -- 2. Update vehicle asset odometer if current log has higher odometer
    IF NEW.odometer IS NOT NULL AND NEW.odometer > 0 THEN
        UPDATE public.assets
        SET 
            current_odometer = GREATEST(COALESCE(current_odometer, 0), NEW.odometer),
            updated_at = now()
        WHERE id = NEW.asset_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_update_maintenance_schedule_on_log ON public.asset_maintenance_logs;
CREATE TRIGGER trg_update_maintenance_schedule_on_log
    AFTER INSERT ON public.asset_maintenance_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_asset_maintenance_log_insert();
