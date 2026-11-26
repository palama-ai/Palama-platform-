import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getConfiguredInternalKey } from '@/lib/security'

/**
 * GET /api/account/export — download the signed-in user's data:
 * Supabase profile + agent task history from the Palama agent engine.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { session } } = await supabase.auth.getSession()

    // Agent task history (validates the user's JWT on the engine side)
    let agentData: any = { tasks: [], facts: [] }
    try {
      const agentUrl = (process.env.PALAMA_AGENT_URL || 'http://127.0.0.1:8391').replace(/\/+$/, '')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const internalKey = getConfiguredInternalKey()
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      } else if (internalKey) {
        headers['Authorization'] = `Bearer ${internalKey}`
        headers['X-Palama-Owner'] = `sb:${user.id}`
      }
      if (headers['Authorization']) {
        const res = await fetch(`${agentUrl}/api/v1/agent/memory/export`, { headers, cache: 'no-store' })
        if (res.ok) agentData = await res.json()
      }
    } catch (e) {
      console.warn('Agent export unavailable:', e)
    }

    return NextResponse.json({
      exported_at: new Date().toISOString(),
      profile: {
        id: user.id,
        email: user.email,
        full_name: (user.user_metadata as any)?.full_name || null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      },
      agent: agentData,
    })
  } catch (error: any) {
    console.error('Account export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
