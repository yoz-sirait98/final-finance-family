-- ============================================================
-- 000029_exclusive_notification.sql
-- Updates webhook trigger to strictly send to either Group OR Members, not both.
-- ============================================================

CREATE OR REPLACE FUNCTION public.trigger_whatsapp_shopping_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_phone_numbers JSONB := NULL;
    v_payload JSONB;
    v_bot_url TEXT;
    v_api_key TEXT;
    v_creator_name TEXT;
    v_group_id TEXT := NULL;
    v_assigned_names TEXT := NULL;
BEGIN
    -- Configuration: Ensure these match your live Heroku details
    v_bot_url := 'https://finance-family-3ac25ba9b522.herokuapp.com/api/notify';
    v_api_key := 'YOUR_HEROKU_API_KEY_HERE'; -- UPDATE THIS LOCALLY BEFORE PUSHING

    -- Fetch Creator Name and the Family's WhatsApp Group ID
    SELECT m.name, f.whatsapp_group_id INTO v_creator_name, v_group_id
    FROM public.members m
    JOIN public.families f ON m.family_id = f.id
    WHERE m.id = NEW.created_by;

    -- EXCLUSIVE NOTIFICATION LOGIC
    -- If assigned_members is empty -> Send ONLY to Group.
    -- If assigned_members is NOT empty -> Send ONLY to Members.
    IF NEW.assigned_members IS NULL OR array_length(NEW.assigned_members, 1) IS NULL THEN
        -- Target is Group
        -- If v_group_id is also null, there is nowhere to send it, so exit.
        IF v_group_id IS NULL OR length(trim(v_group_id)) = 0 THEN
            RETURN NEW;
        END IF;
    ELSE
        -- Target is Specific Members
        -- Force v_group_id to NULL so the Heroku API skips sending to the group
        v_group_id := NULL;
        
        -- Fetch Phone Numbers AND Names of the assigned members
        SELECT 
            jsonb_agg(whatsapp_number) FILTER (WHERE notifications_enabled = true AND whatsapp_number IS NOT NULL AND length(trim(whatsapp_number)) > 0),
            string_agg(name, ', ')
        INTO v_phone_numbers, v_assigned_names
        FROM public.members
        WHERE family_id = NEW.family_id
          AND is_active = true
          AND id = ANY(NEW.assigned_members);

        -- If no valid phone numbers are found, exit early
        IF v_phone_numbers IS NULL OR jsonb_array_length(v_phone_numbers) = 0 THEN
            RETURN NEW;
        END IF;
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
