import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { isSafeNextPath } from '@/lib/security'
import { getWaitlistStateForUser } from '@/lib/waitlist'

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

async function resolvePostAuthDestination(
  supabase: Awaited<ReturnType<typeof createClient>>,
  requestedNext: string
): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return requestedNext
    const state = await getWaitlistStateForUser(user, supabase)
    if (!state.emailVerified) {
      const qs = new URLSearchParams()
      if (user.email) qs.set('email', user.email)
      if (requestedNext && requestedNext !== '/dashboard') qs.set('next', requestedNext)
      return `/auth/verify?${qs.toString()}`
    }
    if (!state.onboardingCompleted && !state.isAdmin) {
      const targetAfterOnboarding = requestedNext.startsWith('/onboarding') ? '/dashboard' : requestedNext
      const qs = targetAfterOnboarding !== '/dashboard' ? `?next=${encodeURIComponent(targetAfterOnboarding)}` : ''
      return `/onboarding${qs}`
    }
  } catch {}
  return requestedNext
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const requestedNext = isSafeNextPath(searchParams.get('next'))
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const redirectBase = isLocalEnv ? origin : trustedHostForOrigin(request, origin)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const finalDest = await resolvePostAuthDestination(supabase, requestedNext)
      return NextResponse.redirect(`${redirectBase}${finalDest}`)
    }
  }

  // Email-confirmation links (token_hash + type) — verify token directly.
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type: type as any, token_hash })
    if (!error) {
      const finalDest = await resolvePostAuthDestination(supabase, requestedNext)
      return NextResponse.redirect(`${redirectBase}${finalDest}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Verification link invalid or expired. Please sign in or request a new link.')}`)
}
