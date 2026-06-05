-- ============================================================
-- 000001_core_schema.sql
-- Family Finance — Core Database Schema & Auth Trigger
-- ============================================================

-- ── 1. families ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. profiles (Extends auth.users) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'owner',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. members ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.members (
    id BIGSERIAL PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'child' CHECK (role IN ('father','mother','child')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. accounts ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounts (
    id BIGSERIAL PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('bank','cash','ewallet')),
    balance NUMERIC(16,2) NOT NULL DEFAULT 0,
    initial_balance NUMERIC(16,2) NOT NULL DEFAULT 0,
    icon VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. categories ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income','expense')),
    icon VARCHAR(255),
    color VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. transactions ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
    id BIGSERIAL PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    member_id BIGINT REFERENCES public.members(id) ON DELETE SET NULL,
    account_id BIGINT NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income','expense','transfer')),
    amount NUMERIC(16,2) NOT NULL,
    description VARCHAR(255),
    transaction_date DATE NOT NULL,
    transfer_id BIGINT REFERENCES public.transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 7. budgets ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.budgets (
    id BIGSERIAL PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
    amount NUMERIC(16,2) NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (family_id, category_id, month, year)
);

-- ── 8. saving_goals ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saving_goals (
    id BIGSERIAL PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    account_id BIGINT REFERENCES public.accounts(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    target_amount NUMERIC(16,2) NOT NULL,
    current_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
    deadline DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 9. recurring_transactions ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
    id BIGSERIAL PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    member_id BIGINT REFERENCES public.members(id) ON DELETE SET NULL,
    account_id BIGINT NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income','expense')),
    amount NUMERIC(16,2) NOT NULL,
    description VARCHAR(255),
    frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('weekly','monthly','yearly')),
    next_due_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 10. activity_logs ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id BIGSERIAL PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    member_id BIGINT REFERENCES public.members(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('CREATE','UPDATE','DELETE')),
    entity_type VARCHAR(255) NOT NULL,
    entity_id BIGINT NOT NULL,
    before_data JSONB,
    after_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 11. notifications ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 12. Auth Trigger for Profile Creation ───────────────────────────────────
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    new_family_id UUID;
    extracted_name VARCHAR;
BEGIN
    -- Try to extract a name from metadata, fallback to email local part
    extracted_name := COALESCE(
        new.raw_user_meta_data->>'full_name', 
        new.raw_user_meta_data->>'name',
        split_part(new.email, '@', 1)
    );

    -- 1. Create a new family for the user
    INSERT INTO public.families (name)
    VALUES (extracted_name || '''s Family')
    RETURNING id INTO new_family_id;

    -- 2. Create the profile linked to the family
    INSERT INTO public.profiles (id, family_id, full_name, avatar_url, role)
    VALUES (
        new.id,
        new_family_id,
        extracted_name,
        new.raw_user_meta_data->>'avatar_url',
        'owner'
    );

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to fire on insert to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Performance Indexes
CREATE INDEX IF NOT EXISTS transactions_family_id_date_idx ON public.transactions(family_id, transaction_date);
CREATE INDEX IF NOT EXISTS budgets_family_id_month_year_idx ON public.budgets(family_id, month, year);
CREATE INDEX IF NOT EXISTS activity_logs_family_id_created_at_idx ON public.activity_logs(family_id, created_at);
