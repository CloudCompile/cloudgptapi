-- Create API Keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    rate_limit INTEGER DEFAULT 10,
    usage_count INTEGER DEFAULT 0,
    daily_usage_count INTEGER DEFAULT 0,
    last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create Usage Logs table
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    model_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'chat', 'image', 'video', 'mem'
    tokens INTEGER, -- Estimated token usage
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for usage logs performance
CREATE INDEX IF NOT EXISTS idx_usage_logs_api_key_id ON public.usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON public.api_keys(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON public.rate_limits(reset_at);

-- Create Profiles table to track user plans and roles
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY, -- Matches clerk user id
    email TEXT,
    role TEXT DEFAULT 'user', -- 'user', 'admin'
    plan TEXT DEFAULT 'free', -- 'free', 'pro', 'enterprise'
    stripe_product_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Subscriptions tracking table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    stripe_price_id TEXT NOT NULL,
    stripe_current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy for user_subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view their own subscriptions"
    ON public.user_subscriptions FOR SELECT
    USING (true); -- Authenticated via Clerk in API

-- Function to handle user role and plan updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (true); -- Authenticated via Clerk in API

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
    ON public.profiles FOR ALL
    USING (true); -- Authenticated via Clerk in API

-- Function to increment usage count and daily usage
CREATE OR REPLACE FUNCTION public.increment_usage_count(key_id UUID, p_weight INTEGER DEFAULT 1)
RETURNS void AS $$
DECLARE
    v_now TIMESTAMP WITH TIME ZONE := timezone('utc'::text, now());
BEGIN
    UPDATE public.api_keys
    SET usage_count = usage_count + p_weight,
        daily_usage_count = CASE 
            WHEN date_trunc('day', last_reset_at) < date_trunc('day', v_now) THEN p_weight
            ELSE daily_usage_count + p_weight
        END,
        last_reset_at = CASE
            WHEN date_trunc('day', last_reset_at) < date_trunc('day', v_now) THEN v_now
            ELSE last_reset_at
        END,
        last_used_at = v_now
    WHERE id = key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Create Rate Limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER DEFAULT 0,
    reset_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to check and increment rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_key TEXT,
    p_limit INTEGER,
    p_window_ms INTEGER
)
RETURNS JSON AS $$
DECLARE
    v_count INTEGER;
    v_reset_at TIMESTAMP WITH TIME ZONE;
    v_now TIMESTAMP WITH TIME ZONE := timezone('utc'::text, now());
BEGIN
    -- Get current rate limit data
    SELECT count, reset_at INTO v_count, v_reset_at
    FROM public.rate_limits
    WHERE key = p_key;

    -- If no record exists or it's expired, reset
    IF v_count IS NULL OR v_now > v_reset_at THEN
        v_count := 1;
        v_reset_at := v_now + (p_window_ms || ' milliseconds')::INTERVAL;
        
        INSERT INTO public.rate_limits (key, count, reset_at, updated_at)
        VALUES (p_key, v_count, v_reset_at, v_now)
        ON CONFLICT (key) DO UPDATE
        SET count = EXCLUDED.count,
            reset_at = EXCLUDED.reset_at,
            updated_at = EXCLUDED.updated_at;
            
        RETURN json_build_object(
            'allowed', true,
            'remaining', p_limit - v_count,
            'reset_at', floor(extract(epoch from v_reset_at) * 1000)
        );
    END IF;

    -- Check if limit exceeded
    IF v_count >= p_limit THEN
        RETURN json_build_object(
            'allowed', false,
            'remaining', 0,
            'reset_at', floor(extract(epoch from v_reset_at) * 1000)
        );
    END IF;

    -- Increment count
    UPDATE public.rate_limits
    SET count = count + 1,
        updated_at = v_now
    WHERE key = p_key
    RETURNING count INTO v_count;

    RETURN json_build_object(
        'allowed', true,
        'remaining', p_limit - v_count,
        'reset_at', floor(extract(epoch from v_reset_at) * 1000)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for api_keys
DROP POLICY IF EXISTS "Public access to API keys" ON public.api_keys;
CREATE POLICY "Public access to API keys"
    ON public.api_keys FOR ALL
    USING (true)
    WITH CHECK (true); -- Authenticated via Clerk in API

-- Policies for usage_logs
DROP POLICY IF EXISTS "Public access to usage logs" ON public.usage_logs;
CREATE POLICY "Public access to usage logs"
    ON public.usage_logs FOR ALL
    USING (true)
    WITH CHECK (true); -- Authenticated via Clerk in API

-- Function to check daily limit
CREATE OR REPLACE FUNCTION public.check_daily_limit(
    p_key_id UUID,
    p_daily_limit INTEGER
)
RETURNS JSON AS $$
DECLARE
    v_daily_usage INTEGER;
    v_last_reset TIMESTAMP WITH TIME ZONE;
    v_now TIMESTAMP WITH TIME ZONE := timezone('utc'::text, now());
BEGIN
    SELECT daily_usage_count, last_reset_at INTO v_daily_usage, v_last_reset
    FROM public.api_keys
    WHERE id = p_key_id;

    -- If no record exists, return true (shouldn't happen if key is valid)
    IF v_daily_usage IS NULL THEN
        RETURN json_build_object('allowed', true, 'usage', 0);
    END IF;

    -- Reset daily usage if it's a new day
    IF date_trunc('day', v_last_reset) < date_trunc('day', v_now) THEN
        RETURN json_build_object('allowed', true, 'usage', 0);
    END IF;

    RETURN json_build_object(
        'allowed', v_daily_usage < p_daily_limit,
        'usage', v_daily_usage
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup function for expired rate limits
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM public.rate_limits
    WHERE reset_at < timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
