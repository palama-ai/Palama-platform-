import { NextResponse } from 'next/server'

/**
 * GET /api/releases/latest — release feed for Palama Co-Worker auto-update.
 *
 * Priority:
 * 1. Manual override via env (Vercel): RELEASE_VERSION + RELEASE_DOWNLOAD_URL
 *    (+ optional RELEASE_NOTES). Useful for hotfixes/rollbacks.
 * 2. Automatic GitHub detection: scans recent releases of the Desktop repo
 *    and picks the newest one carrying a "Palama Setup *.exe" asset.
 *    Persona releases (no such asset) are skipped automatically.
 *    → Publishing an update = just attach the Setup exe to a GitHub release.
 *    No Vercel edits needed per release.
 *
 * One-time env (optional): GITHUB_OWNER / GITHUB_REPO (defaults below),
 * GITHUB_TOKEN (raises API quota 60 → 5000 req/h; otherwise responses are
 * cached 15 min in memory to stay far under the anonymous quota).
 */

// Always evaluated live: a statically prerendered feed would freeze updates forever.
export const dynamic = 'force-dynamic'

const OWNER = (process.env.GITHUB_OWNER || 'palama-ai').trim() || 'palama-ai'
const REPO = (process.env.GITHUB_REPO || 'Palama-persona-Release').trim() || 'Palama-persona-Release'
const TOKEN = (process.env.GITHUB_TOKEN || '').trim()
const CACHE_TTL_MS = 15 * 60 * 1000

let cache: { at: number; payload: { version: string; download_url: string; notes: string } } | null = null

function empty() {
  return { version: '', download_url: '', notes: '' }
}

async function fromGitHub() {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.payload
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Palama-Updater/1.0',
  }
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/releases?per_page=20`,
    { headers, next: { revalidate: 900 } }
  )
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
  const releases = (await res.json()) as any[]
  for (const rel of Array.isArray(releases) ? releases : []) {
    if (!rel || rel.draft || rel.prerelease) continue
    const assets = Array.isArray(rel.assets) ? rel.assets : []
    const setup = assets.find(
      (a: any) =>
        typeof a?.name === 'string' &&
        /palama[ .]setup.*\.exe$/i.test(a.name) &&
        typeof a?.browser_download_url === 'string'
    )
    if (!setup) continue
    const payload = {
      version: String(rel.tag_name || '').trim(),
      download_url: String(setup.browser_download_url),
      notes: String(rel.body || '').slice(0, 2000),
    }
    cache = { at: Date.now(), payload }
    return payload
  }
  return empty()
}

export async function GET() {
  try {
    const manual = (process.env.RELEASE_VERSION || '').trim()
    if (manual) {
      return NextResponse.json({
        version: manual,
        download_url: (process.env.RELEASE_DOWNLOAD_URL || '').trim(),
        notes: (process.env.RELEASE_NOTES || '').trim(),
      })
    }
    return NextResponse.json(await fromGitHub())
  } catch (e: any) {
    // Serve stale cache rather than breaking update checks on transient errors.
    if (cache) return NextResponse.json(cache.payload)
    return NextResponse.json({ ...empty(), error: e?.message || 'feed unavailable' })
  }
}
