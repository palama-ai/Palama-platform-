import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const pathname = request.nextUrl.pathname

  // Short-circuit when no Supabase session cookies are present:
  // avoids hammering Supabase Auth on unauthenticated requests during traffic spikes.
  const hasSessionCookie = request.cookies.getAll().some((c) => c.name.startsWith('sb-'))
  if (!hasSessionCookie) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding') || pathname.startsWith('/admin')) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('next', pathname + (request.nextUrl.search || ''))
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const anonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim()

  if (!supabaseUrl || !anonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    anonKey,
    {
      global: {
        fetch: async (input, init) => {
          try {
            const timeout = AbortSignal.timeout(3500)
            const signal = init?.signal && typeof AbortSignal.any === 'function'
              ? AbortSignal.any([init.signal, timeout])
              : (init?.signal ?? timeout)
            return await fetch(input, { ...init, signal })
          } catch (error) {
            console.error('Supabase fetch network error in middleware:', error)
            return new Response(
              JSON.stringify({
                error: 'network_error',
                message: 'Failed to fetch from Supabase: ' + (error instanceof Error ? error.message : String(error)),
              }),
              {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }
        },
      },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing user sessions to global scope.
  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (!error) {
      user = data.user
    } else {
      console.warn('Supabase auth error in middleware:', error.message)
    }
  } catch (err: any) {
    console.error('Supabase fetch failed in middleware:', err?.message || err)
  }

  // Protect /dashboard, /admin, /onboarding and nested routes
  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding') || pathname.startsWith('/admin')) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname + (request.nextUrl.search || ''))
    return NextResponse.redirect(url)
  }

  // If user is logged in, prevent accessing login/signup auth pages (redirect to dashboard).
  // Exception: /auth/desktop, /auth/callback, and /auth/verify must stay reachable.
  if (
    pathname.startsWith('/auth') &&
    !pathname.startsWith('/auth/desktop') &&
    !pathname.startsWith('/auth/callback') &&
    !pathname.startsWith('/auth/verify') &&
    user
  ) {
    const url = request.nextUrl.clone()
    const nextParam = request.nextUrl.searchParams.get('next')
    if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')) {
      const parsed = new URL(nextParam, request.nextUrl.origin)
      url.pathname = parsed.pathname
      url.search = parsed.search
    } else {
      url.pathname = '/dashboard'
      url.search = ''
    }
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
