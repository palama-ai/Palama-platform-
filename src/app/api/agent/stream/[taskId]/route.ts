import { NextRequest } from 'next/server'
import { resolveGatewayCaller, resolveOwnerId } from '@/lib/gateway'
import { getConfiguredInternalKey, isSafeTaskId } from '@/lib/security'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const caller = await resolveGatewayCaller(request)
  const ownerId = caller ? resolveOwnerId(caller) : null
  if (!caller || !ownerId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { taskId } = await params
  if (!isSafeTaskId(taskId)) {
    return new Response(JSON.stringify({ error: 'Invalid taskId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Never trust client-supplied control_url (prevents SSRF & INTERNAL_API_KEY exfiltration)
  const agentUrl = (process.env.PALAMA_AGENT_URL || 'http://localhost:8001').replace(/\/+$/, '')
  const internalKey = getConfiguredInternalKey()
  const headers: Record<string, string> = { Accept: 'text/event-stream' }
  const authHeader = request.headers.get('authorization')
  if (authHeader) headers['Authorization'] = authHeader
  else if (internalKey) headers['Authorization'] = `Bearer ${internalKey}`

  try {
    // Proxy SSE stream from Agent Engine to browser
    const agentResponse = await fetch(
      `${agentUrl}/api/v1/agent/stream/${encodeURIComponent(taskId)}`,
      {
        headers,
        // @ts-ignore — needed for streaming
        cache: 'no-store',
      }
    )

    if (!agentResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Stream not found' }),
        { status: agentResponse.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create a TransformStream to proxy the SSE
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()
    const reader = agentResponse.body?.getReader()

    if (!reader) {
      return new Response(
        JSON.stringify({ error: 'No stream body' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Pipe in background
    ;(async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          await writer.write(value)
        }
      } catch {
        // Client disconnected or stream ended
      } finally {
        try { writer.close() } catch {}
      }
    })()

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to connect to agent stream' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
