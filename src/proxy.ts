import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

const PUBLIC_READ_APIS = new Set([
  '/api/models',
  '/api/releases/latest',
  '/api/desktop/config',
])

function allowedOrigin(request: NextRequest): string {
  const origin = (request.headers.get('origin') || '').trim()
  const selfOrigin = request.nextUrl.origin
  if (!origin) return selfOrigin
  if (origin === selfOrigin) return origin
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return origin
  if (origin === 'null' || origin.startsWith('app://')) return origin
  const extra = (process.env.ALLOWED_CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)
  if (extra.includes(origin)) return origin
  return selfOrigin
}

function corsHeaders(request: NextRequest): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': allowedOrigin(request),
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Desktop app (Tauri/Electron dev server, future https origin) calls
  // /api/* cross-origin: answer preflights + tag API responses with CORS.
  if (pathname.startsWith('/api/')) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: corsHeaders(request) })
    }
    // Public read-only API endpoints should stay fast & edge-cacheable without
    // making an external Supabase auth check per request.
    if (request.method === 'GET' && PUBLIC_READ_APIS.has(pathname)) {
      const res = NextResponse.next()
      const headers = corsHeaders(request)
      for (const [k, v] of Object.entries(headers)) res.headers.set(k, v)
      return res
    }
    const res = await updateSession(request)
    const headers = corsHeaders(request)
    for (const [k, v] of Object.entries(headers)) res.headers.set(k, v)
    return res
  }

  return await updateSession(request)
}

export const config = {
  /*
   * Keep public marketing pages (/, /news, /products, /use-cases, /company,
   * /download, /developers, /legal, /support, etc.) completely off middleware so
   * they serve directly from the static edge CDN under heavy traffic spikes.
   */
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/onboarding/:path*',
    '/auth/:path*',
    '/api/((?!webhooks/infra).*)',
  ],
}
