import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { validateApiKey } from '@/lib/api-keys'
import { getWaitlistStateByOwnerId, getWaitlistStateForUser } from '@/lib/waitlist'

export const dynamic = 'force-dynamic'

function noStoreJson(payload: any, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}

/**
 * GET /api/waitlist/status
 * Authoritative status check for Web Dashboard, /auth/desktop, and Palama Desktop.
 * Supports cookie sessions, Authorization: Bearer <supabase_jwt>, and Authorization: Bearer sk-palama-...
 */
export async function GET(request: Request) {
  const supabase = await createClient().catch(() => null)
  const bearer = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()

  if (supabase) {
    // 1. Explicit Supabase JWT bearer first when supplied (Desktop uses this!)
    if (bearer && !bearer.startsWith('sk-palama-') && bearer.split('.').length === 3) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(bearer)
        if (!error && user) {
          const state = await getWaitlistStateForUser(user, supabase)
          return noStoreJson(state)
        }
      } catch {}
      return noStoreJson({ authenticated: false, error: 'Invalid or expired session' }, 401)
    }

    // 2. Cookie session
    if (!bearer) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (!error && user) {
          const state = await getWaitlistStateForUser(user, supabase)
          return noStoreJson(state)
        }
      } catch {}
    }
  }

  // 3. Developer / Co-Worker API key (sk-palama-...)
  if (bearer && bearer.startsWith('sk-palama-')) {
    const owner = await validateApiKey(bearer)
    if (!owner) {
      return noStoreJson({ authenticated: false, error: 'Invalid API key' }, 401)
    }
    const state = await getWaitlistStateByOwnerId(owner.userId)
    return noStoreJson(state)
  }

  return noStoreJson({ authenticated: false, error: 'Unauthorized' }, 401)
}
