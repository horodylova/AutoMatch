import { NextResponse } from 'next/server'
import { incrementPollVote } from '@/lib/sheets'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { id: string; option: 'A' | 'B' }
    if (!body?.id || !body?.option) return NextResponse.json({ error: 'id and option required' }, { status: 400 })
    const opt = body.option === 'A' ? 1 : 2
    const enabled = !!process.env.GOOGLE_SHEETS_ID && !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    if (enabled) {
      await incrementPollVote(body.id, opt)
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
