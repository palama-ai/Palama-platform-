-- Palama Co-Worker Waitlist & Access Gate Schema
-- Run once in Supabase Dashboard -> SQL Editor.
-- Enforces strict server-side email verification + admin-only approval (tamper-proof).

CREATE TABLE IF NOT EXISTS public.waitlist_access (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL DEFAULT '',
  full_name text,
  phone text NOT NULL,
  role text NOT NULL,
  role_other text,
  usage_type text NOT NULL CHECK (usage_type IN ('solo', 'team')),
  team_size text,
  use_case text,
  onboarding_completed boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at timestamptz,
  approved_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_access_status_created
  ON public.waitlist_access (status, created_at DESC);

ALTER TABLE public.waitlist_access ENABLE ROW LEVEL SECURITY;

-- Users can only inspect their own waitlist record; never other users' PII.
DROP POLICY IF EXISTS "waitlist_access_select_own" ON public.waitlist_access;
CREATE POLICY "waitlist_access_select_own"
  ON public.waitlist_access
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger: non-service callers can NEVER set or alter status / approval fields directly.
CREATE OR REPLACE FUNCTION public.enforce_waitlist_access_security()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_trusted_internal boolean;
BEGIN
  is_trusted_internal := (
    auth.role() = 'service_role'
    OR coalesce(current_setting('palama.internal_rpc', true), '') = '1'
  );

  NEW.updated_at := now();

  IF TG_OP = 'INSERT' THEN
    IF NOT is_trusted_internal THEN
      IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
      END IF;
      NEW.user_id := auth.uid();
      NEW.status := 'pending';
      NEW.approved_at := NULL;
      NEW.approved_by := NULL;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NOT is_trusted_internal THEN
      NEW.user_id := OLD.user_id;
      NEW.status := OLD.status;
      NEW.approved_at := OLD.approved_at;
      NEW.approved_by := OLD.approved_by;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_waitlist_access_security ON public.waitlist_access;
CREATE TRIGGER trg_waitlist_access_security
  BEFORE INSERT OR UPDATE ON public.waitlist_access
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_waitlist_access_security();

-- Zero-PII approval check for backend gateway / API key enforcement (callable server-side).
CREATE OR REPLACE FUNCTION public.is_waitlist_approved(p_user_id uuid)
RETURNS TABLE (
  email_confirmed boolean,
  onboarding_completed boolean,
  waitlist_status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    (u.email_confirmed_at IS NOT NULL OR u.confirmed_at IS NOT NULL) AS email_confirmed,
    coalesce(w.onboarding_completed, false) AS onboarding_completed,
    CASE
      WHEN coalesce(u.raw_app_meta_data->>'role', '') = 'admin' THEN 'approved'
      WHEN w.status IS NOT NULL THEN w.status
      WHEN coalesce(u.raw_app_meta_data->>'waitlist_status', '') IN ('approved', 'rejected', 'pending')
        THEN u.raw_app_meta_data->>'waitlist_status'
      ELSE 'pending'
    END AS waitlist_status
  FROM auth.users u
  LEFT JOIN public.waitlist_access w ON w.user_id = u.id
  WHERE u.id = p_user_id;
$$;

REVOKE ALL ON FUNCTION public.is_waitlist_approved(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_waitlist_approved(uuid) TO anon, authenticated, service_role;

-- Authenticated self-check returning full state + own profile details.
CREATE OR REPLACE FUNCTION public.get_my_waitlist_state()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN jsonb_build_object('authenticated', false)
    ELSE (
      SELECT jsonb_build_object(
        'authenticated', true,
        'user_id', u.id,
        'email', u.email,
        'email_confirmed', (u.email_confirmed_at IS NOT NULL OR u.confirmed_at IS NOT NULL),
        'onboarding_completed', coalesce(w.onboarding_completed, false),
        'status', CASE
          WHEN coalesce(u.raw_app_meta_data->>'role', '') = 'admin' THEN 'approved'
          WHEN w.status IS NOT NULL THEN w.status
          WHEN coalesce(u.raw_app_meta_data->>'waitlist_status', '') IN ('approved', 'rejected', 'pending')
            THEN u.raw_app_meta_data->>'waitlist_status'
          ELSE 'pending'
        END,
        'profile', CASE
          WHEN w.user_id IS NULL THEN NULL
          ELSE jsonb_build_object(
            'full_name', w.full_name,
            'phone', w.phone,
            'role', w.role,
            'role_other', w.role_other,
            'usage_type', w.usage_type,
            'team_size', w.team_size,
            'use_case', w.use_case,
            'approved_at', w.approved_at,
            'created_at', w.created_at
          )
        END
      )
      FROM auth.users u
      LEFT JOIN public.waitlist_access w ON w.user_id = u.id
      WHERE u.id = auth.uid()
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.get_my_waitlist_state() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_waitlist_state() TO authenticated, service_role;

-- Authenticated onboarding submission (requires verified email; preserves existing status / defaults to 'pending').
CREATE OR REPLACE FUNCTION public.submit_waitlist_onboarding(
  p_phone text,
  p_role text,
  p_role_other text DEFAULT NULL,
  p_usage_type text DEFAULT 'solo',
  p_team_size text DEFAULT NULL,
  p_use_case text DEFAULT NULL,
  p_full_name text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid uuid;
  v_email text;
  v_meta_name text;
  v_confirmed boolean;
  v_existing_status text;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  SELECT
    coalesce(u.email, ''),
    nullif(trim(coalesce(u.raw_user_meta_data->>'full_name', '')), ''),
    (u.email_confirmed_at IS NOT NULL OR u.confirmed_at IS NOT NULL)
  INTO v_email, v_meta_name, v_confirmed
  FROM auth.users u
  WHERE u.id = v_uid;

  IF NOT coalesce(v_confirmed, false) THEN
    RAISE EXCEPTION 'EMAIL_NOT_VERIFIED';
  END IF;

  IF p_usage_type NOT IN ('solo', 'team') THEN
    RAISE EXCEPTION 'INVALID_USAGE_TYPE';
  END IF;

  SELECT status INTO v_existing_status FROM public.waitlist_access WHERE user_id = v_uid;

  PERFORM set_config('palama.internal_rpc', '1', true);

  INSERT INTO public.waitlist_access (
    user_id, email, full_name, phone, role, role_other, usage_type, team_size, use_case, onboarding_completed, status
  )
  VALUES (
    v_uid,
    v_email,
    coalesce(nullif(trim(coalesce(p_full_name, '')), ''), v_meta_name),
    trim(p_phone),
    trim(p_role),
    nullif(trim(coalesce(p_role_other, '')), ''),
    p_usage_type,
    CASE WHEN p_usage_type = 'team' THEN nullif(trim(coalesce(p_team_size, '')), '') ELSE NULL END,
    nullif(trim(coalesce(p_use_case, '')), ''),
    true,
    coalesce(v_existing_status, 'pending')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = coalesce(EXCLUDED.full_name, public.waitlist_access.full_name),
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    role_other = EXCLUDED.role_other,
    usage_type = EXCLUDED.usage_type,
    team_size = EXCLUDED.team_size,
    use_case = EXCLUDED.use_case,
    onboarding_completed = true,
    status = public.waitlist_access.status,
    updated_at = now();

  RETURN public.get_my_waitlist_state();
END;
$$;

REVOKE ALL ON FUNCTION public.submit_waitlist_onboarding(text, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_waitlist_onboarding(text, text, text, text, text, text, text) TO authenticated;

-- Admin fallback RPCs (for environments where app_metadata.role='admin' is set without service_role env)
CREATE OR REPLACE FUNCTION public.admin_list_waitlist()
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  phone text,
  role text,
  role_other text,
  usage_type text,
  team_size text,
  use_case text,
  onboarding_completed boolean,
  status text,
  email_confirmed boolean,
  approved_at timestamptz,
  approved_by text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  IF auth.role() = 'service_role' THEN
    v_is_admin := true;
  ELSE
    SELECT coalesce(u.raw_app_meta_data->>'role', '') = 'admin'
    INTO v_is_admin
    FROM auth.users u
    WHERE u.id = auth.uid();
  END IF;

  IF NOT coalesce(v_is_admin, false) THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  RETURN QUERY
  SELECT
    u.id AS user_id,
    coalesce(nullif(w.email, ''), u.email, '')::text AS email,
    coalesce(w.full_name, u.raw_user_meta_data->>'full_name')::text AS full_name,
    coalesce(w.phone, '')::text AS phone,
    coalesce(w.role, '')::text AS role,
    w.role_other,
    coalesce(w.usage_type, 'solo')::text AS usage_type,
    w.team_size,
    w.use_case,
    coalesce(w.onboarding_completed, false) AS onboarding_completed,
    CASE
      WHEN coalesce(u.raw_app_meta_data->>'role', '') = 'admin' THEN 'approved'
      ELSE coalesce(w.status, 'pending')
    END AS status,
    (u.email_confirmed_at IS NOT NULL OR u.confirmed_at IS NOT NULL) AS email_confirmed,
    w.approved_at,
    w.approved_by,
    coalesce(w.created_at, u.created_at) AS created_at,
    coalesce(w.updated_at, u.updated_at, u.created_at) AS updated_at
  FROM auth.users u
  LEFT JOIN public.waitlist_access w ON w.user_id = u.id
  ORDER BY coalesce(w.created_at, u.created_at) DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_waitlist() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_waitlist() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_set_waitlist_status(
  p_target_user_id uuid,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_is_admin boolean;
  v_admin_email text;
  v_target_email text;
  v_target_name text;
BEGIN
  IF p_status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'INVALID_STATUS';
  END IF;

  IF auth.role() = 'service_role' THEN
    v_is_admin := true;
    v_admin_email := 'service_role';
  ELSE
    SELECT
      coalesce(u.raw_app_meta_data->>'role', '') = 'admin',
      u.email
    INTO v_is_admin, v_admin_email
    FROM auth.users u
    WHERE u.id = auth.uid();
  END IF;

  IF NOT coalesce(v_is_admin, false) THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  SELECT coalesce(u.email, ''), u.raw_user_meta_data->>'full_name'
  INTO v_target_email, v_target_name
  FROM auth.users u
  WHERE u.id = p_target_user_id;

  IF v_target_email IS NULL THEN
    RAISE EXCEPTION 'USER_NOT_FOUND';
  END IF;

  PERFORM set_config('palama.internal_rpc', '1', true);

  INSERT INTO public.waitlist_access (
    user_id, email, full_name, phone, role, usage_type, onboarding_completed, status, approved_at, approved_by
  )
  VALUES (
    p_target_user_id,
    v_target_email,
    v_target_name,
    '',
    'pending_onboarding',
    'solo',
    false,
    p_status,
    CASE WHEN p_status = 'approved' THEN now() ELSE NULL END,
    CASE WHEN p_status = 'approved' THEN v_admin_email ELSE NULL END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status = p_status,
    approved_at = CASE WHEN p_status = 'approved' THEN now() ELSE NULL END,
    approved_by = CASE WHEN p_status = 'approved' THEN v_admin_email ELSE NULL END,
    updated_at = now();

  -- Sync immutable app_metadata claim on auth.users as a second tamper-proof mirror
  UPDATE auth.users
  SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('waitlist_status', p_status)
  WHERE id = p_target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_waitlist_status(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_waitlist_status(uuid, text) TO authenticated, service_role;
