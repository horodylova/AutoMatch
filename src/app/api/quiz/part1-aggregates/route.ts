import { NextResponse } from "next/server";
import { google } from "googleapis";

const SHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
  process.env.GOOGLE_SHEETS_ID ||
  "";

const TAB = "quiz_part1_aggregates";

function sheetsConfigured(): boolean {
  const hasId = !!SHEET_ID;
  const hasB64 = !!process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  const hasPair =
    !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  return hasId && (hasB64 || hasPair);
}

function getAuth() {
  let clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "";
  let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "";
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  if (b64) {
    const json = JSON.parse(Buffer.from(b64, "base64").toString("utf8")) as {
      client_email?: string;
      private_key?: string;
    };
    clientEmail = json.client_email || clientEmail;
    privateKey = json.private_key || privateKey;
  }
  privateKey = privateKey.replace(/\\n/g, "\n");
  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function colLetter(n: number): string {
  let s = "";
  let x = n;
  while (x > 0) {
    const m = (x - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
}

const mapBudget: Record<string, string> = {
  under_35: "budget_under_35k",
  "35_60": "budget_35k_60k",
  "60_120": "budget_60k_120k",
  "120_200": "budget_120k_200k",
  "200_350": "budget_200k_350k",
  "350_plus": "budget_350k_plus",
  no_strict: "budget_no_strict_budget",
};

const mapTimeframe: Record<string, string> = {
  month: "timeframe_within_a_month",
  "1_3": "timeframe_1_3_months",
  "3_6": "timeframe_3_6_months",
  browsing: "timeframe_just_browsing",
};

const mapFinancing: Record<string, string> = {
  cash: "financing_cash",
  loan: "financing_loan",
  lease: "financing_lease",
  undecided: "financing_not_decided",
};

const mapTradein: Record<string, string> = {
  yes: "trade_in_yes",
  no: "trade_in_no",
  unsure: "trade_in_not_sure",
};

const mapReadiness: Record<string, string> = {
  exploring: "readiness_exploring",
  building: "readiness_building",
  buying: "readiness_buying",
};

export async function POST(req: Request) {
  try {
    if (!sheetsConfigured()) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    const body = (await req.json()) as {
      budget?: string;
      timeframe?: string;
      financing?: string;
      tradein?: string;
      readiness?: string;
    };

    const targetCols = [
      mapBudget[body.budget || ""],
      mapTimeframe[body.timeframe || ""],
      mapFinancing[body.financing || ""],
      mapTradein[body.tradein || ""],
      mapReadiness[body.readiness || ""],
    ].filter(Boolean) as string[];

    if (targetCols.length === 0) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const sheets = google.sheets({ version: "v4", auth: getAuth() });
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${TAB}!1:1`,
    });
    const headers = (headerRes.data.values?.[0] || []).map(v => String(v ?? "").trim());
    if (headers.length === 0) {
      return NextResponse.json({ error: "Missing headers row" }, { status: 500 });
    }

    const rowRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${TAB}!2:2`,
    });
    const row = (rowRes.data.values?.[0] || []) as Array<string | number>;

    const getNum = (i: number) => {
      const raw = row[i];
      const n = parseInt(String(raw ?? "0"), 10);
      return Number.isFinite(n) ? n : 0;
    };

    const nextRow: Array<string | number> = new Array(headers.length).fill("");
    for (let i = 0; i < headers.length; i++) {
      nextRow[i] = row[i] ?? "";
    }

    const idx = new Map(headers.map((h, i) => [h, i]));
    if (idx.has("Question ID")) nextRow[idx.get("Question ID")!] = String(nextRow[idx.get("Question ID")!] || "part1");
    if (idx.has("Question text")) nextRow[idx.get("Question text")!] = String(nextRow[idx.get("Question text")!] || "Part 1: Essentials");

    const totalIdx = idx.get("Total answers");
    if (typeof totalIdx === "number") {
      nextRow[totalIdx] = getNum(totalIdx) + 1;
    }

    for (const col of targetCols) {
      const i = idx.get(col);
      if (typeof i !== "number") continue;
      nextRow[i] = getNum(i) + 1;
    }

    const endCol = colLetter(headers.length);
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${TAB}!A2:${endCol}2`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [nextRow] },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

