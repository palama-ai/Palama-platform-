import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { validateApiKey } from '@/lib/api-keys'
import { resolveGatewayCaller, resolveOwnerId } from '@/lib/gateway'
import { getAdminClient, isRealUser } from '@/lib/token-usage'

const ALLOWED_KINDS = new Set(['task', 'thinking', 'action', 'complete', 'error'])
const MAX_TEXT = 6000
const MAX_EVENTS = 120
const MAX_SCREENSHOTS = 15
const MAX_SCREENSHOT_CHARS = 500 * 1024

function cleanText(v: unknown): string {
  if (typeof v !== 'string') {
    try {
      v = String(v ?? '')
    } catch {
      return ''
    }
  }
  let s = (v as string).trim().replace(/\r\n/g, '\n')
  if (s.length > MAX_TEXT) s = s.slice(0, MAX_TEXT) + '…[truncated]'
  return s
}

function cleanEvent(ev: any): Record<string, unknown> | null {
  if (!ev || typeof ev !== 'object') return null
  const kind = String(ev.type || '')
  if (!ALLOWED_KINDS.has(kind)) return null
  const data = (ev.data && typeof ev.data === 'object' ? ev.data : {}) as Record<string, unknown>
  const out: Record<string, unknown> = {
    type: kind,
    agent: String(ev.agent || '').slice(0, 60),
  }
  for (const k of ['reasoning', 'message', 'summary', 'error', 'tool', 'action']) {
    const t = cleanText(data[k])
    if (t) out[k] = t
  }
  if (data.params && typeof data.params === 'object') {
    const slim: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(data.params as Record<string, unknown>).slice(0, 12)) {
      if (['string', 'number', 'boolean'].includes(typeof v) && String(v).length < 500) {
        slim[String(k).slice(0, 40)] = v
      }
    }
    if (Object.keys(slim).length > 0) out.params = slim
  }
  return out
}

function cleanScreenshot(s: any): { step_file: string; jpg_b64: string } | null {
  if (!s || typeof s !== 'object') return null
  const b64 = String(s.jpg_b64 || '')
  // Accept raw base64 (optionally data-URI prefixed)
  const clean = b64.replace(/^data:image\/[a-z]+;base64,/, '')
  if (!/^[A-Za-z0-9+/=]+$/.test(clean)) return null
  if (clean.length === 0 || clean.length > MAX_SCREENSHOT_CHARS) return null
  return { step_file: String(s.step_file || '').slice(0, 80), jpg_b64: clean }
}

/**
 * POST /api/dataset/ingest — training-data intake from the desktop engine.
 * Auth: session | sk-palama-... | INTERNAL_API_KEY + X-Palama-Owner.
 * Cleans + organizes everything before storage so reviewers get
 * training-ready records (never raw dumps).
 */
export async function POST(request: Request) {
  // ── Auth (session, API key, JWT bearer, or verified engine + owner) ──
  const caller = await resolveGatewayCaller(request)
  const ownerId = caller ? resolveOwnerId(caller) : null
  if (!caller || !ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (caller.kind === 'engine') {
    const real = await isRealUser(ownerId)
    if (real !== true) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // ── Parse + clean ──
  let body: any = null
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const taskId = String(body.task_id || '').slice(0, 128)
  if (!taskId) {
    return NextResponse.json({ error: 'task_id required' }, { status: 400 })
  }

  const events: Record<string, unknown>[] = []
  if (Array.isArray(body.events)) {
    for (const ev of body.events.slice(0, MAX_EVENTS)) {
      const c = cleanEvent(ev)
      if (c) events.push(c)
    }
  }

  let screenshots: { step_file: string; jpg_b64: string }[] = []
  if (body.storage !== 'local' && Array.isArray(body.screenshots)) {
    for (const s of body.screenshots.slice(0, MAX_SCREENSHOTS)) {
      const c = cleanScreenshot(s)
      if (c) screenshots.push(c)
    }
  }

  const tokens = body.tokens && typeof body.tokens === 'object' ? {
    prompt_tokens: Math.max(0, Number(body.tokens.prompt_tokens) || 0),
    completion_tokens: Math.max(0, Number(body.tokens.completion_tokens) || 0),
    calls: Math.max(0, Number(body.tokens.calls) || 0),
  } : { prompt_tokens: 0, completion_tokens: 0, calls: 0 }

  const payload = {
    status: String(body.status || '').slice(0, 32),
    model: String(body.model || '').slice(0, 120),
    prompt: cleanText(body.prompt),
    result: cleanText(body.result),
    steps: Math.max(0, Number(body.steps) || 0),
    duration_s: Number(body.duration_s) || null,
    tokens,
    storage: body.storage === 'local' ? 'local' : 'cloud',
    app: 'palama-coworker',
    received_at: new Date().toISOString(),
    events,
    screenshots,
  }

  // ── Store via service_role admin client first; fallback to SECURITY DEFINER RPC ──
  try {
    const admin = await getAdminClient()
    if (admin) {
      const { data, error } = await admin.rpc('ingest_training_event', {
        p_owner: ownerId,
        p_task_id: taskId,
        p_kind: 'task',
        p_consent: body.consent_training !== false,
        p_payload: payload,
      })
      if (!error) return NextResponse.json({ success: true, id: data })
    }
    const { createClient: createAnon } = await import('@supabase/supabase-js')
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anon =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    const client = createAnon(url, anon, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data, error } = await client.rpc('ingest_training_event', {
      p_owner: ownerId,
      p_task_id: taskId,
      p_kind: 'task',
      p_consent: body.consent_training !== false,
      p_payload: payload,
    })
    if (error) throw error
    return NextResponse.json({ success: true, id: data })
  } catch (e: any) {
    console.warn('[dataset] ingest failed:', e?.message || e)
    return NextResponse.json({ error: 'Storage unavailable. Run TRAINING_DATA_SQL.sql in Supabase.' }, { status: 503 })
  }
}
