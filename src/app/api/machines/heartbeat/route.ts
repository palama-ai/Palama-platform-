import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getConfiguredInternalKey, isUuid } from '@/lib/security'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse request parameters
    const body = await request.json()
    const { machine_id } = body

    if (!isUuid(machine_id)) {
      return NextResponse.json({ error: 'Invalid machine_id' }, { status: 400 })
    }

    // Verify ownership before forwarding heartbeat
    const { data: owned } = await supabase
      .from('machines')
      .select('id')
      .eq('id', machine_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!owned) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 })
    }

    // 3. Send heartbeat to Python orchestrator
    const orchestratorUrl = (process.env.PALAMA_INFRA_ORCHESTRATOR_URL || 'http://localhost:8000').replace(/\/+$/, '')
    const internalApiKey = getConfiguredInternalKey()
    if (!internalApiKey) {
      return NextResponse.json({ success: true, status: 'alive' })
    }

    try {
      const response = await fetch(`${orchestratorUrl}/api/v1/machines/${encodeURIComponent(machine_id)}/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-API-Key': internalApiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`Orchestrator returned ${response.status}`)
      }

      const resData = await response.json()
      return NextResponse.json(resData)
    } catch (fetchError) {
      // Local development fallback
      return NextResponse.json({ success: true, status: 'alive' })
    }
  } catch (error: any) {
    console.error('Unexpected error in heartbeat route:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
