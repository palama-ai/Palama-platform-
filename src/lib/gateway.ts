import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { validateApiKey, logApiUsage } from '@/lib/api-keys'
import { getQuota, recordTokenUsage, extractGatewayUsage, isRealUser, TOKEN_QUOTA_LIMIT } from '@/lib/token-usage'

export type GatewayCaller =
  | { kind: 'session'; userId: string }
  | { kind: 'api-key'; userId: string }
  | { kind: 'engine'; ownerId: string }
  | null;

/**
 * Resolve who is calling a gateway-proxy route:
 * 1. Supabase session (platform users),
 * 2. sk-palama-... API key (developers / desktop API-key mode),
 * 3. INTERNAL_API_KEY + X-Palama-Owner (desktop engine forwarding its task owner).
 */
export async function resolveGatewayCaller(request: Request): Promise<GatewayCaller> {
  const supabase = await createClient().catch(() => null)
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) return { kind: 'session', userId: user.id }
    } catch {}
  }

  const bearer = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()
  if (bearer) {
    const internalKey = (process.env.INTERNAL_API_KEY || '').trim()
    if (internalKey && bearer === internalKey) {
      const owner = (request.headers.get('x-palama-owner') || '').trim().slice(0, 128)
      if (owner) return { kind: 'engine', ownerId: owner }
      return null
    }
    const owner = await validateApiKey(bearer)
    if (owner) return { kind: 'api-key', userId: owner.userId }
    return null
  }
  return null
}

function gatewayConfig() {
  const base = (process.env.PALAMA_GATEWAY_URL || '').replace(/\/+$/, '')
  const key = (process.env.PALAMA_GATEWAY_API_KEY || '').trim()
  return { base, key }
}

/**
 * Verified owner id for a caller, or null when anonymous.
 * Engine (desktop) callers MUST present an `sb:<uid>` owner (a validated
 * Supabase login) — raw/internal callers without login are rejected so that
 * anonymous users can never consume quota or mint fresh identities.
 * Session and api-key callers are inherently authenticated.
 */
export function resolveOwnerId(caller: Exclude<GatewayCaller, null>): string | null {
  if (caller.kind === 'engine') {
    return caller.ownerId.startsWith('sb:')
      ? caller.ownerId.replace(/^sb:/, '') // console reads rows by raw uid
      : null
  }
  return caller.userId
}

/**
 * Forward a request to the upstream model gateway with the server-side key.
 * Returns a passthrough Response (status + body preserved).
 */
export async function forwardToGateway(
  path: string,
  init: { method?: string; body?: string; caller: Exclude<GatewayCaller, null> }
): Promise<Response> {
  const { base, key } = gatewayConfig()
  if (!base || !key) {
    return NextResponse.json(
      { error: 'Model gateway is not configured on the platform.' },
      { status: 503 }
    )
  }
  const ownerId = resolveOwnerId(init.caller)
  if (!ownerId) {
    return NextResponse.json(
      { error: 'Login required: please sign in to use Palama models.' },
      { status: 401 }
    )
  }
  // Engine callers present their own owner string: verify it is a REAL login.
  // (The internal key ships inside the desktop app, so prefix checks alone
  // would allow minting fresh sb:<random-uuid> identities with new quotas.)
  // Unverifiable (DB down) also fails closed — the quota check below would
  // block anyway, but reject early with a clear 401.
  if (init.caller.kind === 'engine') {
    try {
      const real = await isRealUser(ownerId)
      if (real !== true) {
        return NextResponse.json(
          { error: 'Login required: account could not be verified. If you just signed in, ask the admin to run TOKEN_USAGE_SQL.sql (user_exists) on Supabase and to match INTERNAL_API_KEY with the desktop app.' },
          { status: 401 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Login required: account could not be verified. If you just signed in, ask the admin to run TOKEN_USAGE_SQL.sql (user_exists) on Supabase and to match INTERNAL_API_KEY with the desktop app.' },
        { status: 401 }
      )
    }
  }
  let loggedModel = ''
  try {
    const parsed = init.body ? JSON.parse(init.body) : null
    if (parsed && typeof parsed.model === 'string') loggedModel = parsed.model.slice(0, 120)
  } catch {}
  await logApiUsage(ownerId, `gateway:${path}`, loggedModel)
  // ── Weekly token quota (server-side, tamper-proof) ──
  // Every model call flows through here, so this gate cannot be bypassed by
  // touching desktop-local files. Fail closed when usage is unverifiable.
  if (init.method !== 'GET') {
    try {
      const quota = await getQuota(ownerId)
      if (quota.is_exceeded) {
        const why = quota.unknown
          ? 'Token usage could not be verified right now. Reconnect and try again.'
          : `Token usage limit reached for this week: ${(quota.used_tokens ?? 0).toLocaleString()} / ${TOKEN_QUOTA_LIMIT.toLocaleString()} tokens (100%). Resets ${quota.resets_at}.`
        return NextResponse.json({ error: why, quota }, { status: 429 })
      }
    } catch (e: any) {
      return NextResponse.json(
        { error: 'Token usage could not be verified right now. Reconnect and try again.' },
        { status: 429 }
      )
    }
  }
  const upstream = await fetch(`${base}${path}`, {
    method: init.method || 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: init.body,
  })
  const text = await upstream.text()
  // ── Record exact (or estimated) token usage for this completion ──
  if (upstream.ok) {
    try {
      const used = extractGatewayUsage(
        text,
        upstream.headers.get('content-type') || '',
        init.body || ''
      )
      if (used.prompt > 0 || used.completion > 0) {
        await recordTokenUsage(ownerId, { model: loggedModel, ...used })
      }
    } catch {}
  }
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' },
  })
}
