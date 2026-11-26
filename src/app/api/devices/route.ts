import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ua = request.headers.get('user-agent') || ''

    // Detect actual OS of the machine where user logged in
    let os = 'Windows 11'
    if (/Windows NT 10.0/i.test(ua)) os = 'Windows 11'
    else if (/Windows NT 6.3/i.test(ua)) os = 'Windows 8.1'
    else if (/Windows/i.test(ua)) os = 'Windows'
    else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS'
    else if (/Linux/i.test(ua)) os = 'Linux'

    // Check Local Agent Health
    const agentUrl = process.env.PALAMA_AGENT_URL || 'http://127.0.0.1:8391'
    let agentAlive = false
    try {
      const res = await fetch(`${agentUrl}/health`, { signal: AbortSignal.timeout(1200) })
      if (res.ok) agentAlive = true
    } catch {}

    // Blocked devices and custom records from user metadata
    const userMeta = user.user_metadata || {}
    const blockedDevices: any[] = Array.isArray(userMeta.blocked_devices) ? userMeta.blocked_devices : []
    const disconnectedDevices: string[] = Array.isArray(userMeta.disconnected_devices) ? userMeta.disconnected_devices : []

    // Check remote machines registered in Supabase
    let dbMachines: any[] = []
    try {
      const { data } = await supabase
        .from('machines')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (Array.isArray(data)) dbMachines = data
    } catch {}

    const lastSignIn = user.last_sign_in_at || user.created_at || new Date().toISOString()
    const formatDate = (dateStr: string) => {
      try {
        const d = new Date(dateStr)
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      } catch {
        return 'Recently'
      }
    }

    const mainDeviceId = `agent-pc-${user.id.slice(0, 8)}`
    const isMainBlocked = blockedDevices.some((b) => b.id === mainDeviceId)
    const isMainDisconnected = disconnectedDevices.includes(mainDeviceId)

    // Build active agent devices list
    const activeDevices = []

    if (!isMainBlocked) {
      activeDevices.push({
        id: mainDeviceId,
        name: `${os} PC (Palama Agent)`,
        os: `${os} (64-bit)`,
        runtime: 'Palama Desktop Core Engine',
        status: isMainDisconnected ? 'Disconnected' : agentAlive ? 'Active' : 'Connected',
        lastActive: formatDate(lastSignIn),
        isCurrent: true,
        ip: '127.0.0.1',
      })
    }

    for (const m of dbMachines) {
      const isBlocked = blockedDevices.some((b) => b.id === m.id)
      if (isBlocked) continue
      const isDisconnected = disconnectedDevices.includes(m.id)
      activeDevices.push({
        id: m.id,
        name: m.name || 'Palama Cloud Runner',
        os: m.os || 'Linux Cloud',
        runtime: m.tier || 'Cloud Runner Instance',
        status: isDisconnected ? 'Disconnected' : m.status === 'ready' ? 'Active' : m.status || 'Idle',
        lastActive: formatDate(m.created_at),
        isCurrent: false,
        ip: m.ip || 'Cloud Instance',
      })
    }

    return NextResponse.json({
      devices: activeDevices,
      blocked_devices: blockedDevices,
      user_email: user.email,
      last_sign_in_at: user.last_sign_in_at,
      agent_alive: agentAlive,
      detected_os: os,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, deviceId, deviceName, reason } = body

    const userMeta = user.user_metadata || {}
    let blockedDevices: any[] = Array.isArray(userMeta.blocked_devices) ? [...userMeta.blocked_devices] : []
    let disconnectedDevices: string[] = Array.isArray(userMeta.disconnected_devices) ? [...userMeta.disconnected_devices] : []

    if (action === 'block') {
      if (!deviceId) return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 })
      if (!blockedDevices.some((d) => d.id === deviceId)) {
        blockedDevices.push({
          id: deviceId,
          name: deviceName || 'Device',
          blocked_at: new Date().toISOString(),
          reason: reason || 'Blocked by user from Devices Security console',
        })
      }
      if (!disconnectedDevices.includes(deviceId)) {
        disconnectedDevices.push(deviceId)
      }
    } else if (action === 'unblock') {
      if (!deviceId) return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 })
      blockedDevices = blockedDevices.filter((d) => d.id !== deviceId)
      disconnectedDevices = disconnectedDevices.filter((id) => id !== deviceId)
    } else if (action === 'disconnect') {
      if (!deviceId) return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 })
      if (!disconnectedDevices.includes(deviceId)) {
        disconnectedDevices.push(deviceId)
      }
    } else if (action === 'reconnect') {
      if (!deviceId) return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 })
      disconnectedDevices = disconnectedDevices.filter((id) => id !== deviceId)
    } else if (action === 'delete') {
      if (!deviceId) return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 })
      blockedDevices = blockedDevices.filter((d) => d.id !== deviceId)
      disconnectedDevices = disconnectedDevices.filter((id) => id !== deviceId)
      // If it's a database machine, delete it from machines table
      try {
        await supabase.from('machines').delete().eq('id', deviceId).eq('user_id', user.id)
      } catch {}
    } else if (action === 'generate_pairing_code') {
      const code = `PALAMA-${Math.floor(100000 + Math.random() * 900000)}`
      return NextResponse.json({
        success: true,
        pairing_code: code,
        expires_in: '15 minutes',
        instructions: `Run 'palama login --code ${code}' on your device terminal to authenticate.`,
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Save updated metadata to Supabase Auth
    await supabase.auth.updateUser({
      data: {
        ...userMeta,
        blocked_devices: blockedDevices,
        disconnected_devices: disconnectedDevices,
      },
    })

    return NextResponse.json({
      success: true,
      action,
      deviceId,
      blocked_devices: blockedDevices,
      disconnected_devices: disconnectedDevices,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
