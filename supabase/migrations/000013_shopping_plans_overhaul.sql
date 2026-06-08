-- Drop old flat shopping_items table and its triggers
DROP TRIGGER IF EXISTS sync_transaction_from_shopping_item ON public.shopping_items;
DROP FUNCTION IF EXISTS public.update_transaction_from_shopping_item();
DROP TABLE IF EXISTS public.shopping_items CASCADE;

-- 1. Create shopping_plans
CREATE TABLE public.shopping_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    created_by BIGINT REFERENCES public.members(id) ON DELETE SET NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'progress' CHECK (status IN ('progress', 'done')),
    transaction_id BIGINT REFERENCES public.transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shopping_plans_family ON public.shopping_plans(family_id);

-- Enable RLS for shopping_plans
ALTER TABLE public.shopping_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable ALL for family members" ON public.shopping_plans
    FOR ALL USING (
        family_id = (SELECT family_id FROM public.profiles WHERE id = auth.uid())
    );

-- 2. Create new nested shopping_items
CREATE TABLE public.shopping_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shopping_plan_id UUID NOT NULL REFERENCES public.shopping_plans(id) ON DELETE CASCADE,
    added_by BIGINT REFERENCES public.members(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shopping_items_plan ON public.shopping_items(shopping_plan_id);

-- Enable RLS for shopping_items
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable ALL for family members" ON public.shopping_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.shopping_plans p
            WHERE p.id = shopping_items.shopping_plan_id
            AND p.family_id = (SELECT family_id FROM public.profiles WHERE id = auth.uid())
        )
    );



-- 3. Recreate Smart Sync Trigger
CREATE OR REPLACE FUNCTION public.update_transaction_from_shopping_item()
RETURNS TRIGGER AS $$
DECLARE
    v_transaction_id BIGINT;
    v_total_amount DECIMAL(15,2);
    v_plan_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_plan_id := OLD.shopping_plan_id;
    ELSE
        v_plan_id := NEW.shopping_plan_id;
    END IF;

    -- Get the transaction_id from the parent shopping_plan
    SELECT transaction_id INTO v_transaction_id 
    FROM public.shopping_plans 
    WHERE id = v_plan_id;

    -- If a transaction is linked, recalculate its total
    IF v_transaction_id IS NOT NULL THEN
        SELECT COALESCE(SUM(price), 0) INTO v_total_amount 
        FROM public.shopping_items 
        WHERE shopping_plan_id = v_plan_id;
        
        UPDATE public.transactions 
        SET amount = v_total_amount 
        WHERE id = v_transaction_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_transaction_from_shopping_item
AFTER INSERT OR UPDATE OF price OR DELETE ON public.shopping_items
FOR EACH ROW
EXECUTE FUNCTION public.update_transaction_from_shopping_item();

-- 4. Supabase Realtime Setup
-- Drop old publication additions if any (though dropping table cascade might handle it)
-- We just ensure they are in the publication
DO $$
BEGIN
    -- Remove the old one if it's there
    -- Actually 'shopping_items' was dropped so it is automatically removed from publication
    
    -- Add the new ones
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE shopping_plans';
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END
$$;

DO $$
BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE shopping_items';
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END
$$;
