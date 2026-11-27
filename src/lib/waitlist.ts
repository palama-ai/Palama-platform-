import { createAdminClient, createClient } from '@/utils/supabase/server'
import { isAdminUser, isUuid } from '@/lib/security'

export type WaitlistStatus = 'pending' | 'approved' | 'rejected'

export type WaitlistProfile = {
  full_name?: string | null
  phone?: string | null
  role?: string | null
  role_other?: string | null
  usage_type?: 'solo' | 'team' | null
  team_size?: string | null
  use_case?: string | null
  approved_at?: string | null
  created_at?: string | null
}

export type WaitlistState = {
  authenticated: boolean
  userId: string | null
  email: string | null
  emailVerified: boolean
  onboardingCompleted: boolean
  status: WaitlistStatus
  approved: boolean
  isAdmin: boolean
  profile: WaitlistProfile | null
}

export const ONBOARDING_ROLES = [
  { id: 'creator', label: 'Content Creator', desc: 'Video, writing, social media & storytelling' },
  { id: 'developer', label: 'Developer / Engineer', desc: 'Coding, debugging, DevOps & automation' },
  { id: 'designer', label: 'Designer / Creative', desc: 'Product design, UI/UX & visual workflows' },
  { id: 'researcher', label: 'Researcher / Analyst', desc: 'Data analysis, synthesis & deep research' },
  { id: 'founder', label: 'Founder / Executive', desc: 'Company operations, strategy & growth' },
  { id: 'marketing', label: 'Marketing / Sales', desc: 'Campaigns, outreach & content pipelines' },
  { id: 'operations', label: 'Product / Operations', desc: 'Project coordination, docs & execution' },
  { id: 'student', label: 'Student / Educator', desc: 'Learning, teaching & academic projects' },
  { id: 'other', label: 'Other', desc: 'Something else' },
] as const

export const ALLOWED_ROLE_IDS = new Set<string>(ONBOARDING_ROLES.map((r) => r.id))
export const ALLOWED_TEAM_SIZES = new Set<string>(['2-5', '6-20', '21-50', '50+'])

export function isUserEmailVerified(user: { email_confirmed_at?: string | null; confirmed_at?: string | null } | null | undefined): boolean {
  if (!user) return false
  return Boolean(user.email_confirmed_at || user.confirmed_at)
}

async function getOptionalAdminClient() {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return null
    }
    return await createAdminClient()
  } catch {
    return null
  }
}

function normalizeStatus(raw: unknown): WaitlistStatus {
  if (raw === 'approved' || raw === 'rejected' || raw === 'pending') return raw
  return 'pending'
}

function fallbackUnapproved(userId: string | null, emailVerified = false, email: string | null = null): WaitlistState {
  return {
    authenticated: Boolean(userId),
    userId,
    email,
    emailVerified,
    onboardingCompleted: false,
    status: 'pending',
    approved: false,
    isAdmin: false,
    profile: null,
  }
}

/**
 * Authoritative server-side lookup of a user's verification, onboarding & waitlist status.
 * NEVER trusts user_metadata or client state; fails closed to pending on DB error.
 */
