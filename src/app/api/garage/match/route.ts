import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSheetData } from "@/lib/googleSheets";
import { buildGarageMatch } from "@/utils/dream-garage";
import { parseCarData, type Row, hasRealImage } from "@/utils/carScoring";
import type { DreamGarageBay } from "@/types/dream-garage";

type DatasetPayload = {
  headers: string[];
  rows: Row[];
  idx: Record<string, number>;
};

function buildIndex(headers: string[]) {
  const idx: Record<string, number> = {};
  headers.forEach((header, index) => {
    idx[header.toLowerCase()] = index;
  });
  return idx;
}

async function loadNeonDataset(): Promise<DatasetPayload> {
  const cols = await prisma.$queryRawUnsafe<Array<{ column_name: string }>>(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'teo' AND table_name = 'teo_cars' ORDER BY ordinal_position"
  );

  const headers = cols.map((col) => col.column_name);
  const quoted = headers.map((header) => `"${header.replace(/"/g, "\"\"")}"`).join(", ");
  const sql = `SELECT ${quoted} FROM teo.teo_cars`;
  const rowsRaw = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(sql);
  const rows = rowsRaw.map((row) => headers.map((header) => (row[header] ?? null) as Row[number]));

  return {
    headers,
    rows,
    idx: buildIndex(headers),
  };
}

async function loadSheetDataset(): Promise<DatasetPayload> {
  const sheetId = process.env.NEXT_PUBLIC_SHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";
  const range = process.env.NEXT_PUBLIC_SHEET_RANGE || process.env.SHEET_NAME || "DATABASE";

  if (!sheetId) {
    throw new Error("Missing Google Sheet configuration.");
  }

  const values = await getSheetData(sheetId, range);
  const headers = (values[1] || []).map((value) => String(value ?? "").trim());
  const rows = values.slice(4) as Row[];

  return {
    headers,
    rows,
    idx: buildIndex(headers),
  };
}

async function loadCars() {
  const source = process.env.CARS_SOURCE || "";
  const dataset = source === "neon" ? await loadNeonDataset() : await loadSheetDataset();
  return dataset.rows
    .map((row) => parseCarData(row, dataset.idx))
    .filter((car) => car.id && car.baseMsrp > 0 && hasRealImage(car));
}

function isRole(value: string): value is DreamGarageBay["role"] {
  return ["daily", "hauler", "thrill", "statement", "explorer", "project"].includes(value);
}

function parseBays(value: unknown): DreamGarageBay[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      const record = item as Record<string, unknown>;
      const role = String(record.role ?? "");
      const allocationPct = Number(record.allocationPct ?? 0);
      const id = String(record.id ?? `bay-${index + 1}`);
      if (!isRole(role) || !Number.isFinite(allocationPct)) return null;
      return {
        id,
        role,
        allocationPct,
      };
    })
    .filter((bay): bay is DreamGarageBay => Boolean(bay));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      totalBudget?: number;
      bays?: unknown;
    };

    const totalBudget = Number(body.totalBudget ?? 0);
    const bays = parseBays(body.bays);

    if (!Number.isFinite(totalBudget) || totalBudget <= 0) {
      return NextResponse.json({ error: "Invalid total budget." }, { status: 400 });
    }

    if (bays.length < 2 || bays.length > 5) {
      return NextResponse.json({ error: "Dream Garage needs between 2 and 5 bays." }, { status: 400 });
    }

    const cars = await loadCars();
    const response = buildGarageMatch(cars, totalBudget, bays);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
