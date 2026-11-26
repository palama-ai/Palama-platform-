import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import {
  startContainer,
  waitForAgentHealth,
} from '@/lib/docker-manager'
import { isUuid } from '@/lib/security'

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

    // 2. Parse parameters
    const body = await request.json()
    const { machine_id } = body

    if (!isUuid(machine_id)) {
      return NextResponse.json({ error: 'Invalid machine_id' }, { status: 400 })
    }

    // 3. Fetch machine from database strictly scoped to current user
    const { data: machine, error: fetchError } = await supabase
      .from('machines')
      .select('*')
      .eq('id', machine_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !machine) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 })
    }

    // 4. If already running, return it
    if (machine.status === 'ready' && machine.control_url) {
      try {
        const healthRes = await fetch(`${machine.control_url}/health`, {
          signal: AbortSignal.timeout(3000),
        })
        if (healthRes.ok) {
          return NextResponse.json(machine)
        }
      } catch {
        // Agent not responding, try to restart container
      }
    }

    // 5. Try to start the container using the user's own RLS-scoped client
    await supabase
      .from('machines')
      .update({ status: 'creating' })
      .eq('id', machine_id)
      .eq('user_id', user.id)

    try {
      console.log(`[machines/connect] Starting container for machine ${machine_id}...`)

      const containerInfo = await startContainer(machine_id)

      if (!containerInfo) {
        throw new Error('Container not found or failed to start')
      }

      console.log(`[machines/connect] Container started: ${containerInfo.containerName}`)

      // Wait for agent health
      const healthy = await waitForAgentHealth(containerInfo.agentUrl, 30, 2000)
      const finalStatus = healthy ? 'ready' : 'error'

      // Update machine in database
      await supabase
        .from('machines')
        .update({
          status: finalStatus,
          control_url: containerInfo.agentUrl,
          vnc_url: containerInfo.vncUrl,
          ip_address: containerInfo.vncUrl,
        })
        .eq('id', machine_id)
        .eq('user_id', user.id)

      return NextResponse.json({
        ...machine,
        status: finalStatus,
        control_url: containerInfo.agentUrl,
        vnc_url: containerInfo.vncUrl,
        ip_address: containerInfo.vncUrl,
      })
    } catch (dockerError: any) {
      console.error(`[machines/connect] Failed to start container for ${machine_id}:`, dockerError.message)

      await supabase
        .from('machines')
        .update({ status: 'error' })
        .eq('id', machine_id)
        .eq('user_id', user.id)

      return NextResponse.json(
        { error: 'Failed to start container' },
        { status: 503 }
      )
    }
  } catch (error: any) {
    console.error('Unexpected error in connect route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
