// cheap "can this browser do webgl at all" probe. firefox with
// `webgl.disabled`, blocklisted drivers, and some privacy setups return null
// here, and libraries that assume a context (maplibre 5 dropped its own
// supported() check) throw on construction instead of degrading.
let cached: boolean | null = null;

export function hasWebGL(): boolean {
  if (cached !== null) return cached;
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    // same order maplibre asks for: webgl2, then webgl1
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    // hand the probe's context straight back; browsers cap live contexts
    // (~16) and this one only exists to answer the question
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    cached = Boolean(gl);
  } catch {
    cached = false;
  }

  return cached;
}
