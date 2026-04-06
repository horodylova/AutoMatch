import { NextResponse } from 'next/server'
import { ensurePollRow } from '@/lib/sheets'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { id: string; question: string }
    if (!body?.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const enabled = !!process.env.GOOGLE_SHEETS_ID && !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    if (enabled) {
      await ensurePollRow(body.id, body.question || '')
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
