import { getSheetData } from "@/lib/googleSheets";

const DEFAULT_HEADERS = [
  "ID",
  "Make",
  "Model",
  "Year",
  "Trim",
  "Trim (description)",
  "Base MSRP",
  "Base Invoice",
  "Colors exterior",
  "Colors interior",
  "Body type",
  "Doors",
  "Total seating",
  "Length (in)",
  "Width (in)",
  "Height (in)",
  "Wheelbase (in)",
  "Front track (in)",
  "Rear track (in)",
  "Ground clearance (in)",
  "Angle of approach (degrees)",
  "Angle of departure (degrees)",
  "Turning circle (ft)",
  "Drag coefficient (Cd)",
  "EPA interior volume (cu ft)",
  "Cargo capacity (cu ft)",
  "Maximum cargo capacity (cu ft)",
  "Curb weight (lbs)",
  "Gross weight (lbs)",
  "Maximum payload (lbs)",
  "Maximum towing capacity (lbs)",
  "Cylinders",
  "Engine size (l)",
  "Horsepower (HP)",
  "Horsepower (rpm)",
  "Torque (ft-lbs)",
  "Torque (rpm)",
  "Valves",
  "Valve timing",
  "Cam type",
  "Drive type",
  "Transmission",
  "Engine type",
  "Fuel type",
  "Fuel tank capacity (gal)",
  "EPA combined MPG",
  "EPA city/highway MPG",
  "Range in miles (city/hwy)",
  "EPA combined MPGe",
  "EPA city/highway MPGe",
  "EPA electricity range (mi)",
  "EPA kWh/100 mi",
  "EPA time to charge battery (at 240V) (hr)",
  "Battery capacity (kWh)",
  "Front head room (in)",
  "Front hip room (in)",
  "Front leg room (in)",
  "Front shoulder room (in)",
  "Rear head room (in)",
  "Rear hip room (in)",
  "Rear leg room (in)",
  "Rear shoulder room (in)",
  "Basic",
  "Drivetrain",
  "Roadside assistance",
  "Rust",
  "Source JSON",
  "Source URL",
  "Image URL",
  "Review",
  "Pros",
  "Cons",
  "What's new",
  "NHTSA Overall Rating",
  "Used price range",
  "Scorecard Overall",
  "Scorecard Driving",
  "Scorecard Confort",
  "Scorecard Interior",
  "Scorecard Utility",
  "Scorecard Technology",
  "Expert rating - Our verdict",
  "Expert rating - Performance",
  "Expert rating - Comfort",
  "Expert rating - Interior",
  "Expert rating - Technology",
  "Expert rating - Storage",
  "Expert rating - Fuel Economy",
  "Expert rating - Value",
  "Expert rating - Wildcard",
  "Old trim",
  "Old description",
  "Images URL",
  "Suspension",
  "Front seats",
  "Rear seats",
  "Power features",
  "Instrumentation",
  "Convenience",
  "Comfort",
  "Memorized settings",
  "In car entertainment",
  "Roof and glass",
  "Body",
  "Truck features",
  "Tires and wheels",
  "Doors",
  "Towing and hauling",
  "Safety features",
  "Packages",
  "Exterior options",
  "Interior options",
  "Mechanical options",
  "Country of origin",
  "Car classification",
  "Platform code / generation number",
];

export default async function Page() {
  const sheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";
  const range = process.env.SHEET_NAME || "DATABASE";
  const values = await getSheetData(sheetId, range);
  const headers = (values[1] || []).map(v => String(v ?? ""));
  const idx: Record<string, number> = {};
  headers.forEach((h, i) => { idx[h.trim().toLowerCase()] = i; });
  const mkIdx = idx["make"] ?? -1;
  const mdIdx = idx["model"] ?? -1;
  const yrIdx = idx["year"] ?? -1;
  const trIdx = idx["trim"] ?? -1;
  const targets = new Set([
    "bmw|3 series",
    "ford|f-150",
    "ford|f-150 lightning",
    "toyota|prius",
    "toyota|prius plug-in",
  ]);
  const body = values.slice(13);
  const rows = body.filter(r => {
    const mk = String(r[mkIdx] ?? "").trim().toLowerCase();
    const md = String(r[mdIdx] ?? "").trim().toLowerCase();
    const yr = Number(r[yrIdx] ?? "");
    return yr === 2024 && targets.has(`${mk}|${md}`);
  });
  return (
    <div>
      {rows.length === 0 ? (
        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>No data</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          {rows.map((row, i) => {
            const title = [String(row[mkIdx] ?? ""), String(row[mdIdx] ?? ""), String(row[yrIdx] ?? ""), String(row[trIdx] ?? "")]
              .map(v => v.trim())
              .filter(v => v.length > 0)
              .join(" ");
            return (
              <div key={i} style={{ border: "1px solid #ccc", borderRadius: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <div style={{ padding: 14, background: "#f7f7f7", borderBottom: "1px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{title || "Model"}</div>
                </div>
                <div style={{ padding: 14 }}>
                  <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <tbody>
                      {headers.map((h, j) => {
                        const val = row[j];
                        const text = String(val ?? "").trim();
                        if (!text) return null;
                        return (
                          <tr key={`${h}-${j}`}>
                            <td style={{ width: 280, borderBottom: "1px solid #eee", padding: 8, color: "#555" }}>{h}</td>
                            <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                              <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{text}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}