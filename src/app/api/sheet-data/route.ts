import { NextResponse } from "next/server";
import { getSheetData } from "@/lib/googleSheets";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sheetId = searchParams.get("id") || process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";
    const range = searchParams.get("range") || process.env.SHEET_NAME || "EXPORT API";
    if (!sheetId) {
      return NextResponse.json({ error: "Missing sheet ID" }, { status: 400 });
    }
    const data = await getSheetData(sheetId, range);
    return NextResponse.json({ data: { values: data } });
  } catch (error: unknown) {
    return NextResponse.json({ error: "Failed to fetch sheet data" }, { status: 500 });
  }
}
