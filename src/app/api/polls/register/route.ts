import { NextResponse } from 'next/server'
import { ensurePollRow, sheetsConfigured } from '@/lib/sheets'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { id: string; question: string }
    if (!body?.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    if (sheetsConfigured()) {
      await ensurePollRow(body.id, body.question || '')
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
