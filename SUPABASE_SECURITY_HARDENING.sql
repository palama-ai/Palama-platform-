-- Palama Platform Security Hardening SQL
-- Run this script once in the Supabase SQL Editor (Project -> SQL Editor -> New query).
-- Prerequisite: Ensure SUPABASE_SERVICE_ROLE_KEY is configured in Vercel / Next.js server environment.

-- 1. Lock down public.platform_config (public read-only, writes restricted to service_role)
ALTER TABLE IF EXISTS public.platform_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read of platform_config" ON public.platform_config;
CREATE POLICY "Allow public read of platform_config"
  ON public.platform_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.platform_config FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.platform_config TO anon, authenticated;

-- 2. Lock down api_keys, api_usage, machines, and token_usage RLS to owner only
ALTER TABLE IF EXISTS public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.training_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own api_keys" ON public.api_keys;
CREATE POLICY "Users read own api_keys"
  ON public.api_keys FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own api_keys" ON public.api_keys;
CREATE POLICY "Users manage own api_keys"
  ON public.api_keys FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own machines" ON public.machines;
CREATE POLICY "Users manage own machines"
  ON public.machines FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own token_usage" ON public.token_usage;
CREATE POLICY "Users read own token_usage"
  ON public.token_usage FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own api_usage" ON public.api_usage;
CREATE POLICY "Users read own api_usage"
  ON public.api_usage FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Prevent direct tampering by anon/authenticated into ledger/training tables (only service_role writes via API)
REVOKE INSERT, UPDATE, DELETE ON public.token_usage FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.api_usage FROM anon, authenticated;
REVOKE ALL ON public.training_events FROM anon, authenticated;

-- 3. Restrict privileged SECURITY DEFINER RPC functions exclusively to service_role
DO $$
DECLARE
  fn_sig text;
BEGIN
  FOR fn_sig IN
    SELECT p.oid::regprocedure::text
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'record_token_usage',
        'weekly_token_usage',
        'has_token_migration',
        'ingest_training_event',
        'log_api_usage',
        'user_exists',
        'validate_api_key'
      )
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated;', fn_sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role;', fn_sig);
  END LOOP;
END $$;
