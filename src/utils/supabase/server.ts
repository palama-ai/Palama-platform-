import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const customFetch = async (...args: Parameters<typeof fetch>) => {
  try {
    return await fetch(...args)
  } catch (error) {
    console.error('Supabase fetch network error in server:', error)
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
}

export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const anonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim()
  if (!supabaseUrl || !anonKey) {
    throw new Error('Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY) are not configured.')
  }

  return createServerClient(
    supabaseUrl,
    anonKey,
    {
      global: {
        fetch: customFetch,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function createAdminClient() {
  const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin database operations.')
  }

  return createServerClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      global: {
        fetch: customFetch,
      },
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No cookie changes for admin client
        },
      },
    }
  )
}
