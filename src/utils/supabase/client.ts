import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const anonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim()
  if (!supabaseUrl || !anonKey) {
    throw new Error('Supabase client environment variables are not configured.')
  }
  return createBrowserClient(
    supabaseUrl,
    anonKey
  )
}
