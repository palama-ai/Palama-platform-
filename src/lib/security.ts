import crypto from 'node:crypto'

const WEAK_PLACEHOLDER_KEYS = new Set([
  'palama-desktop-local',
  'your_super_secret_key_here_for_palama_cloud',
  'change-me',
])

export function timingSafeEqualStr(a: string, b: string): boolean {
  const h1 = crypto.createHash('sha256').update(a).digest()
  const h2 = crypto.createHash('sha256').update(b).digest()
  return crypto.timingSafeEqual(h1, h2)
}

export function getConfiguredInternalKey(): string | null {
  const key = (process.env.INTERNAL_API_KEY || '').trim()
  if (!key || key.length < 16 || WEAK_PLACEHOLDER_KEYS.has(key.toLowerCase())) {
    return null
  }
  return key
}

export function verifyInternalKey(supplied: string): boolean {
  const expected = getConfiguredInternalKey()
  if (!expected || !supplied) return false
  return timingSafeEqualStr(supplied.trim(), expected)
}

export function isAdminUser(user: { email?: string | null; app_metadata?: Record<string, any> } | null | undefined): boolean {
  if (!user) return false
  if (user.app_metadata?.role === 'admin') return true
  const rawList = (process.env.ADMIN_EMAILS || '').trim()
  if (!rawList || !user.email) return false
  const allowed = rawList
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return allowed.includes(user.email.toLowerCase())
}

export function isUuid(val: unknown): val is string {
  return typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim())
}

export function isSafeTaskId(val: unknown): val is string {
  return typeof val === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(val.trim())
}

export function isSafeNextPath(nextParam: string | null | undefined): string {
  const raw = String(nextParam || '').trim()
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\') || raw.includes('@')) {
    return '/dashboard'
  }
  try {
    const parsed = new URL(raw, 'https://palama.local')
    if (parsed.origin !== 'https://palama.local') return '/dashboard'
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return '/dashboard'
  }
}

export function isAllowedOAuthRedirectUri(rawUri: string): boolean {
  const raw = String(rawUri || '').trim()
  if (!raw || raw.length > 512) return false
  try {
    const u = new URL(raw)
    if (u.protocol === 'palama:') return u.hostname === 'auth' || u.hostname === 'oauth' || u.hostname === 'callback'
    if (u.protocol === 'http:') {
      return u.hostname === '127.0.0.1' || u.hostname === 'localhost'
    }
    if (u.protocol === 'https:') {
      const origin = (process.env.NEXT_PUBLIC_APP_URL || '').trim()
      if (origin && u.origin === new URL(origin).origin) return true
    }
    return false
  } catch {
    return false
  }
}

export function assertSafeTrustedBaseUrl(rawUrl: string): string {
  const parsed = new URL(rawUrl.trim())
  const isDev = process.env.NODE_ENV !== 'production'
  if (parsed.protocol !== 'https:' && !(isDev && parsed.protocol === 'http:' && (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost'))) {
    throw new Error('Disallowed URL scheme')
  }
  return parsed.toString().replace(/\/+$/, '')
}

/* ---- Lightweight per-worker fixed-window rate limiter ---- */
type Bucket = { count: number; resetAt: number }
const g = globalThis as unknown as { __palamaPlatRate?: Map<string, Bucket> }
const buckets = (g.__palamaPlatRate ??= new Map<string, Bucket>())

export function clientIdentifier(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim().slice(0, 64)
  return req.headers.get('x-real-ip')?.trim().slice(0, 64) || 'unknown'
}

export function checkRateLimit(bucketKey: string, limit: number, windowMs: number): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  if (buckets.size > 5000) {
    for (const [k, v] of buckets.entries()) {
      if (v.resetAt <= now) buckets.delete(k)
    }
  }
  const existing = buckets.get(bucketKey)
  if (!existing || existing.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSec: Math.ceil(windowMs / 1000) }
  }
  existing.count += 1
  if (existing.count > limit) {
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) }
  }
  return { allowed: true, retryAfterSec: Math.ceil((existing.resetAt - now) / 1000) }
}
