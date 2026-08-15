export type CatalogItem = {
  id: string;
  make: string;
  makeSlug: string;
  model: string;
  modelSlug: string;
  year: number;
  trim: string | null;
  price: number | null;
  horsepower: number | null;
  cylinders: string | null;
  seating: number | null;
  mpg: number | null;
  mpge: number | null;
  imageUrl: string | null;
  bodyType: string | null;
  fuelType: string | null;
  driveType: string | null;
  transmission: string | null;
  engineType: string | null;
  powertrain: string | null;
  trimDescription: string | null;
  engineSizeL: number | null;
};

export type CatalogPage = {
  items: CatalogItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type FacetOption = { name: string; count: number };

export type CatalogFacets = {
  makes: (FacetOption & { slug: string })[];
  bodyTypes: FacetOption[];
  fuelTypes: FacetOption[];
  driveTypes: FacetOption[];
  transmissions: FacetOption[];
  powertrains: FacetOption[];
  cylinders: FacetOption[];
  price: { min: number; max: number };
  year: { min: number; max: number };
  efficiency: { mpg: { min: number; max: number }; mpge: { min: number; max: number } };
};

export type CatalogQuery = {
  makes?: string[];
  bodyTypes?: string[];
  powertrains?: string[];
  driveTypes?: string[];
  transmissions?: string[];
  cylinders?: string[];
  priceRanges?: { min?: number; max?: number }[];
  efficiencyUnit?: "mpg" | "mpge";
  efficiencyRanges?: { min?: number; max?: number }[];
  query?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

function appendRanges(
  params: URLSearchParams,
  key: string,
  ranges?: { min?: number; max?: number }[]
) {
  if (!ranges?.length) return;
  for (const range of ranges) {
    const min = range.min ?? "";
    const max = range.max ?? "";
    if (min === "" && max === "") continue;
    params.append(key, `${min}:${max}`);
  }
}

export function buildCatalogParams(query: CatalogQuery): URLSearchParams {
  const params = new URLSearchParams();
  for (const value of query.makes ?? []) params.append("make", value);
  for (const value of query.bodyTypes ?? []) params.append("body", value);
  for (const value of query.powertrains ?? []) params.append("powertrain", value);
  for (const value of query.driveTypes ?? []) params.append("drive", value);
  for (const value of query.transmissions ?? []) params.append("transmission", value);
  for (const value of query.cylinders ?? []) params.append("cylinders", value);
  appendRanges(params, "priceRange", query.priceRanges);
  appendRanges(params, "efficiencyRange", query.efficiencyRanges);
  if (query.efficiencyUnit) params.set("efficiencyUnit", query.efficiencyUnit);
  if (query.query) params.set("q", query.query);
  if (query.sort) params.set("sort", query.sort);
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  return params;
}

export async function fetchCatalogPage(
  query: CatalogQuery,
  signal?: AbortSignal
): Promise<CatalogPage> {
  const params = buildCatalogParams(query);
  const response = await fetch(`/api/catalog/list?${params.toString()}`, { signal });
  if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
  const payload = await response.json();
  if (payload?.error) throw new Error(payload.error);
  return payload as CatalogPage;
}

let facetsPromise: Promise<CatalogFacets> | null = null;

export async function fetchCatalogFacets(): Promise<CatalogFacets> {
  if (facetsPromise) return facetsPromise;
  facetsPromise = (async () => {
    const response = await fetch("/api/catalog/facets");
    if (!response.ok) throw new Error(`Facets request failed: ${response.status}`);
    const payload = await response.json();
    if (payload?.error) throw new Error(payload.error);
    return payload as CatalogFacets;
  })();
  return facetsPromise;
}

export function formatPrice(value: number | null): string {
  if (value === null || value <= 0) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function resolveImageUrl(raw: string | null): string {
  if (!raw) return "/no-image-available.jpg";
  const first = raw.split(/[;,]/).map(s => s.trim()).filter(Boolean)[0];
  if (!first) return "/no-image-available.jpg";
  if (!first.startsWith("/") && !first.startsWith("http")) {
    return `/photos-cars/${encodeURIComponent(first)}`;
  }
  return first.replace(/\s+/g, "%20");
}
