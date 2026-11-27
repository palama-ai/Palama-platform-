import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/utils/supabase/server'
import { isAdminUser, isUuid } from '@/lib/security'
import type { WaitlistStatus } from '@/lib/waitlist'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = await createAdminClient()
      const [{ data: rows, error: dbErr }, { data: authList }] = await Promise.all([
        admin.from('waitlist_access').select('*').order('created_at', { ascending: false }),
        admin.auth.admin.listUsers({ perPage: 500 }).catch(() => ({ data: { users: [] } })),
      ])
      if (dbErr) {
        return NextResponse.json({ error: dbErr.message }, { status: 500 })
      }

      const rowById = new Map<string, any>()
      for (const r of rows || []) rowById.set(r.user_id, r)

      const merged: any[] = []
      const seen = new Set<string>()

      for (const r of rows || []) {
        seen.add(r.user_id)
        const authUser = authList?.users?.find((u: any) => u.id === r.user_id)
        merged.push({
          ...r,
          email: r.email || authUser?.email || '',
          full_name: r.full_name || authUser?.user_metadata?.full_name || null,
          email_confirmed: Boolean(authUser?.email_confirmed_at || authUser?.confirmed_at),
        })
      }

      for (const u of authList?.users || []) {
        if (seen.has(u.id)) continue
        const appStatus = u.app_metadata?.role === 'admin'
          ? 'approved'
          : (u.app_metadata?.waitlist_status || 'pending')
        merged.push({
          user_id: u.id,
          email: u.email || '',
          full_name: u.user_metadata?.full_name || null,
          phone: '',
          role: '',
          role_other: null,
          usage_type: 'solo',
          team_size: null,
          use_case: null,
          onboarding_completed: false,
          status: appStatus,
          email_confirmed: Boolean(u.email_confirmed_at || (u as any).confirmed_at),
          approved_at: null,
          approved_by: null,
          created_at: u.created_at,
          updated_at: u.updated_at || u.created_at,
        })
      }

      return NextResponse.json(
        { applicants: merged },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || 'Failed to load waitlist' }, { status: 500 })
    }
  }

  // Fallback without service role (requires app_metadata.role = 'admin')
  const { data: rpcRows, error: rpcErr } = await supabase.rpc('admin_list_waitlist')
  if (rpcErr) {
    return NextResponse.json({ error: rpcErr.message }, { status: 500 })
  }
  return NextResponse.json(
    { applicants: rpcRows || [] },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const targetUserId = String(body?.userId || '').trim()
  const action = String(body?.action || '').trim().toLowerCase()
  const statusMap: Record<string, WaitlistStatus> = {
    approve: 'approved',
    approved: 'approved',
    reject: 'rejected',
    rejected: 'rejected',
    pending: 'pending',
    waitlist: 'pending',
  }
  const nextStatus = statusMap[action]

  if (!isUuid(targetUserId) || !nextStatus) {
    return NextResponse.json({ error: 'Valid userId and action (approve/pending/reject) required' }, { status: 400 })
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = await createAdminClient()
      const { data: targetAuth, error: uErr } = await admin.auth.admin.getUserById(targetUserId)
      if (uErr || !targetAuth?.user) {
        return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
      }

      const { data: existing } = await admin
        .from('waitlist_access')
        .select('user_id')
        .eq('user_id', targetUserId)
        .maybeSingle()

      const nowIso = new Date().toISOString()
      if (existing) {
        const { error: updErr } = await admin
          .from('waitlist_access')
          .update({
            status: nextStatus,
            approved_at: nextStatus === 'approved' ? nowIso : null,
            approved_by: nextStatus === 'approved' ? user.email || user.id : null,
            updated_at: nowIso,
          })
          .eq('user_id', targetUserId)
        if (updErr) {
          return NextResponse.json({ error: updErr.message }, { status: 500 })
        }
      } else {
        const { error: insErr } = await admin.from('waitlist_access').insert({
          user_id: targetUserId,
          email: targetAuth.user.email || '',
          full_name: (targetAuth.user.user_metadata?.full_name as string) || null,
          phone: '',
          role: 'pending_onboarding',
          usage_type: 'solo',
          onboarding_completed: false,
          status: nextStatus,
          approved_at: nextStatus === 'approved' ? nowIso : null,
          approved_by: nextStatus === 'approved' ? user.email || user.id : null,
          updated_at: nowIso,
        })
        if (insErr) {
          return NextResponse.json({ error: insErr.message }, { status: 500 })
        }
      }

      // Mirror approval on immutable app_metadata too
      const prevMeta = targetAuth.user.app_metadata || {}
      await admin.auth.admin.updateUserById(targetUserId, {
        app_metadata: { ...prevMeta, waitlist_status: nextStatus },
      })

      return NextResponse.json({ ok: true, userId: targetUserId, status: nextStatus })
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || 'Failed to update status' }, { status: 500 })
    }
  }

  const { error: rpcErr } = await supabase.rpc('admin_set_waitlist_status', {
    p_target_user_id: targetUserId,
    p_status: nextStatus,
  })
  if (rpcErr) {
    return NextResponse.json({ error: rpcErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, userId: targetUserId, status: nextStatus })
}
