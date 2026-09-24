import { NextResponse } from 'next/server'
import { resolveGatewayCaller, resolveOwnerId, forwardToGateway } from '@/lib/gateway'
import { getQuota } from '@/lib/token-usage'

/**
 * POST /api/images/generations — image generation via Palama.
 *
 * Auth: Supabase session, sk-palama-... key, or engine (INTERNAL + owner).
 * Routing:
 * - agnes-image-* models → Agnes apihub DIRECTLY (requires Vercel env
 *   AGNES_IMAGE_API_KEY). Weekly token quota still gates the call.
 * - everything else → default model gateway (unchanged behavior).
 */
export const dynamic = 'force-dynamic'

const APIHUB_URL = 'https://apihub.agnes-ai.com/v1/images/generations'

export async function POST(request: Request) {
  const caller = await resolveGatewayCaller(request)
  const userId = caller ? resolveOwnerId(caller) : null
  if (!caller || !userId) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 })
  }
  const verifiedCaller = caller
  let body = ''
  try {
    body = JSON.stringify(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  let model = ''
  try {
    const parsed = JSON.parse(body)
    if (parsed && typeof parsed.model === 'string') model = parsed.model
  } catch {}

  const imageKey = (process.env.AGNES_IMAGE_API_KEY || '').trim()
  if (model.startsWith('agnes-image-') && imageKey) {
    // Weekly quota gates image calls too (free model, fair use).
    try {
      const quota = await getQuota(userId)
      if (quota.is_exceeded) {
        return NextResponse.json(
          { error: 'Token usage limit reached for this week (100%).' },
          { status: 429 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Token usage could not be verified right now. Reconnect and try again.' },
        { status: 429 }
      )
    }
    try {
      const upstream = await fetch(APIHUB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${imageKey}` },
        body,
      })
      const text = await upstream.text()
      return new NextResponse(text, {
        status: upstream.status,
        headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' },
      })
    } catch (e: any) {
      return NextResponse.json(
        { error: `Image gateway unreachable: ${e?.message || e}` },
        { status: 502 }
      )
    }
  }

  return forwardToGateway('/images/generations', { method: 'POST', body, caller: verifiedCaller })
}
