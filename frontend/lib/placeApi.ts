const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

function apiUrl(path: string, params?: Record<string, string>) {
  const url = new URL(path, API_BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  return url.toString();
}

async function fetchStringList(path: string, params?: Record<string, string>) {
  const response = await fetch(apiUrl(path, params), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }

  const values = (await response.json()) as string[];
  return Array.from(new Set(values.filter(Boolean))).sort();
}

export function fetchPlaceCities() {
  return fetchStringList("/api/places/regions/cities");
}

export function fetchPlaceDistricts(city: string) {
  return fetchStringList("/api/places/regions/districts", { city });
}

export function fetchPlaceNeighborhoods(city: string, district: string) {
  return fetchStringList("/api/places/regions/neighborhoods", {
    city,
    district,
  });
}
