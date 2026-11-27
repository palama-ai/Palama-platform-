import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/utils/supabase/server'
import { checkRateLimit } from '@/lib/security'
import {
  getWaitlistStateForUser,
  isUserEmailVerified,
  validateOnboardingPayload,
} from '@/lib/waitlist'

export const dynamic = 'force-dynamic'

/**
 * POST /api/waitlist/onboarding
 * Records user phone, role, and solo/team usage after email confirmation.
 * Server enforces email verification AND forbids clients from setting approval status.
 */
export async function POST(request: Request) {
  const supabase = await createClient().catch(() => null)
  if (!supabase) {
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 })
  }

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rl = checkRateLimit(`waitlist-onboard:${user.id}`, 20, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    )
  }

  if (!isUserEmailVerified(user)) {
    return NextResponse.json(
      {
        error: 'Please verify your email via the confirmation link before completing setup.',
        code: 'EMAIL_NOT_VERIFIED',
      },
      { status: 403 }
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const validated = validateOnboardingPayload(body)
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  const { phone, role, roleOther, usageType, teamSize, useCase, fullName } = validated.data

  if (fullName && fullName !== user.user_metadata?.full_name) {
    try {
      await supabase.auth.updateUser({ data: { full_name: fullName } })
    } catch {}
  }

  // Primary write via service role when configured
  let saved = false
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = await createAdminClient()
      const { data: existing } = await admin
        .from('waitlist_access')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle()

      const preservedStatus =
        existing?.status === 'approved' || existing?.status === 'rejected'
          ? existing.status
          : user.app_metadata?.waitlist_status === 'approved'
          ? 'approved'
          : 'pending'

      const { error: upsertErr } = await admin.from('waitlist_access').upsert(
        {
          user_id: user.id,
          email: user.email || '',
          full_name: fullName || (user.user_metadata?.full_name as string) || null,
          phone,
          role,
          role_other: roleOther,
          usage_type: usageType,
          team_size: teamSize,
          use_case: useCase,
          onboarding_completed: true,
          status: preservedStatus,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      if (!upsertErr) saved = true
    } catch {}
  }

  // Fallback via authenticated SECURITY DEFINER RPC (works even without SUPABASE_SERVICE_ROLE_KEY)
  if (!saved) {
    const { error: rpcErr } = await supabase.rpc('submit_waitlist_onboarding', {
      p_phone: phone,
      p_role: role,
      p_role_other: roleOther,
      p_usage_type: usageType,
      p_team_size: teamSize,
      p_use_case: useCase,
      p_full_name: fullName,
    })

    if (rpcErr) {
      const missingTable = /relation|function|schema/i.test(rpcErr.message)
      return NextResponse.json(
        {
          error: missingTable
            ? 'Waitlist database setup required. Run WAITLIST_ACCESS_SQL.sql in Supabase SQL Editor.'
            : rpcErr.message || 'Could not save onboarding details.',
        },
        { status: 500 }
      )
    }
  }

  const state = await getWaitlistStateForUser(user, supabase)
  return NextResponse.json(
    { ok: true, state },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
