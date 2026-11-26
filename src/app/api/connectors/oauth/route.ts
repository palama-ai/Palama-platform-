import { NextResponse } from 'next/server'
import { resolveGatewayCaller, resolveOwnerId } from '@/lib/gateway'

/**
 * Platform-hosted OAuth for Google connectors (desktop launch-safe).
 *
 * The desktop app must NEVER ship a client_secret — any string in the .exe
 * is extractable. All secret-bearing steps run here (Vercel env):
 *   GET  /api/connectors/oauth/url?provider=google&connector_id=gmail&redirect_uri=...
 *   POST /api/connectors/oauth/exchange { provider, code, redirect_uri }
 *   POST /api/connectors/oauth/refresh  { provider, refresh_token }
 *
 * Auth: Supabase session, sk-palama-... key, or engine with sb:<uid> owner.
 * Required Vercel env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET.
 */

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/forms.body',
]

const GOOGLE_PROVIDERS = new Set([
  'google', 'gmail', 'google_drive', 'google_sheets',
  'google_calendar', 'google_forms',
])

function authed(request: Request) {
  return resolveGatewayCaller(request).then((caller) => {
    const userId = caller ? resolveOwnerId(caller) : null
    return userId ? true : false
  })
}

export async function GET(request: Request) {
  if (!(await authed(request))) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 })
  }
  const { searchParams } = new URL(request.url)
  const provider = (searchParams.get('provider') || '').toLowerCase()
  const connectorId = searchParams.get('connector_id') || provider
  const redirectUri = searchParams.get('redirect_uri') || ''
  // Owner travels inside `state` (Google echoes it to the desktop callback).
  const owner = (searchParams.get('owner') || '').replace(/[^a-zA-Z0-9:_\-]/g, '').slice(0, 64)
  if (!GOOGLE_PROVIDERS.has(provider)) {
    return NextResponse.json({ error: `Unsupported provider: ${provider}` }, { status: 400 })
  }
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim()
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'OAuth not configured (client_id/redirect_uri)' }, { status: 500 })
  }
  const state = owner ? `${connectorId}~${owner}` : connectorId
  const url =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    'response_type=code&' +
    `scope=${GOOGLE_SCOPES.map(encodeURIComponent).join('%20')}&` +
    'access_type=offline&' +
    'prompt=select_account%20consent&' +
    `state=${encodeURIComponent(state)}`
  return NextResponse.json({ success: true, url, provider: 'google', connector_id: connectorId })
}

export async function POST(request: Request) {
  if (!(await authed(request))) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 })
  }
  let body: any = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const op = body.op || 'exchange'
  const provider = String(body.provider || '').toLowerCase()
  if (!GOOGLE_PROVIDERS.has(provider)) {
    return NextResponse.json({ error: `Unsupported provider: ${provider}` }, { status: 400 })
  }
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim()
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim()
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'OAuth not configured on server' }, { status: 500 })
  }

  try {
    if (op === 'exchange') {
      const { code, redirect_uri } = body
      if (!code || !redirect_uri) {
        return NextResponse.json({ error: 'code and redirect_uri required' }, { status: 400 })
      }
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: String(code),
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: String(redirect_uri),
          grant_type: 'authorization_code',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return NextResponse.json(
          { error: data?.error_description || data?.error || 'Token exchange failed' },
          { status: 502 },
        )
      }
      return NextResponse.json({
        success: true,
        access_token: data.access_token,
        refresh_token: data.refresh_token || null,
        expires_in: data.expires_in || null,
      })
    }

    if (op === 'refresh') {
      const { refresh_token } = body
      if (!refresh_token) {
        return NextResponse.json({ error: 'refresh_token required' }, { status: 400 })
      }
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: String(refresh_token),
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return NextResponse.json(
          { error: data?.error_description || data?.error || 'Token refresh failed' },
          { status: 502 },
        )
      }
      return NextResponse.json({
        success: true,
        access_token: data.access_token,
        expires_in: data.expires_in || null,
      })
    }

    return NextResponse.json({ error: `Unknown op: ${op}` }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'OAuth proxy failed' }, { status: 502 })
  }
}
