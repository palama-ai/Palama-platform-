import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { validateApiKey, logApiUsage } from '@/lib/api-keys'
import { checkRateLimit, getConfiguredInternalKey, isUuid } from '@/lib/security'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Session auth first, Palama API key second (sk-palama-...)
    let keyOwnerId: string | null = null
    if (authError || !user) {
      const bearer = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()
      const owner = await validateApiKey(bearer)
      if (!owner) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      keyOwnerId = owner.userId
    }
    const ownerId = user?.id || keyOwnerId
    if (!ownerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rl = checkRateLimit(`agent-run:${ownerId}`, 30, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
      )
    }

    const body = await request.json()
    const { task, model, executionMode, execution_mode, sandbox_url, max_steps, machine_id } = body

    const usedModel = typeof body.model === 'string' && body.model ? body.model : 'auto'
    await logApiUsage(ownerId, 'agent.run', usedModel)

    if (!task || typeof task !== 'string' || task.trim().length === 0) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 })
    }

    const rawMode = executionMode || execution_mode || model || 'BASIC'
    const modeUpper = String(rawMode).toUpperCase()

    // Validate executionMode strictly
    if (!['BASIC', 'COMPLEX', 'AUTO'].includes(modeUpper)) {
      return NextResponse.json(
        { error: 'Invalid executionMode. Must be BASIC or COMPLEX' },
        { status: 400 }
      )
    }

    // Resolve trusted Agent URL from owned machine record or server env (never client control_url)
    let agentUrl = (process.env.PALAMA_AGENT_URL || 'http://localhost:8001').replace(/\/+$/, '')
    if (machine_id && user) {
      if (!isUuid(machine_id)) {
        return NextResponse.json({ error: 'Invalid machine_id' }, { status: 400 })
      }
      const { data: machine } = await supabase
        .from('machines')
        .select('control_url')
        .eq('id', machine_id)
        .eq('user_id', user.id)
        .maybeSingle()
      if (!machine?.control_url) {
        return NextResponse.json({ error: 'Machine not found or not ready' }, { status: 404 })
      }
      agentUrl = String(machine.control_url).replace(/\/+$/, '')
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }))
    const internalKey = getConfiguredInternalKey()
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
    else if (internalKey) headers['Authorization'] = `Bearer ${internalKey}`

    const boundedSteps = Math.min(200, Math.max(1, Number(max_steps) || 50))
    const agentResponse = await fetch(`${agentUrl}/api/v1/agent/run`, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(55_000),
      body: JSON.stringify({
        task: task.trim(),
        model: modeUpper.toLowerCase(),
        execution_mode: modeUpper,
        executionMode: modeUpper,
        sandbox_url: typeof sandbox_url === 'string' && /^https?:\/\//i.test(sandbox_url) ? sandbox_url : undefined,
        max_steps: boundedSteps,
      }),
    })

    if (!agentResponse.ok) {
      return NextResponse.json(
        { error: 'Agent engine rejected the request' },
        { status: agentResponse.status }
      )
    }

    const result = await agentResponse.json()
    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Agent run error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
