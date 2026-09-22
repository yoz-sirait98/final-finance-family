-- Migration 000036: Smart Meal Planner & Pantry Inventory System
-- Family-scoped pantry items, weekly meal planning, and recipes

-- 1. Pantry Items Table
CREATE TABLE IF NOT EXISTS public.pantry_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'produce',
    location TEXT NOT NULL DEFAULT 'fridge' CHECK (location IN ('fridge', 'freezer', 'pantry')),
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'pcs',
    expiration_date DATE,
    status TEXT NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'consumed', 'discarded')),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Meal Plans Table
CREATE TABLE IF NOT EXISTS public.meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    plan_date DATE NOT NULL,
    meal_type TEXT NOT NULL DEFAULT 'dinner' CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    recipe_title TEXT NOT NULL,
    description TEXT,
    assigned_member_id BIGINT REFERENCES public.members(id) ON DELETE SET NULL,
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Recipes Table (Family Favorite & AI Recipes)
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'main_course',
    prep_time_minutes INT DEFAULT 15,
    cook_time_minutes INT DEFAULT 30,
    servings INT DEFAULT 4,
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai_generated')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_pantry_items_family_location ON public.pantry_items(family_id, location, status);
CREATE INDEX IF NOT EXISTS idx_pantry_items_expiry ON public.pantry_items(family_id, expiration_date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_family_date ON public.meal_plans(family_id, plan_date);
CREATE INDEX IF NOT EXISTS idx_recipes_family ON public.recipes(family_id, is_favorite);

-- Enable Row Level Security (RLS)
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pantry_items
CREATE POLICY "pantry_items_family_select"
    ON public.pantry_items FOR SELECT
    USING (family_id = public.get_auth_family_id());

CREATE POLICY "pantry_items_family_insert"
    ON public.pantry_items FOR INSERT
    WITH CHECK (family_id = public.get_auth_family_id());

CREATE POLICY "pantry_items_family_update"
    ON public.pantry_items FOR UPDATE
    USING (family_id = public.get_auth_family_id());

CREATE POLICY "pantry_items_family_delete"
    ON public.pantry_items FOR DELETE
    USING (family_id = public.get_auth_family_id());

-- RLS Policies for meal_plans
CREATE POLICY "meal_plans_family_select"
    ON public.meal_plans FOR SELECT
    USING (family_id = public.get_auth_family_id());

CREATE POLICY "meal_plans_family_insert"
    ON public.meal_plans FOR INSERT
    WITH CHECK (family_id = public.get_auth_family_id());

CREATE POLICY "meal_plans_family_update"
    ON public.meal_plans FOR UPDATE
    USING (family_id = public.get_auth_family_id());

CREATE POLICY "meal_plans_family_delete"
    ON public.meal_plans FOR DELETE
    USING (family_id = public.get_auth_family_id());

-- RLS Policies for recipes
CREATE POLICY "recipes_family_select"
    ON public.recipes FOR SELECT
    USING (family_id = public.get_auth_family_id());

CREATE POLICY "recipes_family_insert"
    ON public.recipes FOR INSERT
    WITH CHECK (family_id = public.get_auth_family_id());

CREATE POLICY "recipes_family_update"
    ON public.recipes FOR UPDATE
    USING (family_id = public.get_auth_family_id());

CREATE POLICY "recipes_family_delete"
    ON public.recipes FOR DELETE
    USING (family_id = public.get_auth_family_id());
