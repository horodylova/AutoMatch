import { NextResponse } from "next/server";
import { appendSheetValues } from "@/lib/googleSheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Feedback API received body:", body);
    
    const { rating, comment } = body;

    if (!rating) {
      console.error("Feedback API: Rating is missing");
      return NextResponse.json({ error: "Rating is required" }, { status: 400 });
    }

  
    const sheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    
    if (!sheetId) {
      console.error("Feedback API: Missing GOOGLE_SHEETS_SPREADSHEET_ID");
      return NextResponse.json({ error: "Server configuration error: Missing Sheet ID" }, { status: 500 });
    }

 
    const range = "Feedback!A:C"; 

    const now = new Date();
 
    const dateStr = now.toLocaleString("en-US", { 
      timeZone: "America/New_York",
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const values = [[
      dateStr, 
      rating, 
      comment || ""
    ]];

    console.log(`Feedback API: Appending to Sheet ID: ${sheetId.substring(0, 5)}...`);
    console.log(`Feedback API: Range: ${range}`);
    console.log(`Feedback API: Values:`, values);

    const result = await appendSheetValues(sheetId, range, values);
    
    console.log("Feedback API: Append success", result);

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    console.error("Feedback API: Error saving feedback:", error);
    
    const err = error as { message?: string; response?: { data: unknown } };

  
    if (err?.response) {
       console.error("Feedback API: Google Error Response:", err.response.data);
    }
    
    return NextResponse.json({ 
      error: "Failed to save feedback", 
      details: err?.message || String(error)
    }, { status: 500 });
  }
}
