// recently viewed charts, kept in localStorage so they can be brought back with a
// click. like the ephemeris, this never leaves the browser. every call is best
// effort: private browsing or a full quota must never break the page.
import type { Place } from "./geocode";

const HISTORY_KEY = "jaataka:history";
const MAX_ENTRIES = 8;

export type HistoryEntry = {
  date: string;
  time: string;
  tzKey: string;
  place: Place;
};

export const sameEntry = (a: HistoryEntry, b: HistoryEntry) =>
  a.date === b.date &&
  a.time === b.time &&
  a.tzKey === b.tzKey &&
  a.place.label === b.place.label &&
  a.place.lat === b.place.lat &&
  a.place.lon === b.place.lon;

// stored data comes back from the browser, so trust nothing
function isEntry(v: unknown): v is HistoryEntry {
  if (typeof v !== "object" || v === null) return false;
  const e = v as Record<string, unknown>;
  const p = e.place as Record<string, unknown> | undefined;
  return (
    typeof e.date === "string" &&
    typeof e.time === "string" &&
    typeof e.tzKey === "string" &&
    typeof p === "object" &&
    p !== null &&
    typeof p.label === "string" &&
    typeof p.lat === "number" &&
    typeof p.lon === "number"
  );
}

export function readHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const v: unknown = JSON.parse(raw);
    return Array.isArray(v) ? v.filter(isEntry).slice(0, MAX_ENTRIES) : [];
  } catch {
    return [];
  }
}

export function writeHistory(entries: HistoryEntry[]) {
  try {
    if (entries.length) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
    } else {
      localStorage.removeItem(HISTORY_KEY);
    }
  } catch {
    // quota or private mode; losing history is fine
  }
}

/** puts the entry first, dropping any older copy of it and anything past the cap */
export function pushEntry(
  entries: HistoryEntry[],
  entry: HistoryEntry,
): HistoryEntry[] {
  return [entry, ...entries.filter((e) => !sameEntry(e, entry))].slice(
    0,
    MAX_ENTRIES,
  );
}
