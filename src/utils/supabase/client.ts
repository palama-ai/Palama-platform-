import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlroxlrxpnvovajohids.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_XXBO_7SbYXz3VCI0F0vtsw_9LeT9tgz'
  return createBrowserClient(
    supabaseUrl,
    anonKey
  )
}
