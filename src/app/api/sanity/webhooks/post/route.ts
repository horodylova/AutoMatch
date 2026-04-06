import { NextResponse } from 'next/server'
import { ensurePollRow, sheetsConfigured } from '@/lib/sheets'
import { client } from '@/lib/sanity'

type PollBlock = { _type: 'poll'; _key?: string; question: string }

export async function POST(req: Request) {
  try {
    const secret = process.env.SANITY_WEBHOOK_SECRET || ''
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('secret') || ''
    if (secret && token !== secret) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
    if (!sheetsConfigured()) {
      return NextResponse.json({ ok: true, note: 'sheets not configured' })
    }
    const body = (await req.json()) as { _id?: string; slug?: { current?: string } | string; body?: unknown }
    // Accept either full document or { _id, slug }
    let slug: string | undefined =
      typeof body?.slug === 'string' ? body.slug : (body?.slug as { current?: string })?.current
    let blocks = body?.body as unknown
    if ((!slug || !Array.isArray(blocks)) && body?._id) {
      const doc = await client.fetch(`*[_id == $id][0]{ "slug": slug.current, body }`, { id: body._id })
      slug = slug || doc?.slug
      blocks = Array.isArray(blocks) ? blocks : doc?.body
    }
    if (!slug || !Array.isArray(blocks as unknown[])) {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
    }
    const polls = (blocks as unknown[]).filter((b) => {
      const x = b as Record<string, unknown>
      return x?._type === 'poll' && typeof x?.question === 'string'
    }) as unknown as PollBlock[]
    for (const p of polls) {
      const idBase = p._key || (p.question || '').slice(0, 24)
      const id = `${slug}:${idBase}`
      await ensurePollRow(id, p.question || '')
    }
    return NextResponse.json({ ok: true, count: polls.length })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
