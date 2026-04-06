import { NextResponse } from 'next/server'
import { incrementPollVote, sheetsConfigured } from '@/lib/sheets'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { id: string; option: 'A' | 'B' }
    if (!body?.id || !body?.option) return NextResponse.json({ error: 'id and option required' }, { status: 400 })
    const opt = body.option === 'A' ? 1 : 2
    if (sheetsConfigured()) {
      await incrementPollVote(body.id, opt)
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
