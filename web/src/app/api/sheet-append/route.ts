import { NextResponse } from "next/server";
import { appendSheetValues } from "@/lib/googleSheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sheetId = body.id || process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";
    const range = body.range || process.env.SHEET_NAME || "EXPORT API";
    const values = body.values || [];
    if (!sheetId) {
      return NextResponse.json({ error: "Missing sheet ID" }, { status: 400 });
    }
    const res = await appendSheetValues(sheetId, range, values);
    return NextResponse.json({ result: res });
  } catch {
    return NextResponse.json({ error: "Failed to append data" }, { status: 500 });
  }
}