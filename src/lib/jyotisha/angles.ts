// angle helpers. every longitude in this library is degrees in [0, 360).

export function norm360(deg: number): number {
  // the obvious `((deg % 360) + 360) % 360` loses a few ulp on every call: adding 360
  // and taking it away again is not lossless in binary floating point. that error is
  // invisible almost everywhere and then decides the wrong side of a nakshatra
  // boundary for a longitude sitting exactly on one. branch instead.
  const r = deg % 360;
  return r < 0 ? r + 360 : r;
}

/** shortest signed separation a - b, in (-180, 180]. */
export function signedDiff(a: number, b: number): number {
  let d = (a - b) % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

export const DEG = Math.PI / 180;
export const RAD = 180 / Math.PI;

/** split a longitude into degrees, minutes, seconds. for display. */
export function toDms(deg: number): { d: number; m: number; s: number } {
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const mFloat = (abs - d) * 60;
  const m = Math.floor(mFloat);
  const s = (mFloat - m) * 60;
  return { d: Math.sign(deg) < 0 ? -d : d, m, s };
}

export function formatDms(deg: number): string {
  const { d, m, s } = toDms(deg);
  return `${d}° ${String(m).padStart(2, "0")}' ${s.toFixed(0).padStart(2, "0")}"`;
}
