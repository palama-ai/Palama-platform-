import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // 1. Try fetching from OmniRoute directly (local proxy when the desktop app runs it)
    const omniBase = (process.env.OMNIROUTE_BASE_URL || 'http://localhost:20128').replace(/\/+$/, '')
    try {
      const omniRes = await fetch(`${omniBase}/v1/models`, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      })
      if (omniRes.ok) {
        const omniData = await omniRes.json()
        const rawList = omniData.data || omniData.models || []
        if (rawList.length > 0) {
          const models = rawList.map((m: any) => ({
            id: m.id || m.name,
            name: m.name || m.id,
            family: m.family || 'general',
            provider: m.id?.split('/')[0] || 'OmniRoute',
            context_window: m.context_length || m.context_window || 128000,
            cost_tier: m.id?.includes('free') ? 'free' : 'standard',
            available: true
          }))
          return NextResponse.json({ success: true, models, count: models.length })
        }
      }
    } catch (e) {
      console.warn('OmniRoute direct fetch warning:', e)
    }

    // 2. Try fetching from the Palama agent engine (desktop backend)
    const agentBase = (process.env.PALAMA_AGENT_URL || 'http://127.0.0.1:8391').replace(/\/+$/, '')
    try {
      const agentRes = await fetch(`${agentBase}/api/v1/models`, { cache: 'no-store' })
      if (agentRes.ok) {
        const agentData = await agentRes.json()
        if (agentData.models && agentData.models.length > 0) {
          return NextResponse.json({ success: true, models: agentData.models, count: agentData.models.length })
        }
      }
    } catch (e) {
      console.warn('Agent engine fetch warning:', e)
    }

    // 3. Fallback to local catalog file (palama-all-models.json)
    const filePath = path.join(process.cwd(), 'palama-all-models.json')
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8')
      const json = JSON.parse(fileData.replace(/^\uFEFF/, ''))
      const models = json.map((m: any) => ({
        id: m.id || m.name,
        name: m.name || m.id,
        family: m.family || 'general',
        provider: m.id?.split('/')[0] || 'OmniRoute',
        context_window: m.context_length || 128000,
        cost_tier: m.id?.includes('free') ? 'free' : 'standard',
        available: true
      }))
      return NextResponse.json({ success: true, models, count: models.length })
    }

    return NextResponse.json({ success: true, models: [], count: 0 })
  } catch (error: any) {
    console.error('Failed to fetch models route:', error)
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }
}
