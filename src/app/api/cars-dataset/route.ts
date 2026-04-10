import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get column names in creation order
    const cols = await prisma.$queryRawUnsafe<Array<{ column_name: string }>>(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'teo' AND table_name = 'teo_cars' ORDER BY ordinal_position"
    );

    const headers = cols.map(c => c.column_name);
    if (headers.length === 0) {
      return NextResponse.json({ error: "No columns found for teo.teo_cars" }, { status: 500 });
    }

    // Build a SELECT "col1","col2",...
    const quoted = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(", ");
    const sql = `SELECT ${quoted} FROM teo.teo_cars`;
    const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(sql);

    const result = {
      headers,
      rows: rows.map(r => headers.map(h => (r as Record<string, unknown>)[h] ?? null)),
      idx: Object.fromEntries(headers.map((h, i) => [h.toLowerCase(), i])),
    };

    const res = NextResponse.json({ data: result });
    res.headers.set("Cache-Control", "public, s-maxage=180, stale-while-revalidate=300");
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
