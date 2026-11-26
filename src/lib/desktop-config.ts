import { createClient } from '@/utils/supabase/server'

export const DEFAULT_WEEKLY_TOKEN_QUOTA = 2_000_000

export type DesktopServerConfig = {
  weekly_token_quota: number
  min_supported_version: string
  blocked_versions: string[]
  force_update_message: string
  models: Array<string | Record<string, any>> | null
}

let cachedConfig: { at: number; value: DesktopServerConfig } | null = null
const CONFIG_TTL_MS = 45 * 1000

function parsePositiveInt(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  const num = Number(String(raw).replace(/[_, ]/g, ''))
  if (!Number.isFinite(num) || num <= 0) return null
  return Math.floor(num)
}

function parseVersionList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v ?? '').trim()).filter(Boolean)
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return []
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          return parsed.map((v) => String(v ?? '').trim()).filter(Boolean)
        }
      } catch {}
    }
    return trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

function parseModelsList(raw: unknown): Array<string | Record<string, any>> | null {
  if (!raw) return null
  if (Array.isArray(raw)) return raw.length > 0 ? raw : null
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return null
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch {}
    }
    const items = trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    return items.length > 0 ? items : null
  }
  return null
}

async function createOptionalAdminClient(): Promise<any | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) return null
    const { createClient: createAdmin } = await import('@supabase/supabase-js')
    return createAdmin(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  } catch {
    return null
  }
}

async function readSupabasePlatformConfig(): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {}
  try {
    const client = (await createOptionalAdminClient()) || (await createClient().catch(() => null))
    if (!client) return out
    const { data, error } = await client.from('platform_config').select('key, value')
    if (!error && Array.isArray(data)) {
      for (const row of data) {
        if (row && typeof row.key === 'string') {
          out[row.key] = row.value
        }
      }
    }
  } catch {
    // Table optional; fall back silently to env vars / defaults
  }
  return out
}

export async function getDesktopServerConfig(force = false): Promise<DesktopServerConfig> {
  if (!force && cachedConfig && Date.now() - cachedConfig.at < CONFIG_TTL_MS) {
    return cachedConfig.value
  }

  const db = await readSupabasePlatformConfig()

  const quotaFromDb = parsePositiveInt(db.weekly_token_quota)
  const quotaFromEnv =
    parsePositiveInt(process.env.WEEKLY_TOKEN_QUOTA) ??
    parsePositiveInt(process.env.TOKEN_QUOTA_LIMIT)
  const weekly_token_quota = quotaFromDb ?? quotaFromEnv ?? DEFAULT_WEEKLY_TOKEN_QUOTA

  const min_supported_version = String(
    db.min_supported_version ?? process.env.MIN_SUPPORTED_VERSION ?? ''
  ).trim()

  const dbBlocked = parseVersionList(db.blocked_versions)
  const envBlocked = parseVersionList(process.env.BLOCKED_VERSIONS)
  const blocked_versions = dbBlocked.length > 0 ? dbBlocked : envBlocked

  const force_update_message = String(
    db.force_update_message ?? process.env.FORCE_UPDATE_MESSAGE ?? ''
  ).trim()

  const models =
    parseModelsList(db.models) ??
    parseModelsList(process.env.DESKTOP_MODELS) ??
    parseModelsList(process.env.EXTRA_MODELS)

  const value: DesktopServerConfig = {
    weekly_token_quota,
    min_supported_version,
    blocked_versions,
    force_update_message,
    models,
  }
  cachedConfig = { at: Date.now(), value }
  return value
}

export async function getEffectiveWeeklyQuotaLimit(): Promise<number> {
  const cfg = await getDesktopServerConfig()
  return cfg.weekly_token_quota || DEFAULT_WEEKLY_TOKEN_QUOTA
}
