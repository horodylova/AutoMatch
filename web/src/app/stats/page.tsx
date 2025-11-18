// app/autodev/page.tsx
import { fetchListingsByYearRangeWithMeta, fetchListingByVin, decodeVin, type ListingItem } from "@/lib/autoDev";

type SearchParams = {
  startYear?: string;
  endYear?: string;
  limit?: string;
  pages?: string;
  testVin?: string;
};

export default async function Page({ searchParams }: { searchParams?: SearchParams | Promise<SearchParams | undefined> }) {
  const sp = (await searchParams) || {};
  const start = Math.max(1900, Math.min(2100, Number(sp.startYear) || 2018));
  const end = Math.max(start, Math.min(2100, Number(sp.endYear) || 2025));
  const limit = Math.max(20, Math.min(200, Number(sp.limit) || 100));
  const pages = Math.max(1, Math.min(20, Number(sp.pages) || 1));
  const testVin = (sp.testVin || "10ARJYBS7RC154562").trim();

  const { items, statuses } = await fetchListingsByYearRangeWithMeta(start, end, limit, pages);

  const brandCounts = new Map<string, number>();
  const brandModelCounts = new Map<string, Map<string, number>>();

  for (const it of items) {
    const make = (it.vehicle?.make || "").toString().trim();
    const model = (it.vehicle?.model || "").toString().trim();

    if (make) {
      brandCounts.set(make, (brandCounts.get(make) || 0) + 1);

      if (model) {
        const mm = brandModelCounts.get(make) || new Map<string, number>();
        mm.set(model, (mm.get(model) || 0) + 1);
        brandModelCounts.set(make, mm);
      }
    }
  }

  let brandRows = Array.from(brandCounts.entries()).sort((a, b) => b[1] - a[1]);

  let modelRows: { make: string; model: string; count: number }[] = [];
  for (const [mk, models] of brandModelCounts.entries()) {
    for (const [md, count] of models.entries()) {
      modelRows.push({ make: mk, model: md, count });
    }
  }
  modelRows.sort((a, b) =>
    a.make === b.make ? b.count - a.count : a.make.localeCompare(b.make)
  );

  let fallbackLoaded = 0;
  if (items.length === 0) {
    const vins = (sp.testVin ? [sp.testVin] : (process.env.AUTO_DEV_VINS || "").split(",").map(v => v.trim()).filter(Boolean)).slice(0, 20);
    const samples = [
      "WP0AF2A99KS165242",
      "WDDSJ4EB8FN163343",
      "2GCEC13V271100979",
      "2C3CDZFJ1PH667790",
    ];
    const vinList = vins.length > 0 ? vins : samples;
    const results: { make: string; model: string }[] = [];
    const chunkSize = 4;
    for (let i = 0; i < vinList.length; i += chunkSize) {
      const chunk = vinList.slice(i, i + chunkSize);
      const settled = await Promise.allSettled(chunk.map(v => decodeVin(v)));
      for (const s of settled) {
        if (s.status === "fulfilled" && s.value) {
          const mk = (s.value.make || "").toString().trim();
          const md = (s.value.model || "").toString().trim();
          if (mk) results.push({ make: mk, model: md });
        }
      }
    }
    fallbackLoaded = results.length;
    const bc = new Map<string, number>();
    const bmc = new Map<string, Map<string, number>>();
    for (const it of results) {
      const mk = it.make;
      const md = it.model;
      if (mk) {
        bc.set(mk, (bc.get(mk) || 0) + 1);
        if (md) {
          const mm = bmc.get(mk) || new Map<string, number>();
          mm.set(md, (mm.get(md) || 0) + 1);
          bmc.set(mk, mm);
        }
      }
    }
    brandRows = Array.from(bc.entries()).sort((a, b) => b[1] - a[1]);
    modelRows = [];
    for (const [mk, models] of bmc.entries()) {
      for (const [md, count] of models.entries()) {
        modelRows.push({ make: mk, model: md, count });
      }
    }
    modelRows.sort((a, b) => (a.make === b.make ? b.count - a.count : a.make.localeCompare(b.make)));
  }

  return (
    <div className="container" style={{ padding: 24 }}>
      <h1>Auto.dev stats</h1>
      <p style={{ margin: 0 }}>
        Years: {start}-{end}, limit: {limit}, pages: {pages}, loaded: {items.length}, fallback: {fallbackLoaded}
      </p>

      {items.length === 0 ? (
        <div style={{ marginTop: 12 }}>
          <h2>Debug</h2>
          <div style={{ marginBottom: 12 }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Statuses</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{statuses.join(", ") || ""}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <DebugBlock vin={testVin} />
        </div>
      ) : null}

      <h2 style={{ marginTop: 24 }}>Brands</h2>
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
              <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>
                {count}
              </td>
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
              <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>
                {row.count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function DebugBlock({ vin }: { vin: string }) {
  const one: ListingItem | null = await fetchListingByVin(vin);

  return (
    <div>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>VIN</th>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Year</th>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Make</th>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Model</th>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {one ? (
            <tr>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {one?.vehicle?.vin || ""}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {one?.vehicle?.year || ""}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {one?.vehicle?.make || ""}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {one?.vehicle?.model || ""}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {one?.retailListing?.price ?? 0}
              </td>
            </tr>
          ) : (
            <tr>
              <td style={{ border: "1px solid #ccc", padding: 8 }} colSpan={5}>
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
