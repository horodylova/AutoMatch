import { getSheetData } from "@/lib/googleSheets";

export default async function Page() {
  const sheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";
  const range = process.env.SHEET_NAME || "DATABASE";
  const values = await getSheetData(sheetId, range);

  let headerRowIndex = 0;
  let makeIdx = -1;
  let modelIdx = -1;

  for (let i = 0; i < Math.min(10, values.length); i++) {
    const row = (values[i] || []).map(v => (v ?? "").toString());
    const mi = row.findIndex(v => v === "Basic.1" || v === "Make");
    const mo = row.findIndex(v => v === "Basic.2" || v === "Model");
    if (mi !== -1 && mo !== -1) {
      headerRowIndex = i;
      makeIdx = mi;
      modelIdx = mo;
      break;
    }
  }

  if (makeIdx === -1 || modelIdx === -1) {
    const row = (values[headerRowIndex] || []).map(v => (v ?? "").toString());
    makeIdx = row.findIndex(v => v.toLowerCase() === "make");
    modelIdx = row.findIndex(v => v.toLowerCase() === "model");
  }

  const brandCounts = new Map<string, number>();
  const brandModelCounts = new Map<string, Map<string, number>>();

  const isValid = (s: string) => {
    if (!s) return false;
    const t = s.trim();
    if (!t) return false;
    if (/^[-+]?\d+(\.\d+)?$/.test(t)) return false;
    if (/\%$/.test(t)) return false;
    return true;
  };

  for (let i = headerRowIndex + 1; i < values.length; i++) {
    const row = values[i] as (string | number | boolean | null)[];
    const make = (row[makeIdx] ?? "").toString().trim();
    const model = (row[modelIdx] ?? "").toString().trim();
    if (isValid(make)) {
      brandCounts.set(make, (brandCounts.get(make) || 0) + 1);
      if (isValid(model)) {
        const models = brandModelCounts.get(make) || new Map<string, number>();
        models.set(model, (models.get(model) || 0) + 1);
        brandModelCounts.set(make, models);
      }
    }
  }

  const brandRows = Array.from(brandCounts.entries()).sort((a, b) => b[1] - a[1]);
  const modelRows: { make: string; model: string; count: number }[] = [];
  for (const [make, models] of brandModelCounts.entries()) {
    for (const [model, count] of models.entries()) {
      modelRows.push({ make, model, count });
    }
  }
  modelRows.sort((a, b) => (a.make === b.make ? b.count - a.count : a.make.localeCompare(b.make)));

  return (
    <div className="container">
      <h1>Dataset stats</h1>

      <h2>Brands</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Brand</th>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>Count</th>
          </tr>
        </thead>
        <tbody>
          {brandRows.map(([make, count]) => (
            <tr key={make}>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{make}</td>
              <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 24 }}>Models by brand</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Brand</th>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Model</th>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>Count</th>
          </tr>
        </thead>
        <tbody>
          {modelRows.map((row) => (
            <tr key={`${row.make}:${row.model}`}>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.make}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.model}</td>
              <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}