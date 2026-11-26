import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { isAdminUser } from '@/lib/security'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!isAdminUser(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminSupabase = await createAdminClient()

    // 1. Fetch real total registered users from Supabase Auth
    let totalUsers = 0
    try {
      const { data: usersData, error: usersError } = await adminSupabase.auth.admin.listUsers()
      if (!usersError && usersData && usersData.users) {
        totalUsers = usersData.users.length
      }
    } catch (e) {
      console.warn('Admin listUsers warning:', e)
    }

    // 2. Fetch real total computers & active running computers from 'machines' table
    const { data: machines, error: machinesError } = await adminSupabase
      .from('machines')
      .select('*')

    const totalComputers = machines ? machines.length : 0
    const activeComputers = machines ? machines.filter((m: any) => m.status === 'ready' || m.status === 'running').length : 0

    // If listUsers is restricted by DB policy, count unique user_ids from machines or active user
    if (totalUsers === 0 && machines) {
      const uniqueUsers = new Set(machines.map((m: any) => m.user_id).filter(Boolean))
      totalUsers = Math.max(uniqueUsers.size, 1)
    } else if (totalUsers === 0) {
      totalUsers = 1
    }

    // 3. Real revenue & MRR (0 if no active paid subscriptions exist)
    let totalRevenue = 0
    let mrr = 0
    try {
      const { data: subs } = await adminSupabase.from('subscriptions').select('*').eq('status', 'active')
      if (subs && subs.length > 0) {
        totalRevenue = subs.reduce((acc: number, s: any) => acc + (s.amount || 0), 0)
        mrr = subs.reduce((acc: number, s: any) => acc + (s.monthly_amount || 0), 0)
      }
    } catch (e) {
      totalRevenue = 0
      mrr = 0
    }

    return NextResponse.json({
      success: true,
      totalUsers,
      totalComputers,
      activeComputers,
      totalRevenue,
      mrr,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Failed to fetch real admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
}
