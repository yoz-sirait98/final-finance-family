-- ============================================================
-- 000027_shopping_plan_assignees.sql
-- Adds assigned_members to shopping_plans and restricts the 
-- WhatsApp notification trigger to only notify assigned members
-- ============================================================

-- 1. Add the assigned_members array column
ALTER TABLE public.shopping_plans 
ADD COLUMN IF NOT EXISTS assigned_members BIGINT[] DEFAULT '{}';

-- 2. Update the webhook trigger to filter by assigned_members
CREATE OR REPLACE FUNCTION public.trigger_whatsapp_shopping_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_members_json JSONB;
    v_phone_numbers JSONB;
    v_payload JSONB;
    v_bot_url TEXT;
    v_api_key TEXT;
    v_creator_name TEXT;
BEGIN
    -- Configuration: Ensure these match your live Heroku details
    v_bot_url := 'https://finance-family-3ac25ba9b522.herokuapp.com/api/notify';
    v_api_key := 'YOUR_HEROKU_API_KEY_HERE'; -- UPDATE THIS LOCALLY BEFORE PUSHING

    -- Fetch the name of the member who created the list
    SELECT name INTO v_creator_name 
    FROM public.members 
    WHERE id = NEW.created_by;

    -- Find all active members who have a WhatsApp number, notifications enabled,
    -- AND are explicitly assigned to this Shopping Plan
    SELECT jsonb_agg(whatsapp_number) INTO v_phone_numbers
    FROM public.members
    WHERE family_id = NEW.family_id
      AND is_active = true
      AND notifications_enabled = true
      AND whatsapp_number IS NOT NULL
      AND length(trim(whatsapp_number)) > 0
      AND id = ANY(NEW.assigned_members); -- NEW REQUIREMENT FILTER

    -- If no phone numbers are found (or no assigned members have notifications on), exit early
    IF v_phone_numbers IS NULL OR jsonb_array_length(v_phone_numbers) = 0 THEN
        RETURN NEW;
    END IF;

    -- Construct the notification message
    v_payload := jsonb_build_object(
        'numbers', v_phone_numbers,
        'message', '*========================*' || CHR(10) ||
                   '🛒  *NEW SHOPPING LIST*  🛒' || CHR(10) ||
                   '*========================*' || CHR(10) || CHR(10) ||
                   'Hi! 👋 You have been assigned to a new shopping list in the *Family Finance App*.' || CHR(10) || CHR(10) ||
                   '📍 *Location:*  ' || NEW.location || CHR(10) ||
                   COALESCE('👤 *Created by:* ' || v_creator_name || CHR(10), '') || 
                   '📅 *Date:*      ' || to_char(NEW.created_at, 'DD Mon YYYY') || CHR(10) || CHR(10) ||
                   '*------------------------*' || CHR(10) ||
                   'Open the FamFin app to see and manage the items! 🛍️'
    );

    -- Send the HTTP POST request via pg_net asynchronously
    PERFORM net.http_post(
        url := v_bot_url,
        body := v_payload,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-api-key', v_api_key
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
