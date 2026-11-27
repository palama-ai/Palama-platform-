import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { generateApiKey } from '@/lib/api-keys'
import { assertApprovedAccess } from '@/lib/waitlist'

/** GET /api/keys — list my API keys (no hashes ever leave the server). */
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const access = await assertApprovedAccess(user.id, user)
  if (!access.allowed) {
    return NextResponse.json({ error: access.message, code: access.code }, { status: access.httpStatus })
  }
  const { data, error: dbError } = await supabase
    .from('api_keys')
    .select('id, name, prefix, last_used_at, revoked, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }
  return NextResponse.json({ keys: data || [] })
}

/** POST /api/keys { name } — create a key. The full key is shown ONCE. */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const access = await assertApprovedAccess(user.id, user)
  if (!access.allowed) {
    return NextResponse.json({ error: access.message, code: access.code }, { status: access.httpStatus })
  }
  let name = 'Default key'
  try {
    const body = await request.json()
    if (typeof body?.name === 'string' && body.name.trim()) {
      name = body.name.trim().slice(0, 60)
    }
  } catch {}

  const { count: keyCount } = await supabase
    .from('api_keys')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('revoked', false)
  if ((keyCount ?? 0) >= 20) {
    return NextResponse.json({ error: 'Maximum number of active API keys reached (20).' }, { status: 429 })
  }

  const { key, hash, prefix } = generateApiKey()
  const { data, error: dbError } = await supabase
    .from('api_keys')
    .insert({ user_id: user.id, name, key_hash: hash, prefix })
    .select('id, name, prefix, created_at')
    .single()
  if (dbError) {
    const missing = /relation|table|schema/i.test(dbError.message)
    return NextResponse.json(
      { error: missing ? 'api_keys table missing. Run DEVELOPER_API_SQL.sql in Supabase.' : dbError.message },
      { status: 500 }
    )
  }
  return NextResponse.json({ key, record: data })
}

/** DELETE /api/keys?id=... — revoke one of my keys. */
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const access = await assertApprovedAccess(user.id, user)
  if (!access.allowed) {
    return NextResponse.json({ error: access.message, code: access.code }, { status: access.httpStatus })
  }
  const id = new URL(request.url).searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }
  const { error: dbError } = await supabase
    .from('api_keys')
    .update({ revoked: true })
    .eq('id', id)
    .eq('user_id', user.id)
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
