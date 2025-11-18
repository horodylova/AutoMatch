export type RetailListing = {
  price?: number;
};

export type VehicleInfo = {
  vin?: string;
  year?: number;
  make?: string;
  model?: string;
};

export type ListingItem = {
  vehicle?: VehicleInfo;
  retailListing?: RetailListing;
};

type ListingsEnvelope = {
  data?: ListingItem[] | ListingItem;
};

function parseListings(body: unknown): ListingItem[] {
  if (Array.isArray(body)) return body as ListingItem[];

  if (body && typeof body === "object") {
    const d = (body as ListingsEnvelope).data;

    if (Array.isArray(d)) return d as ListingItem[];
    if (d && typeof d === "object") return [d as ListingItem];

    return [body as ListingItem];
  }

  return [];
}

export async function fetchListingsByYearRange(
  startYear = 2018,
  endYear = 2025,
  limit = 100,
  pages = 3
): Promise<ListingItem[]> {
  const key = process.env.AUTO_DEV_API_KEY || "";
  if (!key) {
    return [];
  }

  const out: ListingItem[] = [];

  for (let page = 1; page <= pages; page++) {
    const url = new URL("https://api.auto.dev/listings");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("page", String(page));
    url.searchParams.set("vehicle.year", `${startYear}-${endYear}`);
    // важное: не добавляем никаких year / online / make без префикса vehicle.*

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    let res: Response | undefined;
    try {
      res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: controller.signal,
      });
    } catch {
    } finally {
      clearTimeout(timer);
    }

    if (!res) continue;

    const body = (await res.json()) as unknown;
    if (!res.ok) {
      continue;
    }
    const list = parseListings(body);
    out.push(...list);
  }

  return out;
}

export async function fetchListingsByYearRangeWithMeta(
  startYear = 2018,
  endYear = 2025,
  limit = 100,
  pages = 3
): Promise<{ items: ListingItem[]; statuses: number[] }> {
  const key = process.env.AUTO_DEV_API_KEY || "";
  if (!key) return { items: [], statuses: [] };
  const items: ListingItem[] = [];
  const statuses: number[] = [];
  for (let page = 1; page <= pages; page++) {
    const url = new URL("https://api.auto.dev/listings");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("page", String(page));
    url.searchParams.set("vehicle.year", `${startYear}-${endYear}`);
    let attempts = 0;
    while (attempts < 3) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      let res: Response | undefined;
      try {
        res = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal: controller.signal,
        });
      } catch {
      } finally {
        clearTimeout(timer);
      }
      if (!res) {
        attempts++;
        await new Promise(r => setTimeout(r, 500 * attempts));
        continue;
      }
      statuses.push(res.status);
      const ct = String(res.headers.get("content-type") || "").toLowerCase();
      if (!ct.includes("application/json")) {
        break;
      }
      const body = (await res.json()) as unknown;
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get("retry-after")) || 1;
        attempts++;
        await new Promise(r => setTimeout(r, retryAfter * 1000));
        continue;
      }
      if (!res.ok) break;
      const list = parseListings(body);
      items.push(...list);
      break;
    }
  }
  return { items, statuses };
}

export async function fetchListingByVin(vin: string): Promise<ListingItem | null> {
  const key = process.env.AUTO_DEV_API_KEY || "";
  if (!key) {
    return null;
  }

  const url = `https://api.auto.dev/listings/${encodeURIComponent(vin)}`;

  let res: Response | undefined;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!res) return null;
  const ct = String(res.headers.get("content-type") || "").toLowerCase();
  if (!ct.includes("application/json")) {
    return null;
  }
  if (!res.ok) {
    return null;
  }
  const body = (await res.json()) as unknown;
  const list = parseListings(body);
  return list[0] || null;
}

export type VinDecode = {
  vin?: string;
  make?: string;
  model?: string;
};

export async function decodeVin(vin: string): Promise<VinDecode | null> {
  const key = process.env.AUTO_DEV_API_KEY || "";
  if (!key) return null;
  let res: Response | undefined;
  try {
    res = await fetch(`https://api.auto.dev/vin/${encodeURIComponent(vin)}`, {
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
  } catch {
    return null;
  }
  if (!res) return null;
  const ct = String(res.headers.get("content-type") || "").toLowerCase();
  if (!ct.includes("application/json")) return null;
  if (!res.ok) return null;
  const body = (await res.json()) as VinDecode;
  return body || null;
}
