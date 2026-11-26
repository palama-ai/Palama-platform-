import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/server'
import { getConfiguredInternalKey, isUuid, timingSafeEqualStr } from '@/lib/security'

export async function POST(request: Request) {
  try {
    // 1. Verify Internal API Key (fail closed if unset or placeholder)
    const internalApiKey = getConfiguredInternalKey()
    if (!internalApiKey) {
      return NextResponse.json({ error: 'Webhook authentication not configured' }, { status: 503 })
    }
    const incomingApiKey = (request.headers.get('X-Internal-API-Key') || '').trim()
    if (!incomingApiKey || !timingSafeEqualStr(incomingApiKey, internalApiKey)) {
      console.warn('Unauthorized webhook access attempt.')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse Webhook payload
    const rawBody = await request.text()
    if (!rawBody || rawBody.trim() === '') {
      return NextResponse.json({ error: 'Empty body' }, { status: 400 })
    }

    let body
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { machine_id, status, ip_address } = body

    if (!isUuid(machine_id) || typeof status !== 'string' || !status.trim()) {
      return NextResponse.json({ error: 'Invalid machine_id or status' }, { status: 400 })
    }

    console.log(`Received webhook for machine ${machine_id} with status ${status}`)

    // 3. Update database using Admin client to bypass RLS
    const supabase = await createAdminClient()

    const { error: updateError } = await supabase
      .from('machines')
      .update({
        status,
        ip_address: ip_address || null,
      })
      .eq('id', machine_id)

    if (updateError) {
      console.error('Failed to update machine in Supabase:', updateError)
      return NextResponse.json({ error: 'Failed to update machine state' }, { status: 500 })
    }

    return NextResponse.json({ received: true, machine_id, status })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
