import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import {
  createContainer,
  waitForAgentHealth,
} from '@/lib/docker-manager'

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

    // 2. Parse & bound request parameters
    const body = await request.json()
    const { name, os, tier } = body

    if (typeof name !== 'string' || !name.trim() || typeof os !== 'string' || typeof tier !== 'string') {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const TIER_SPECS: Record<string, { cpu: number; mem: number }> = {
      standard: { cpu: 2, mem: 4 },
      basic: { cpu: 2, mem: 4 },
      pro: { cpu: 4, mem: 8 },
      performance: { cpu: 4, mem: 8 },
    }
    const spec = TIER_SPECS[tier.trim().toLowerCase()] || TIER_SPECS.standard

    // Enforce per-user container quota
    const { count: existingCount } = await supabase
      .from('machines')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if ((existingCount ?? 0) >= 5) {
      return NextResponse.json({ error: 'Maximum number of machines reached (5).' }, { status: 429 })
    }

    // 3. Create the machine entry in database with status 'creating'
    const { data: machineData, error: dbError } = await supabase
      .from('machines')
      .insert({
        user_id: user.id,
        name: name.trim().slice(0, 64),
        os: os.trim().slice(0, 32),
        tier: tier.trim().slice(0, 32),
        status: 'creating',
        cpu_cores: spec.cpu,
        memory_gb: spec.mem,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database Error:', dbError)
      return NextResponse.json({ error: 'Failed to create machine record' }, { status: 500 })
    }

    // 4. Create a real Docker container
    try {
      console.log(`[machines/create] Creating Docker container for machine ${machineData.id}...`)

      const containerInfo = await createContainer(
        machineData.id,
        name.trim().slice(0, 64),
        spec.cpu,
        spec.mem
      )

      console.log(`[machines/create] Container created: ${containerInfo.containerName}`)
      console.log(`[machines/create] Agent: ${containerInfo.agentUrl}, VNC: ${containerInfo.vncUrl}`)

      // 5. Wait for the agent inside the container to become healthy (max 60s)
      const healthy = await waitForAgentHealth(containerInfo.agentUrl, 30, 2000)

      const finalStatus = healthy ? 'ready' : 'error'

      // 6. Update machine in database with real container info
      const { error: updateError } = await supabase
        .from('machines')
        .update({
          status: finalStatus,
          control_url: containerInfo.agentUrl,
          vnc_url: containerInfo.vncUrl,
          ip_address: containerInfo.vncUrl,
        })
        .eq('id', machineData.id)

      if (updateError) {
        console.error('Failed to update machine after container creation:', updateError)
      }

      const readyMachine = {
        ...machineData,
        status: finalStatus,
        control_url: containerInfo.agentUrl,
        vnc_url: containerInfo.vncUrl,
        ip_address: containerInfo.vncUrl,
      }

      return NextResponse.json(readyMachine)
    } catch (dockerError: any) {
      console.error('[machines/create] Docker container creation failed:', dockerError.message)

      // Update status to error in DB
      await supabase
        .from('machines')
        .update({ status: 'error' })
        .eq('id', machineData.id)

      return NextResponse.json(
        { error: 'Failed to create Docker container' },
        { status: 503 }
      )
    }
  } catch (error: any) {
    console.error('Unexpected error creating machine:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
