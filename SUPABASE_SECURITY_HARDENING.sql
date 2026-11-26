-- Palama Platform Security Hardening SQL
-- Run this script once in the Supabase SQL Editor (Project -> SQL Editor -> New query).
-- Prerequisite: Ensure SUPABASE_SERVICE_ROLE_KEY is configured in Vercel / Next.js server environment.

-- 1. Lock down public.platform_config (public read-only, writes restricted to service_role)
DO $$
BEGIN
  IF to_regclass('public.platform_config') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public read of platform_config" ON public.platform_config';
    EXECUTE $p$
      CREATE POLICY "Allow public read of platform_config"
        ON public.platform_config
        FOR SELECT
        TO anon, authenticated
        USING (true)
    $p$;
    EXECUTE 'REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.platform_config FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT SELECT ON public.platform_config TO anon, authenticated';
  END IF;
END $$;

-- 2. Lock down api_keys, api_usage, machines, token_usage, waitlist, and training_events RLS
-- Casting both sides with ::text handles both uuid and text user_id columns safely (avoids ERROR 42883).
DO $$
BEGIN
  IF to_regclass('public.api_keys') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Users read own api_keys" ON public.api_keys';
    EXECUTE 'DROP POLICY IF EXISTS "Users manage own api_keys" ON public.api_keys';
    EXECUTE $p$
      CREATE POLICY "Users read own api_keys"
        ON public.api_keys FOR SELECT TO authenticated
        USING (auth.uid()::text = user_id::text)
    $p$;
    EXECUTE $p$
      CREATE POLICY "Users manage own api_keys"
        ON public.api_keys FOR ALL TO authenticated
        USING (auth.uid()::text = user_id::text)
        WITH CHECK (auth.uid()::text = user_id::text)
    $p$;
  END IF;

  IF to_regclass('public.machines') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Users manage own machines" ON public.machines';
    EXECUTE $p$
      CREATE POLICY "Users manage own machines"
        ON public.machines FOR ALL TO authenticated
        USING (auth.uid()::text = user_id::text)
        WITH CHECK (auth.uid()::text = user_id::text)
    $p$;
  END IF;

  IF to_regclass('public.token_usage') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Users read own token_usage" ON public.token_usage';
    EXECUTE 'DROP POLICY IF EXISTS "token_usage_select_own" ON public.token_usage';
    EXECUTE $p$
      CREATE POLICY "Users read own token_usage"
        ON public.token_usage FOR SELECT TO authenticated
        USING (auth.uid()::text = user_id::text)
    $p$;
    EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON public.token_usage FROM PUBLIC, anon, authenticated';
  END IF;

  IF to_regclass('public.api_usage') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Users read own api_usage" ON public.api_usage';
    EXECUTE 'DROP POLICY IF EXISTS "api_usage_select_own" ON public.api_usage';
    EXECUTE 'DROP POLICY IF EXISTS "api_usage_insert_own" ON public.api_usage';
    EXECUTE $p$
      CREATE POLICY "Users read own api_usage"
        ON public.api_usage FOR SELECT TO authenticated
        USING (auth.uid()::text = user_id::text)
    $p$;
    EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON public.api_usage FROM PUBLIC, anon, authenticated';
  END IF;

  IF to_regclass('public.training_events') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.training_events ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE ALL ON public.training_events FROM PUBLIC, anon, authenticated';
  END IF;

  IF to_regclass('public.waitlist') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "waitlist_select_own" ON public.waitlist';
    EXECUTE $p$
      CREATE POLICY "waitlist_select_own"
        ON public.waitlist FOR SELECT TO authenticated
        USING (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
    $p$;
  END IF;
END $$;

-- 3. Restrict privileged ledger/dataset/enumeration SECURITY DEFINER RPCs exclusively to service_role
-- (Keep validate_api_key callable by hash for desktop sk-palama-... validation.)
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
        'user_exists'
      )
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated;', fn_sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role;', fn_sig);
  END LOOP;
END $$;
