import { NextResponse } from "next/server";
import { getSheetInfo } from "@/lib/googleSheets";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const spreadsheetId = searchParams.get("id");
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Spreadsheet ID is required" }, { status: 400 });
    }
    const info = await getSheetInfo(spreadsheetId);
    return NextResponse.json({
      title: info.properties?.title || "Untitled Sheet",
      sheets: (info.sheets || []).map(s => s.properties?.title),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch sheet info" }, { status: 500 });
  }
}