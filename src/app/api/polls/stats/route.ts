import { NextResponse } from 'next/server'
import { getPollTotals, sheetsConfigured } from '@/lib/sheets'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id') || ''
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const totals = sheetsConfigured() ? await getPollTotals(id) : { c1: 0, c2: 0, total: 0 }
    return NextResponse.json({ totals: totals || { c1: 0, c2: 0, total: 0 } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
