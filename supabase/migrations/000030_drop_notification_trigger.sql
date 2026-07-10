-- ============================================================
-- 000030_drop_notification_trigger.sql
-- Removes the database trigger for WhatsApp notifications
-- because the frontend Vue app will now handle it directly.
-- ============================================================

DROP TRIGGER IF EXISTS whatsapp_shopping_notification ON public.shopping_plans;
DROP FUNCTION IF EXISTS public.trigger_whatsapp_shopping_notification();
