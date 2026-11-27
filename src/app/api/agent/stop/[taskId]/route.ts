import { NextRequest, NextResponse } from 'next/server'
import { resolveGatewayCaller, resolveOwnerId } from '@/lib/gateway'
import { getConfiguredInternalKey, isSafeTaskId } from '@/lib/security'
import { assertApprovedAccess } from '@/lib/waitlist'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const caller = await resolveGatewayCaller(request)
  const ownerId = caller ? resolveOwnerId(caller) : null
  if (!caller || !ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const access = await assertApprovedAccess(ownerId)
  if (!access.allowed) {
    return NextResponse.json({ error: access.message, code: access.code }, { status: access.httpStatus })
  }

  const { taskId } = await params
  if (!isSafeTaskId(taskId)) {
    return NextResponse.json({ error: 'Invalid taskId' }, { status: 400 })
  }

  const agentUrl = (process.env.PALAMA_AGENT_URL || 'http://localhost:8001').replace(/\/+$/, '')
  const headers: Record<string, string> = {}
  const authHeader = request.headers.get('authorization')
  const internalKey = getConfiguredInternalKey()
  if (authHeader) headers['Authorization'] = authHeader
  else if (internalKey) headers['Authorization'] = `Bearer ${internalKey}`

  try {
    const agentResponse = await fetch(
      `${agentUrl}/api/v1/agent/stop/${encodeURIComponent(taskId)}`,
      { method: 'POST', headers }
    )

    if (!agentResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to stop agent task' },
        { status: agentResponse.status }
      )
    }

    const result = await agentResponse.json()
    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Stop agent error:', error)
    return NextResponse.json(
      { error: 'Failed to stop agent' },
      { status: 500 }
    )
  }
}
