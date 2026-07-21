-- ============================================================
-- 000026_shopping_plan_webhook.sql
-- Creates a pg_net webhook to trigger the WhatsApp Node.js bot
-- ============================================================

-- Ensure the pg_net extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

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
    -- 1. Configuration: Set your Heroku Bot URL and API Key here
    -- You can also store these in a private settings table or Postgres config later.
    v_bot_url := 'https://your-heroku-app.herokuapp.com/api/notify';
    v_api_key := 'your_super_secret_api_key_here';

    -- 2. Fetch the name of the member who created the list (if applicable)
    SELECT name INTO v_creator_name 
    FROM public.members 
    WHERE id = NEW.created_by;

    -- 3. Find all active members in the family who have a WhatsApp number & notifications enabled
    SELECT jsonb_agg(whatsapp_number) INTO v_phone_numbers
    FROM public.members
    WHERE family_id = NEW.family_id
      AND is_active = true
      AND notifications_enabled = true
      AND whatsapp_number IS NOT NULL
      AND length(trim(whatsapp_number)) > 0;

    -- If no phone numbers are found, exit early without calling the webhook
    IF v_phone_numbers IS NULL OR jsonb_array_length(v_phone_numbers) = 0 THEN
        RETURN NEW;
    END IF;

    -- 4. Construct the notification message
    -- We include the location and the creator's name
    v_payload := jsonb_build_object(
        'numbers', v_phone_numbers,
        'message', '🛒 *New Shopping List Created!*\n\nLocation: ' || NEW.location || 
                   COALESCE('\nCreated by: ' || v_creator_name, '') || 
                   '\n\nOpen the FamFin app to see and manage the items.'
    );

    -- 5. Send the HTTP POST request via pg_net asynchronously
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

-- Create the trigger on the shopping_plans table
DROP TRIGGER IF EXISTS trigger_shopping_plan_notify ON public.shopping_plans;

CREATE TRIGGER trigger_shopping_plan_notify
AFTER INSERT ON public.shopping_plans
FOR EACH ROW
EXECUTE FUNCTION public.trigger_whatsapp_shopping_notification();
