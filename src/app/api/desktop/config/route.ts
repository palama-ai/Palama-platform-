import { NextResponse } from 'next/server'
import { getDesktopServerConfig } from '@/lib/desktop-config'

export const dynamic = 'force-dynamic'

/**
 * GET /api/desktop/config — server-managed weekly quota, blocked versions,
 * min supported version, and optional extra models for Palama Desktop.
 */
export async function GET() {
  const cfg = await getDesktopServerConfig(false)
  return NextResponse.json(cfg)
}
