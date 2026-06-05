-- ============================================================
-- 000002_rls_policies.sql
-- Family Finance — Row Level Security (RLS) Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saving_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ── 1. Helper Function ────────────────────────────────────────────────────────
-- Efficiently get the current authenticated user's family_id.
-- Marked STABLE so it's cached per query, preventing performance issues in RLS.
CREATE OR REPLACE FUNCTION public.get_auth_family_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT family_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ── 2. Families ───────────────────────────────────────────────────────────────
CREATE POLICY "Users can view their own family"
ON public.families FOR SELECT TO authenticated
USING (id = public.get_auth_family_id());

CREATE POLICY "Users can update their own family"
ON public.families FOR UPDATE TO authenticated
USING (id = public.get_auth_family_id())
WITH CHECK (id = public.get_auth_family_id());

-- ── 3. Profiles ───────────────────────────────────────────────────────────────
CREATE POLICY "Users can view profiles in their family"
ON public.profiles FOR SELECT TO authenticated
USING (family_id = public.get_auth_family_id() OR id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ── 4. Standard Tables (Data isolated by family_id) ───────────────────────────
-- We apply the same pattern to all core data tables.

-- MEMBERS
CREATE POLICY "Members SELECT" ON public.members FOR SELECT TO authenticated USING (family_id = public.get_auth_family_id());
CREATE POLICY "Members INSERT" ON public.members FOR INSERT TO authenticated WITH CHECK (family_id = public.get_auth_family_id());
CREATE POLICY "Members UPDATE" ON public.members FOR UPDATE TO authenticated USING (family_id = public.get_auth_family_id()) WITH CHECK (family_id = public.get_auth_family_id());
CREATE POLICY "Members DELETE" ON public.members FOR DELETE TO authenticated USING (family_id = public.get_auth_family_id());

-- ACCOUNTS
CREATE POLICY "Accounts SELECT" ON public.accounts FOR SELECT TO authenticated USING (family_id = public.get_auth_family_id());
CREATE POLICY "Accounts INSERT" ON public.accounts FOR INSERT TO authenticated WITH CHECK (family_id = public.get_auth_family_id());
CREATE POLICY "Accounts UPDATE" ON public.accounts FOR UPDATE TO authenticated USING (family_id = public.get_auth_family_id()) WITH CHECK (family_id = public.get_auth_family_id());
CREATE POLICY "Accounts DELETE" ON public.accounts FOR DELETE TO authenticated USING (family_id = public.get_auth_family_id());

-- CATEGORIES
CREATE POLICY "Categories SELECT" ON public.categories FOR SELECT TO authenticated USING (family_id = public.get_auth_family_id());
CREATE POLICY "Categories INSERT" ON public.categories FOR INSERT TO authenticated WITH CHECK (family_id = public.get_auth_family_id());
CREATE POLICY "Categories UPDATE" ON public.categories FOR UPDATE TO authenticated USING (family_id = public.get_auth_family_id()) WITH CHECK (family_id = public.get_auth_family_id());
CREATE POLICY "Categories DELETE" ON public.categories FOR DELETE TO authenticated USING (family_id = public.get_auth_family_id());

-- TRANSACTIONS
CREATE POLICY "Transactions SELECT" ON public.transactions FOR SELECT TO authenticated USING (family_id = public.get_auth_family_id());
CREATE POLICY "Transactions INSERT" ON public.transactions FOR INSERT TO authenticated WITH CHECK (family_id = public.get_auth_family_id());
CREATE POLICY "Transactions UPDATE" ON public.transactions FOR UPDATE TO authenticated USING (family_id = public.get_auth_family_id()) WITH CHECK (family_id = public.get_auth_family_id());
CREATE POLICY "Transactions DELETE" ON public.transactions FOR DELETE TO authenticated USING (family_id = public.get_auth_family_id());

-- BUDGETS
CREATE POLICY "Budgets SELECT" ON public.budgets FOR SELECT TO authenticated USING (family_id = public.get_auth_family_id());
CREATE POLICY "Budgets INSERT" ON public.budgets FOR INSERT TO authenticated WITH CHECK (family_id = public.get_auth_family_id());
CREATE POLICY "Budgets UPDATE" ON public.budgets FOR UPDATE TO authenticated USING (family_id = public.get_auth_family_id()) WITH CHECK (family_id = public.get_auth_family_id());
CREATE POLICY "Budgets DELETE" ON public.budgets FOR DELETE TO authenticated USING (family_id = public.get_auth_family_id());

-- SAVING GOALS
CREATE POLICY "Saving Goals SELECT" ON public.saving_goals FOR SELECT TO authenticated USING (family_id = public.get_auth_family_id());
CREATE POLICY "Saving Goals INSERT" ON public.saving_goals FOR INSERT TO authenticated WITH CHECK (family_id = public.get_auth_family_id());
CREATE POLICY "Saving Goals UPDATE" ON public.saving_goals FOR UPDATE TO authenticated USING (family_id = public.get_auth_family_id()) WITH CHECK (family_id = public.get_auth_family_id());
CREATE POLICY "Saving Goals DELETE" ON public.saving_goals FOR DELETE TO authenticated USING (family_id = public.get_auth_family_id());

-- RECURRING TRANSACTIONS
CREATE POLICY "Recurring Txns SELECT" ON public.recurring_transactions FOR SELECT TO authenticated USING (family_id = public.get_auth_family_id());
CREATE POLICY "Recurring Txns INSERT" ON public.recurring_transactions FOR INSERT TO authenticated WITH CHECK (family_id = public.get_auth_family_id());
CREATE POLICY "Recurring Txns UPDATE" ON public.recurring_transactions FOR UPDATE TO authenticated USING (family_id = public.get_auth_family_id()) WITH CHECK (family_id = public.get_auth_family_id());
CREATE POLICY "Recurring Txns DELETE" ON public.recurring_transactions FOR DELETE TO authenticated USING (family_id = public.get_auth_family_id());

-- ACTIVITY LOGS (Insert and Select only. Logs should be immutable.)
CREATE POLICY "Activity Logs SELECT" ON public.activity_logs FOR SELECT TO authenticated USING (family_id = public.get_auth_family_id());
CREATE POLICY "Activity Logs INSERT" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (family_id = public.get_auth_family_id());

-- NOTIFICATIONS
CREATE POLICY "Notifications SELECT" ON public.notifications FOR SELECT TO authenticated USING (family_id = public.get_auth_family_id());
CREATE POLICY "Notifications INSERT" ON public.notifications FOR INSERT TO authenticated WITH CHECK (family_id = public.get_auth_family_id());
CREATE POLICY "Notifications UPDATE" ON public.notifications FOR UPDATE TO authenticated USING (family_id = public.get_auth_family_id()) WITH CHECK (family_id = public.get_auth_family_id());
CREATE POLICY "Notifications DELETE" ON public.notifications FOR DELETE TO authenticated USING (family_id = public.get_auth_family_id());
