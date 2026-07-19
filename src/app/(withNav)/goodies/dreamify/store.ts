// local persistence so accidental reloads and back-buttons (common on
// mobile) do not lose work. settings go to localStorage, the photo itself
// to indexeddb (files cannot live in localStorage). everything stays on
// device, matching the goodie's no-servers promise. every call is best
// effort: private browsing or a full quota must never break the editor.

const SETTINGS_KEY = "dreamify:settings";

export interface SavedSettings {
  radius: number;
  bloomIntensity: number;
  bloomRadius: number;
  bloomThreshold: number;
  glowWarmth: number;
  haze: number;
  focusSize: number;
  falloff: number;
  stretch: number;
  tilt: number;
  cx: number;
  cy: number;
}

export function readSettings(): Partial<SavedSettings> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    const v: unknown = JSON.parse(raw);
    return typeof v === "object" && v !== null
      ? (v as Partial<SavedSettings>)
      : null;
  } catch {
    return null;
  }
}

export function writeSettings(s: SavedSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    // quota or private mode; losing persistence is fine
  }
}

const DB_NAME = "dreamify";
const STORE = "photo";
const PHOTO_KEY = "last";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function op<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest,
): Promise<T | undefined> {
  const db = await openDb();
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = run(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req.result as T | undefined);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

// stored as { blob, name, type } because some webkit versions round-trip a
// File back as a plain Blob, losing its name
interface PhotoRecord {
  blob: Blob;
  name: string;
  type: string;
}

export async function savePhoto(file: File) {
  try {
    await op("readwrite", (s) =>
      s.put({ blob: file, name: file.name, type: file.type }, PHOTO_KEY),
    );
  } catch {
    // best effort
  }
}

export async function loadPhoto(): Promise<File | null> {
  try {
    const rec = await op<PhotoRecord>("readonly", (s) => s.get(PHOTO_KEY));
    if (!rec?.blob) return null;
    return rec.blob instanceof File
      ? rec.blob
      : new File([rec.blob], rec.name || "photo", {
          type: rec.type || rec.blob.type,
        });
  } catch {
    return null;
  }
}

export async function clearPhoto() {
  try {
    await op("readwrite", (s) => s.delete(PHOTO_KEY));
  } catch {
    // best effort
  }
}
