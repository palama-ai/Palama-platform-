import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

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
  // Desktop app (Tauri/Electron dev server, future https origin) calls
  // /api/* cross-origin: answer preflights + tag API responses with CORS.
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: corsHeaders(request) })
    }
    const res = await updateSession(request)
    const headers = corsHeaders(request)
    for (const [k, v] of Object.entries(headers)) res.headers.set(k, v)
    return res
  }
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static public assets (png, svg, jpg, mp4 etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks/infra|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)',
  ],
}
