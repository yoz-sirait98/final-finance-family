-- ============================================================
-- 000031_system_settings.sql
-- Secure storage for global configuration (like API Keys)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Protect it with RLS (only authenticated users can read, only service_role / admins can modify via dashboard)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON public.system_settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Insert default placeholders (you will update the API key manually in the Dashboard)
INSERT INTO public.system_settings (key, value, description)
VALUES 
    ('bot_url', 'https://finance-family-3ac25ba9b522.herokuapp.com/api/notify', 'The URL of the Heroku WhatsApp Bot'),
    ('bot_api_key', 'PLACEHOLDER_KEY', 'The secret VITE_WA_API_KEY for the bot')
ON CONFLICT (key) DO NOTHING;
