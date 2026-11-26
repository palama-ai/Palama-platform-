import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { isSafeNextPath } from '@/lib/security'

function trustedHostForOrigin(request: Request, origin: string): string {
  const forwardedHost = (request.headers.get('x-forwarded-host') || '').split(',')[0].trim().toLowerCase()
  const requestHost = new URL(origin).host.toLowerCase()
  const allowedHosts = new Set<string>([requestHost])
  for (const h of (process.env.ALLOWED_HOSTS || '').split(',')) {
    const clean = h.trim().toLowerCase()
    if (clean) allowedHosts.add(clean)
  }
  if (forwardedHost && allowedHosts.has(forwardedHost)) {
    return `https://${forwardedHost}`
  }
  return origin
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = isSafeNextPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const isLocalEnv = process.env.NODE_ENV === 'development'
      const redirectBase = isLocalEnv ? origin : trustedHostForOrigin(request, origin)
      return NextResponse.redirect(`${redirectBase}${next}`)
    }
  }

  // Email-confirmation links (token_hash + type) — verify OTP directly.
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type: type as any, token_hash })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Could not exchange OAuth code`)
}
