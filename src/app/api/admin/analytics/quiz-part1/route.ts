import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { google } from "googleapis";

const SHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
  process.env.GOOGLE_SHEETS_ID ||
  "";

const TOTALS_TAB = "quiz_part1_aggregates";
const DAILY_TAB = "quiz_part1_daily";

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

function normalizeDate(s: string | null): string | null {
  if (!s) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return s;
}

function parseNum(v: unknown): number {
  const n = parseInt(String(v ?? "0"), 10);
  return Number.isFinite(n) ? n : 0;
}

function buildResponse(headers: string[], values: Array<string | number>) {
  const idx = new Map(headers.map((h, i) => [h, i]));
  const totalAnswers = parseNum(values[idx.get("Total answers") ?? -1]);

  const Q = [
    {
      id: "budget",
      title: "Budget",
      opts: [
        ["budget_under_35k", "Under $35k"],
        ["budget_35k_60k", "$35k–$60k"],
        ["budget_60k_120k", "$60k–$120k"],
        ["budget_120k_200k", "$120k–$200k"],
        ["budget_200k_350k", "$200k–$350k"],
        ["budget_350k_plus", "$350k+"],
        ["budget_no_strict_budget", "No strict budget"],
      ],
    },
    {
      id: "timeframe",
      title: "Timeframe",
      opts: [
        ["timeframe_within_a_month", "Within a month"],
        ["timeframe_1_3_months", "1–3 months"],
        ["timeframe_3_6_months", "3–6 months"],
        ["timeframe_just_browsing", "Just browsing"],
      ],
    },
    {
      id: "financing",
      title: "Financing",
      opts: [
        ["financing_cash", "Cash"],
        ["financing_loan", "Loan"],
        ["financing_lease", "Lease"],
        ["financing_not_decided", "Not decided"],
      ],
    },
    {
      id: "trade_in",
      title: "Trade‑in",
      opts: [
        ["trade_in_yes", "Yes"],
        ["trade_in_no", "No"],
        ["trade_in_not_sure", "Not sure"],
      ],
    },
    {
      id: "readiness",
      title: "Readiness",
      opts: [
        ["readiness_exploring", "Exploring"],
        ["readiness_building", "Building"],
        ["readiness_buying", "Buying"],
      ],
    },
  ] as const;

  return {
    totalAnswers,
    questions: Q.map((q) => {
      const options = q.opts.map(([key, label]) => {
        const c = parseNum(values[idx.get(key) ?? -1]);
        const pct = totalAnswers > 0 ? c / totalAnswers : 0;
        return { key, label, count: c, pct };
      });
      return { id: q.id, title: q.title, options };
    }),
  };
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!sheetsConfigured()) {
    return NextResponse.json({ error: "Sheets not configured" }, { status: 500 });
  }

  const url = new URL(req.url);
  const start = normalizeDate(url.searchParams.get("start"));
  const end = normalizeDate(url.searchParams.get("end"));

  const sheets = google.sheets({ version: "v4", auth: getAuth() });

  const totalsHeadersRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${TOTALS_TAB}!1:1`,
  });
  const headers = (totalsHeadersRes.data.values?.[0] || []).map(v => String(v ?? "").trim());
  if (headers.length === 0) {
    return NextResponse.json({ error: "Missing headers row" }, { status: 500 });
  }

  const tryDaily = async () => {
    if (!start || !end) return null;
    try {
      const dailyRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${DAILY_TAB}!A:ZZ`,
      });
      const values = dailyRes.data.values || [];
      if (values.length < 2) return null;
      const dailyHeaders = (values[0] || []).map(v => String(v ?? "").trim());
      const dateIdx = dailyHeaders.findIndex(h => h.toLowerCase() === "date");
      if (dateIdx < 0) return null;
      const idx = new Map(dailyHeaders.map((h, i) => [h, i]));
      const sums: Array<string | number> = new Array(headers.length).fill(0);
      for (let i = 0; i < headers.length; i++) {
        const h = headers[i];
        const di = idx.get(h);
        sums[i] = typeof di === "number" ? 0 : 0;
      }
      for (let r = 1; r < values.length; r++) {
        const row = values[r] || [];
        const d = String(row[dateIdx] ?? "").trim();
        if (!d) continue;
        if (d < start || d > end) continue;
        for (let i = 0; i < headers.length; i++) {
          const h = headers[i];
          const di = idx.get(h);
          if (typeof di !== "number") continue;
          sums[i] = parseNum(sums[i]) + parseNum(row[di]);
        }
      }
      return sums.map(v => (typeof v === "number" ? v : parseNum(v)));
    } catch {
      return null;
    }
  };

  const dailyAgg = await tryDaily();
  if (dailyAgg) {
    const out = buildResponse(headers, dailyAgg);
    return NextResponse.json({ start, end, ...out });
  }

  const totalsRowRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${TOTALS_TAB}!2:2`,
  });
  const totalsRow = (totalsRowRes.data.values?.[0] || []) as Array<string | number>;
  const padded: Array<string | number> = new Array(headers.length).fill(0);
  for (let i = 0; i < headers.length; i++) padded[i] = totalsRow[i] ?? 0;

  const out = buildResponse(headers, padded);
  return NextResponse.json({ start, end, ...out });
}