export async function getWaitlistStateForUser(
  user: {
    id: string
    email?: string | null
    email_confirmed_at?: string | null
    confirmed_at?: string | null
    app_metadata?: Record<string, any>
    user_metadata?: Record<string, any>
  },
  supabaseWithUser?: Awaited<ReturnType<typeof createClient>> | null
): Promise<WaitlistState> {
  const emailVerified = isUserEmailVerified(user)
  const adminFlag = isAdminUser(user)
  if (adminFlag) {
    return {
      authenticated: true,
      userId: user.id,
      email: user.email || null,
      emailVerified: true,
      onboardingCompleted: true,
      status: 'approved',
      approved: true,
      isAdmin: true,
      profile: {
        full_name: user.user_metadata?.full_name || null,
      },
    }
  }

  // 1. Admin service-role direct check (authoritative)
  const adminClient = await getOptionalAdminClient()
  if (adminClient) {
    try {
      const { data: row, error } = await adminClient
        .from('waitlist_access')
        .select('email, full_name, phone, role, role_other, usage_type, team_size, use_case, onboarding_completed, status, approved_at, created_at')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!error && row) {
        const status = normalizeStatus(row.status)
        const onboardingCompleted = Boolean(row.onboarding_completed)
        return {
          authenticated: true,
          userId: user.id,
          email: row.email || user.email || null,
          emailVerified,
          onboardingCompleted,
          status,
          approved: emailVerified && status === 'approved',
          isAdmin: false,
          profile: {
            full_name: row.full_name,
            phone: row.phone,
            role: row.role,
            role_other: row.role_other,
            usage_type: row.usage_type === 'team' ? 'team' : 'solo',
            team_size: row.team_size,
            use_case: row.use_case,
            approved_at: row.approved_at,
            created_at: row.created_at,
          },
        }
      }
      if (!error && !row) {
        const metaStatus = normalizeStatus(user.app_metadata?.waitlist_status)
        return {
          authenticated: true,
          userId: user.id,
          email: user.email || null,
          emailVerified,
          onboardingCompleted: false,
          status: metaStatus,
          approved: emailVerified && metaStatus === 'approved',
          isAdmin: false,
          profile: null,
        }
      }
    } catch {}
  }

  // 2. Fallback via authenticated RPC + direct RLS SELECT
  const client = supabaseWithUser || (await createClient().catch(() => null))
  if (client) {
    try {
      const { data: rpcData, error: rpcErr } = await client.rpc('get_my_waitlist_state')
      if (!rpcErr && rpcData && typeof rpcData === 'object' && rpcData.authenticated) {
        const status = normalizeStatus((rpcData as any).status)
        const onboardingCompleted = Boolean((rpcData as any).onboarding_completed)
        const confirmed = Boolean((rpcData as any).email_confirmed ?? emailVerified)
        return {
          authenticated: true,
          userId: user.id,
          email: (rpcData as any).email || user.email || null,
          emailVerified: confirmed,
          onboardingCompleted,
          status,
          approved: confirmed && status === 'approved',
          isAdmin: false,
          profile: (rpcData as any).profile || null,
        }
      }
    } catch {}

    try {
      const { data: ownRow, error: rowErr } = await client
        .from('waitlist_access')
        .select('email, full_name, phone, role, role_other, usage_type, team_size, use_case, onboarding_completed, status, approved_at, created_at')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!rowErr) {
        const status = ownRow ? normalizeStatus(ownRow.status) : normalizeStatus(user.app_metadata?.waitlist_status)
        const onboardingCompleted = Boolean(ownRow?.onboarding_completed)
        return {
          authenticated: true,
          userId: user.id,
          email: ownRow?.email || user.email || null,
          emailVerified,
          onboardingCompleted,
          status,
          approved: emailVerified && status === 'approved',
          isAdmin: false,
          profile: ownRow
            ? {
                full_name: ownRow.full_name,
                phone: ownRow.phone,
                role: ownRow.role,
                role_other: ownRow.role_other,
                usage_type: ownRow.usage_type === 'team' ? 'team' : 'solo',
                team_size: ownRow.team_size,
                use_case: ownRow.use_case,
                approved_at: ownRow.approved_at,
                created_at: ownRow.created_at,
              }
            : null,
        }
      }
    } catch {}
  }

  // 3. Immutable app_metadata fallback (still fails closed unless explicitly 'approved')
  const metaStatus = normalizeStatus(user.app_metadata?.waitlist_status)
  if (emailVerified && metaStatus === 'approved') {
    return {
      authenticated: true,
      userId: user.id,
      email: user.email || null,
      emailVerified: true,
      onboardingCompleted: true,
      status: 'approved',
      approved: true,
      isAdmin: false,
      profile: null,
    }
  }

  return fallbackUnapproved(user.id, emailVerified, user.email || null)
}

/**
 * Resolve verification & waitlist state by owner UUID only (used for sk-palama-... API keys
 * and desktop engine X-Palama-Owner callers where no cookie session exists).
 */
export async function getWaitlistStateByOwnerId(ownerId: string): Promise<WaitlistState> {
  if (!isUuid(ownerId)) {
    return fallbackUnapproved(null, false, null)
  }

  const adminClient = await getOptionalAdminClient()
  if (adminClient) {
    try {
      const { data: userRes, error: uErr } = await adminClient.auth.admin.getUserById(ownerId)
      if (!uErr && userRes?.user) {
        return getWaitlistStateForUser(userRes.user)
      }
    } catch {}
  }

  const client = await createClient().catch(() => null)
  if (client) {
    try {
      const { data, error } = await client.rpc('is_waitlist_approved', { p_user_id: ownerId })
      const row = Array.isArray(data) ? data[0] : data
      if (!error && row) {
        const emailVerified = Boolean(row.email_confirmed)
        const onboardingCompleted = Boolean(row.onboarding_completed)
        const status = normalizeStatus(row.waitlist_status)
        return {
          authenticated: true,
          userId: ownerId,
          email: null,
          emailVerified,
          onboardingCompleted,
          status,
          approved: emailVerified && status === 'approved',
          isAdmin: false,
          profile: null,
        }
      }
    } catch {}
  }

  return fallbackUnapproved(ownerId, false, null)
}

