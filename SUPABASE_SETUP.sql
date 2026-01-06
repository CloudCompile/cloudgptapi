-- Create API Keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rate_limit INTEGER DEFAULT 60,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create Usage Logs table
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    model_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'chat', 'image', 'video', 'mem'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to increment usage count
CREATE OR REPLACE FUNCTION public.increment_usage_count(key_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.api_keys
    SET usage_count = usage_count + 1,
        last_used_at = timezone('utc'::text, now())
    WHERE id = key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Policies for api_keys
CREATE POLICY "Users can view their own API keys"
    ON public.api_keys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys"
    ON public.api_keys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
    ON public.api_keys FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for usage_logs
CREATE POLICY "Users can view their own usage logs"
    ON public.usage_logs FOR SELECT
    USING (auth.uid() = user_id);
