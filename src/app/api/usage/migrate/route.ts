import { NextResponse } from 'next/server'
import { resolveGatewayCaller, resolveOwnerId } from '@/lib/gateway'
import { getQuota, recordTokenUsage, hasTokenMigration, isRealUser } from '@/lib/token-usage'

const MAX_MIGRATION_TOKENS = 50_000_000

/**
 * POST /api/usage/migrate — one-time import of a desktop-local token total.
 * Body: { "total_tokens": number }. Accepted once per user; afterwards the
 * server ledger is authoritative and local files are ignored for quota.
 * Auth: Supabase session, sk-palama-... key, or engine with sb:<uid> owner.
 */
export async function POST(request: Request) {
  const caller = await resolveGatewayCaller(request)
  const userId = caller ? resolveOwnerId(caller) : null
  if (!caller || !userId) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 })
  }
  if (caller.kind === 'engine') {
    const real = await isRealUser(userId)
    if (real !== true) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 })
    }
  }
  let total = 0
  try {
    const body = await request.json()
    const raw = Number(body?.total_tokens)
    total = Number.isFinite(raw) ? Math.min(MAX_MIGRATION_TOKENS, Math.max(0, Math.floor(raw))) : 0
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (await hasTokenMigration(userId)) {
    return NextResponse.json({ migrated: false, reason: 'already-migrated', quota: await getQuota(userId) })
  }
  if (total > 0) {
    // Stored as prompt tokens so prompt+completion (=total) stays exact.
    await recordTokenUsage(userId, { model: 'migration', prompt: total, completion: 0 })
  }
  return NextResponse.json({ migrated: true, quota: await getQuota(userId) })
}