export type AccessCheckResult =
  | { allowed: true; state: WaitlistState }
  | {
      allowed: false
      httpStatus: number
      code: 'EMAIL_NOT_VERIFIED' | 'ONBOARDING_REQUIRED' | 'WAITLIST_PENDING' | 'WAITLIST_REJECTED'
      message: string
      state: WaitlistState
    }

/**
 * Enforces:
 * 1) Verified email (`email_confirmed_at`)
 * 2) Admin approval (`status === 'approved'` or `isAdmin`)
 * Waitlisted, unverified, or un-onboarded users are blocked with 403.
 */
export async function assertApprovedAccess(
  ownerId: string,
  knownUser?: Parameters<typeof getWaitlistStateForUser>[0] | null
): Promise<AccessCheckResult> {
  const state = knownUser
    ? await getWaitlistStateForUser(knownUser)
    : await getWaitlistStateByOwnerId(ownerId)

  if (state.isAdmin) {
    return { allowed: true, state }
  }

  if (!state.emailVerified) {
    return {
      allowed: false,
      httpStatus: 403,
      code: 'EMAIL_NOT_VERIFIED',
      message: 'Account verification required: please confirm your email link before using Palama.',
      state,
    }
  }

  if (state.status === 'rejected') {
    return {
      allowed: false,
      httpStatus: 403,
      code: 'WAITLIST_REJECTED',
      message: 'Your waitlist application was not approved for this wave.',
      state,
    }
  }

  if (state.status !== 'approved') {
    if (!state.onboardingCompleted) {
      return {
        allowed: false,
        httpStatus: 403,
        code: 'ONBOARDING_REQUIRED',
        message: 'Please finish your onboarding questions to complete your waitlist registration.',
        state,
      }
    }
    return {
      allowed: false,
      httpStatus: 403,
      code: 'WAITLIST_PENDING',
      message: "You're currently on the Palama waitlist. We will notify you on your computer once accepted.",
      state,
    }
  }

  return { allowed: true, state }
}

export function validateOnboardingPayload(raw: any):
  | {
      ok: true
      data: {
        phone: string
        role: string
        roleOther: string | null
        usageType: 'solo' | 'team'
        teamSize: string | null
        useCase: string | null
        fullName: string | null
      }
    }
  | { ok: false; error: string } {
  const phone = String(raw?.phone || '').trim()
  const digits = phone.replace(/[^\d]/g, '')
  if (digits.length < 7 || digits.length > 16 || !/^[+\d()\s.-]{7,24}$/.test(phone)) {
    return { ok: false, error: 'Please enter a valid phone number (with country code).' }
  }

  const role = String(raw?.role || '').trim().toLowerCase()
  if (!ALLOWED_ROLE_IDS.has(role)) {
    return { ok: false, error: 'Please select what best describes your role.' }
  }

  const roleOtherRaw = String(raw?.roleOther || '').trim().slice(0, 80)
  if (role === 'other' && roleOtherRaw.length < 2) {
    return { ok: false, error: 'Please describe your role.' }
  }

  const usageType = raw?.usageType === 'team' ? 'team' : raw?.usageType === 'solo' ? 'solo' : null
  if (!usageType) {
    return { ok: false, error: 'Please choose whether you will use Palama solo or with a team.' }
  }

  let teamSize: string | null = null
  if (usageType === 'team') {
    const rawSize = String(raw?.teamSize || '').trim()
    teamSize = ALLOWED_TEAM_SIZES.has(rawSize) ? rawSize : '2-5'
  }

  const useCase = String(raw?.useCase || '').trim().slice(0, 500) || null
  const fullName = String(raw?.fullName || '').trim().slice(0, 100) || null

  return {
    ok: true,
    data: {
      phone,
      role,
      roleOther: role === 'other' ? roleOtherRaw : null,
      usageType,
      teamSize,
      useCase,
      fullName,
    },
  }
}
