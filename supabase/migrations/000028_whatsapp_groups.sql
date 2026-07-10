-- ============================================================
-- 000028_whatsapp_groups.sql
-- Add whatsapp_group_id to families and update notification trigger
-- ============================================================

-- 1. Add whatsapp_group_id to families
ALTER TABLE public.families 
ADD COLUMN IF NOT EXISTS whatsapp_group_id VARCHAR(255);

-- 2. Update the webhook trigger
CREATE OR REPLACE FUNCTION public.trigger_whatsapp_shopping_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_phone_numbers JSONB;
    v_payload JSONB;
    v_bot_url TEXT;
    v_api_key TEXT;
    v_creator_name TEXT;
    v_group_id TEXT;
    v_assigned_names TEXT;
BEGIN
    -- Configuration: Ensure these match your live Heroku details
    v_bot_url := 'https://finance-family-3ac25ba9b522.herokuapp.com/api/notify';
    v_api_key := 'YOUR_HEROKU_API_KEY_HERE'; -- UPDATE THIS LOCALLY BEFORE PUSHING

    -- Fetch Creator Name and the Family's WhatsApp Group ID
    SELECT m.name, f.whatsapp_group_id INTO v_creator_name, v_group_id
    FROM public.members m
    JOIN public.families f ON m.family_id = f.id
    WHERE m.id = NEW.created_by;

    -- Fetch Phone Numbers AND Names of the assigned members
    -- Note: We now fetch phone numbers even if notifications_enabled is false, 
    -- but you can restrict it if you want. For now, we only require the number to exist.
    SELECT 
        jsonb_agg(whatsapp_number) FILTER (WHERE notifications_enabled = true AND whatsapp_number IS NOT NULL AND length(trim(whatsapp_number)) > 0),
        string_agg(name, ', ')
    INTO v_phone_numbers, v_assigned_names
    FROM public.members
    WHERE family_id = NEW.family_id
      AND is_active = true
      AND id = ANY(NEW.assigned_members);

    -- If no group ID AND no valid phone numbers are found, exit early
    IF (v_group_id IS NULL OR length(trim(v_group_id)) = 0) AND 
       (v_phone_numbers IS NULL OR jsonb_array_length(v_phone_numbers) = 0) THEN
        RETURN NEW;
    END IF;

    -- Construct the notification message
    v_payload := jsonb_build_object(
        'groupId', v_group_id,
        'numbers', v_phone_numbers,
        'message', '*========================*' || CHR(10) ||
                   '🛒  *NEW SHOPPING LIST*  🛒' || CHR(10) ||
                   '*========================*' || CHR(10) || CHR(10) ||
                   'Hi! 👋 A new shopping list has been created in the *Family Finance App*.' || CHR(10) || CHR(10) ||
                   '📍 *Location:*  ' || NEW.location || CHR(10) ||
                   COALESCE('👤 *Created by:* ' || v_creator_name || CHR(10), '') || 
                   COALESCE('🎯 *Assigned to:* ' || v_assigned_names || CHR(10), '') ||
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
