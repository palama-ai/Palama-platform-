import { NextResponse } from 'next/server'
import { getDesktopServerConfig } from '@/lib/desktop-config'

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

let cache: { at: number; payload: { version: string; download_url: string; notes: string; sha256: string } } | null = null

function empty() {
  return { version: '', download_url: '', notes: '', sha256: '' }
}

/** Extract a 64-hex-char SHA-256 from a GitHub asset digest ("sha256:<hex>") or return ''. */
function extractDigest(asset: any): string {
  const raw = typeof asset?.digest === 'string' ? asset.digest : ''
  const m = raw.match(/^sha256:([a-f0-9]{64})$/i)
  return m ? m[1].toLowerCase() : ''
}

/**
 * Try to find a companion sha256 checksum file for the setup asset among its
 * sibling release assets (e.g. "Palama Setup 1.2.3.exe.sha256" or "sha256sums.txt").
 * If found, download the small text file and extract the 64-hex SHA-256 digest.
 */
async function fetchCompanionSha256(setupName: string, assets: any[]): Promise<string> {
  // Look for "<setupName>.sha256" or "sha256sums.txt"
  const candidates = assets.filter(
    (a: any) =>
      typeof a?.name === 'string' &&
      typeof a?.browser_download_url === 'string' &&
      (a.name === `${setupName}.sha256` || /sha256sums?\.txt$/i.test(a.name)) &&
      (a.size ?? 0) < 4096 // Safety: don't download large files
  )
  for (const ca of candidates) {
    try {
      const dl = await fetch(ca.browser_download_url, {
        headers: { 'User-Agent': 'Palama-Updater/1.0' },
      })
      if (!dl.ok) continue
      const txt = await dl.text()
      // Format: standalone 64-hex, or "<hex>  <filename>"
      for (const line of txt.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed) continue
        // Standalone 64 hex chars (e.g. "<setupName>.sha256" file)
        if (/^[a-f0-9]{64}$/i.test(trimmed)) return trimmed.toLowerCase()
        // "<hash>  <filename>" (sha256sum format)
        const parts = trimmed.split(/\s+/)
        if (parts.length >= 2 && /^[a-f0-9]{64}$/i.test(parts[0]) && parts[parts.length - 1].includes(setupName)) {
          return parts[0].toLowerCase()
        }
      }
    } catch { /* non-critical — skip */ }
  }
  return ''
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
    // SHA-256: prefer GitHub asset digest, then companion .sha256 file
    let sha256 = extractDigest(setup)
    if (!sha256) sha256 = await fetchCompanionSha256(setup.name, assets)
    const payload = {
      version: String(rel.tag_name || '').trim(),
      download_url: String(setup.browser_download_url),
      notes: String(rel.body || '').slice(0, 2000),
      sha256,
    }
    cache = { at: Date.now(), payload }
    return payload
  }
  return empty()
}

export async function GET() {
  const cfg = await getDesktopServerConfig().catch(() => null)
  const policyFields = cfg
    ? {
        min_supported_version: cfg.min_supported_version,
        blocked_versions: cfg.blocked_versions,
        force_update_message: cfg.force_update_message,
        weekly_token_quota: cfg.weekly_token_quota,
        ...(cfg.models ? { models: cfg.models } : {}),
      }
    : {}
  try {
    const manual = (process.env.RELEASE_VERSION || '').trim()
    if (manual) {
      // Normalize RELEASE_SHA256: must be exactly 64 lowercase hex chars
      const rawSha = (process.env.RELEASE_SHA256 || '').trim()
      const sha256 = /^[a-f0-9]{64}$/i.test(rawSha) ? rawSha.toLowerCase() : ''
      return NextResponse.json({
        version: manual,
        download_url: (process.env.RELEASE_DOWNLOAD_URL || '').trim(),
        notes: (process.env.RELEASE_NOTES || '').trim(),
        sha256,
        ...policyFields,
      })
    }
    const gh = await fromGitHub()
    return NextResponse.json({ ...gh, ...policyFields })
  } catch (e: any) {
    // Serve stale cache rather than breaking update checks on transient errors.
    if (cache) return NextResponse.json({ ...cache.payload, ...policyFields })
    return NextResponse.json({ ...empty(), ...policyFields, error: e?.message || 'feed unavailable' })
  }
}
