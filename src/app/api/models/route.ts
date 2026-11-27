import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

type ModelEntry = {
  id: string
  name: string
  family: string
  provider: string
  context_window: number
  cost_tier: string
  available: boolean
}

let cachedCatalog: ModelEntry[] | null = null
let cachedLive: { at: number; models: ModelEntry[] } | null = null
const LIVE_TTL_MS = 60 * 1000

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
}

function loadStaticCatalog(): ModelEntry[] {
  if (cachedCatalog) return cachedCatalog
  const filePath = path.join(process.cwd(), 'palama-all-models.json')
  if (!fs.existsSync(filePath)) return []
  const fileData = fs.readFileSync(filePath, 'utf8')
  const json = JSON.parse(fileData.replace(/^\uFEFF/, ''))
  cachedCatalog = (Array.isArray(json) ? json : []).map((m: any) => ({
    id: m.id || m.name,
    name: m.name || m.id,
    family: m.family || 'general',
    provider: m.id?.split('/')[0] || 'OmniRoute',
    context_window: m.context_length || 128000,
    cost_tier: m.id?.includes('free') ? 'free' : 'standard',
    available: true,
  }))
  return cachedCatalog
}

export async function GET() {
  try {
    if (cachedLive && Date.now() - cachedLive.at < LIVE_TTL_MS) {
      return NextResponse.json(
        { success: true, models: cachedLive.models, count: cachedLive.models.length },
        { headers: CACHE_HEADERS }
      )
    }

    // 1. Only probe OmniRoute if explicitly configured (skip dead localhost probe in serverless prod)
    const configuredOmni = (process.env.OMNIROUTE_BASE_URL || '').trim().replace(/\/+$/, '')
    if (configuredOmni) {
      try {
        const omniRes = await fetch(`${configuredOmni}/v1/models`, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(1500),
          cache: 'no-store',
        })
        if (omniRes.ok) {
          const omniData = await omniRes.json()
          const rawList = omniData.data || omniData.models || []
          if (rawList.length > 0) {
            const models: ModelEntry[] = rawList.map((m: any) => ({
              id: m.id || m.name,
              name: m.name || m.id,
              family: m.family || 'general',
              provider: m.id?.split('/')[0] || 'OmniRoute',
              context_window: m.context_length || m.context_window || 128000,
              cost_tier: m.id?.includes('free') ? 'free' : 'standard',
              available: true,
            }))
            cachedLive = { at: Date.now(), models }
            return NextResponse.json({ success: true, models, count: models.length }, { headers: CACHE_HEADERS })
          }
        }
      } catch (e) {
        console.warn('OmniRoute direct fetch warning:', e)
      }
    }

    // 2. Only probe agent engine if explicitly configured
    const configuredAgent = (process.env.PALAMA_AGENT_URL || '').trim().replace(/\/+$/, '')
    if (configuredAgent) {
      try {
        const agentRes = await fetch(`${configuredAgent}/api/v1/models`, {
          signal: AbortSignal.timeout(1500),
          cache: 'no-store',
        })
        if (agentRes.ok) {
          const agentData = await agentRes.json()
          if (agentData.models && agentData.models.length > 0) {
            cachedLive = { at: Date.now(), models: agentData.models }
            return NextResponse.json(
              { success: true, models: agentData.models, count: agentData.models.length },
              { headers: CACHE_HEADERS }
            )
          }
        }
      } catch (e) {
        console.warn('Agent engine fetch warning:', e)
      }
    }

    // 3. Cached fallback to static catalog file (palama-all-models.json)
    const models = loadStaticCatalog()
    return NextResponse.json({ success: true, models, count: models.length }, { headers: CACHE_HEADERS })
  } catch (error: any) {
    console.error('Failed to fetch models route:', error)
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }
}
