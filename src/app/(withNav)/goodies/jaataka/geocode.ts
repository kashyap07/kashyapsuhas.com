// place lookup via openstreetmap nominatim. no api key, no account.
//
// this is the one part of the tool that leaves the browser. everything else (the
// ephemeris, the chart, the dashas) is computed locally, so a birth time never goes
// anywhere. the place name does, and the ui says so.

export type Place = {
  label: string;
  lat: number;
  lon: number;
};

const ENDPOINT = "https://nominatim.openstreetmap.org/search";

export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const url = `${ENDPOINT}?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=0`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`place lookup failed (${res.status})`);

  const raw: unknown = await res.json();
  if (!Array.isArray(raw)) return [];

  return raw
    .map((r) => {
      const row = r as { display_name?: string; lat?: string; lon?: string };
      const lat = Number(row.lat);
      const lon = Number(row.lon);
      if (!row.display_name || Number.isNaN(lat) || Number.isNaN(lon)) return null;
      return { label: row.display_name, lat, lon };
    })
    .filter((p): p is Place => p !== null);
}

/**
 * a few starting points so the tool is usable before anyone types anything.
 * the first entry is the page default.
 */
export const PRESET_PLACES: Place[] = [
  { label: "Bengaluru, Karnataka", lat: 12.9716, lon: 77.5946 },
  { label: "Kalasa, Chikkamagaluru, Karnataka", lat: 13.2322, lon: 75.3582 },
  { label: "Mysuru, Karnataka", lat: 12.2958, lon: 76.6394 },
  { label: "Udupi, Karnataka", lat: 13.3409, lon: 74.7421 },
  { label: "Sringeri, Karnataka", lat: 13.4167, lon: 75.2528 },
  { label: "Mangaluru, Karnataka", lat: 12.9141, lon: 74.856 },
  { label: "Hubballi, Karnataka", lat: 15.3647, lon: 75.124 },
];
