// webgl2 dreamify engine, shared by the live preview and the full-res export.
//
// the look is driven by one focal circle the user places on the photo:
// inside the circle the image is untouched (sharp, no glow), and both the
// defocus and the bloom ramp up smoothly with distance past its edge.
//
// optical stages, all computed in linear light (sRGB decoded first, so
// defocused highlights stay luminous instead of averaging to muddy gray):
//   1. radial variable-radius gaussian through a 6-level blur pyramid:
//      the distance-based ramp samples intermediate pyramid levels, giving
//      true medium defocus at the transition instead of a double-image ghost.
//      the focal zone can be stretched into an ellipse (aspect).
//   2. multi-scale glow: soft-knee highlight extract, then three gaussian
//      scales (tight halo, medium spread, wide veil) summed with falling
//      weights, the classic diffusion-filter response. screened back in
//      linear, gated by the same radial ramp so the focal center stays
//      clean; screen blending means highlights bloom but never clip to
//      pure white, matching the radhik reference frames. an optional warmth
//      tint colors only this veil, halation style.
//   3. haze: the unthresholded composite blurred frame-wide, a little of it
//      screened back over the outer zone, the milky mist-filter black lift.
//   4. sRGB re-encode plus sub-visible ordered dither so 8-bit encodes do
//      not band across the creamy gradients.
//
// the gaussian itself is photoshop-calibrated: radius == sigma (per adobe's
// chris cox), true separable kernel, clamp-to-edge borders. grading and
// grain are deliberately out of scope, that lives in lightroom.

export const PYRAMID_LEVELS = 6;
const LVL = PYRAMID_LEVELS - 1; // max level index

const VERT = `#version 300 es
out vec2 v_uv;
void main() {
  // fullscreen triangle
  vec2 pos = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  v_uv = pos;
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}`;

// taps per side; caps a single pass near sigma 170, plenty since pyramid
// levels are built incrementally with small per-step sigmas
const MAX_R = 512;

const SRGB_FNS = `
vec3 toLinear(vec3 c) {
  bvec3 lo = lessThanEqual(c, vec3(0.04045));
  return mix(pow((c + 0.055) / 1.055, vec3(2.4)), c / 12.92, vec3(lo));
}
vec3 toSrgb(vec3 l) {
  bvec3 lo = lessThanEqual(l, vec3(0.0031308));
  return mix(1.055 * pow(l, vec3(1.0 / 2.4)) - 0.055, l * 12.92, vec3(lo));
}`;

// 0 inside the focal zone, ramping to 1 over the feather distance.
// distances are in pixels so the shape is stable at any image aspect;
// u_aspect stretches the zone into an ellipse (width / height, 1 = circle)
// and u_rot tilts it (all radialMask callers work in y-down image space,
// so the rotation reads clockwise on screen, matching the css guide).
const RADIAL_FNS = `
uniform vec2 u_size;    // image px
uniform vec2 u_center;  // px
uniform float u_r0;     // focal radius, px
uniform float u_feather; // ramp length, px
uniform float u_aspect;  // focal ellipse width / height
uniform vec2 u_rot;      // (cos, sin) of the ellipse tilt
float radialMask(vec2 uv) {
  vec2 rel = uv * u_size - u_center;
  rel = vec2(rel.x * u_rot.x + rel.y * u_rot.y, rel.y * u_rot.x - rel.x * u_rot.y);
  rel.x /= max(u_aspect, 0.01);
  float d = length(rel);
  return smoothstep(u_r0, u_r0 + max(u_feather, 1.0), d);
}
// quadratically spaced pyramid levels; sqrt keeps the ramp linear in sigma
float levelFromMask(float m) {
  return sqrt(clamp(m, 0.0, 1.0)) * float(${LVL});
}`;

const LINEARIZE_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_tex;
in vec2 v_uv;
out vec4 outColor;
${SRGB_FNS}
void main() {
  outColor = vec4(toLinear(texture(u_tex, v_uv).rgb), 1.0);
}`;

// separable gaussian; the source is either a plain 2d texture or one layer
// of the pyramid array, chosen at compile time
function blurFragSrc(fromArray: boolean) {
  return `#version 300 es
precision highp float;
${fromArray ? "uniform highp sampler2DArray u_tex;\nuniform float u_layer;" : "uniform sampler2D u_tex;"}
uniform vec2 u_dir;
uniform float u_sigma;
in vec2 v_uv;
out vec4 outColor;
vec3 tap(vec2 uv) {
  ${fromArray ? "return texture(u_tex, vec3(uv, u_layer)).rgb;" : "return texture(u_tex, uv).rgb;"}
}
void main() {
  if (u_sigma < 0.05) { outColor = vec4(tap(v_uv), 1.0); return; }
  int r = int(min(ceil(u_sigma * 3.0), float(${MAX_R})));
  float twoS2 = 2.0 * u_sigma * u_sigma;
  vec3 acc = tap(v_uv);
  float wsum = 1.0;
  for (int i = 1; i <= ${MAX_R}; i++) {
    if (i > r) break;
    float w = exp(-float(i * i) / twoS2);
    // clamp-to-edge sampling replicates borders like photoshop, no dark halo
    acc += w * (tap(v_uv + u_dir * float(i)) + tap(v_uv - u_dir * float(i)));
    wsum += 2.0 * w;
  }
  outColor = vec4(acc / wsum, 1.0);
}`;
}

// preview composite: two adjacent pyramid layers, lerped by the radial ramp
const COMPOSITE_FRAG = `#version 300 es
precision highp float;
uniform highp sampler2DArray u_pyr;
in vec2 v_uv;
out vec4 outColor;
${RADIAL_FNS}
void main() {
  float l = levelFromMask(radialMask(v_uv));
  float k0 = floor(l);
  vec3 a = texture(u_pyr, vec3(v_uv, k0)).rgb;
  vec3 b = texture(u_pyr, vec3(v_uv, min(k0 + 1.0, float(${LVL})))).rgb;
  outColor = vec4(mix(a, b, l - k0), 1.0);
}`;

// export accumulate: one level at a time, weighted by a tent basis so the
// per-pixel weights across all levels sum to exactly 1
const ACCUM_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_level;
uniform float u_k;
in vec2 v_uv;
out vec4 outColor;
${RADIAL_FNS}
void main() {
  float l = levelFromMask(radialMask(v_uv));
  float w = max(0.0, 1.0 - abs(l - u_k));
  outColor = vec4(texture(u_level, v_uv).rgb * w, w);
}`;

// weighted copy, drawn with additive blending to sum the glow scales
const WEIGHTED_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_tex;
uniform float u_w;
in vec2 v_uv;
out vec4 outColor;
void main() {
  outColor = vec4(texture(u_tex, v_uv).rgb * u_w, 1.0);
}`;

const BLOOM_EXTRACT_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_tex;
uniform float u_threshold;
uniform float u_knee;
in vec2 v_uv;
out vec4 outColor;
void main() {
  vec3 c = texture(u_tex, v_uv).rgb;
  float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float w = clamp((lum - u_threshold + u_knee) / (2.0 * u_knee), 0.0, 1.0);
  outColor = vec4(c * w * w, 1.0);
}`;

const FINAL_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_comp;    // linear focus composite
uniform sampler2D u_glow;    // linear multi-scale glow, half res
uniform sampler2D u_hazeTex; // linear wide-blurred composite, half res
uniform sampler2D u_src;     // original srgb, for the compare view
uniform float u_bloomIntensity;
uniform float u_warmth;
uniform float u_haze;
uniform int u_showOriginal;
in vec2 v_uv;
out vec4 outColor;
${SRGB_FNS}
${RADIAL_FNS}
// interleaved gradient noise (jimenez): cheap near-blue-noise ordered dither
float ign(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}
void main() {
  // flip y for display; readback/drawImage inherits this upright orientation
  vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);
  vec3 c;
  if (u_showOriginal == 1) {
    c = texture(u_src, uv).rgb;
  } else {
    // the same radial ramp gates glow and haze, keeping the center clean
    float m = radialMask(uv);
    vec3 lin = clamp(texture(u_comp, uv).rgb, 0.0, 1.0);
    // halation-style warmth: tints only the veil, never the image itself
    vec3 tint = mix(vec3(1.0), vec3(1.0, 0.62, 0.33), u_warmth);
    vec3 glow = clamp(texture(u_glow, uv).rgb * u_bloomIntensity * tint * m, 0.0, 1.0);
    // screen in linear light: adds glow into remaining headroom, so
    // highlights bloom outward but never clip to pure white
    lin = 1.0 - (1.0 - lin) * (1.0 - glow);
    // haze: milky mist-filter air, lifts blacks only where light spills
    vec3 haze = clamp(texture(u_hazeTex, uv).rgb * u_haze * m, 0.0, 1.0);
    lin = 1.0 - (1.0 - lin) * (1.0 - haze);
    c = toSrgb(clamp(lin, 0.0, 1.0));
    // sub-visible dither so 8-bit encodes do not band on smooth gradients
    c += vec3((ign(gl_FragCoord.xy) - 0.5) / 255.0);
  }
  outColor = vec4(c, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) ?? "shader compile failed");
  }
  return sh;
}

function program(gl: WebGL2RenderingContext, frag: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) ?? "shader link failed");
  }
  return p;
}

function setTexParams(gl: WebGL2RenderingContext, target: number) {
  gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

function makeSrcTex(gl: WebGL2RenderingContext, src: TexImageSource) {
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  setTexParams(gl, gl.TEXTURE_2D);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  return t;
}

// pyramid level sigmas: quadratic spacing, see levelFromMask
function levelSigmas(sigmaMax: number) {
  const s: number[] = [];
  for (let k = 0; k <= LVL; k++) s.push(sigmaMax * (k / LVL) ** 2);
  return s;
}

export interface DreamParams {
  sigmaMax: number; // preview px (or full-res px for export)
  bloomSigma: number; // same units as sigmaMax; the medium glow scale
  bloomThreshold: number; // 0..1 linear luminance
  bloomIntensity: number; // 0..1
  warmth: number; // 0..1, golden tint on the glow veil only
  haze: number; // 0..~0.35, screen factor for the milky mist lift
  // focal zone, resolution independent:
  cx: number; // center, fraction of width
  cy: number; // center, fraction of height (from top)
  focusRadius: number; // fraction of min(w, h)
  feather: number; // ramp length, fraction of min(w, h)
  aspect: number; // focal ellipse width / height, 1 = circle
  angle: number; // ellipse tilt, radians, clockwise on screen
}

interface Ctx {
  gl: WebGL2RenderingContext;
  floatOk: boolean;
  fmt: number;
  type: number;
  vao: WebGLVertexArrayObject;
  progLinearize: WebGLProgram;
  progBlur2D: WebGLProgram;
  progBlurArr: WebGLProgram;
  progComposite: WebGLProgram;
  progAccum: WebGLProgram;
  progExtract: WebGLProgram;
  progWeighted: WebGLProgram;
  progFinal: WebGLProgram;
}

function makeCtx(gl: WebGL2RenderingContext): Ctx {
  const floatOk = !!gl.getExtension("EXT_color_buffer_float");
  return {
    gl,
    floatOk,
    fmt: floatOk ? gl.RGBA16F : gl.RGBA8,
    type: floatOk ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,
    vao: gl.createVertexArray()!,
    progLinearize: program(gl, LINEARIZE_FRAG),
    progBlur2D: program(gl, blurFragSrc(false)),
    progBlurArr: program(gl, blurFragSrc(true)),
    progComposite: program(gl, COMPOSITE_FRAG),
    progAccum: program(gl, ACCUM_FRAG),
    progExtract: program(gl, BLOOM_EXTRACT_FRAG),
    progWeighted: program(gl, WEIGHTED_FRAG),
    progFinal: program(gl, FINAL_FRAG),
  };
}

interface Target {
  t: WebGLTexture;
  fbo: WebGLFramebuffer;
}

function makeTarget(c: Ctx, w: number, h: number): Target {
  const { gl } = c;
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  setTexParams(gl, gl.TEXTURE_2D);
  gl.texImage2D(gl.TEXTURE_2D, 0, c.fmt, w, h, 0, gl.RGBA, c.type, null);
  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
  return { t, fbo };
}

function draw(c: Ctx, prog: WebGLProgram, fbo: WebGLFramebuffer | null, w: number, h: number, bind: () => void) {
  const { gl } = c;
  gl.useProgram(prog);
  gl.bindVertexArray(c.vao);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.viewport(0, 0, w, h);
  bind();
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function bindTex(
  gl: WebGL2RenderingContext,
  prog: WebGLProgram,
  unit: number,
  name: string,
  tex: WebGLTexture,
  target?: number,
) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(target ?? gl.TEXTURE_2D, tex);
  gl.uniform1i(gl.getUniformLocation(prog, name), unit);
}

// set the focal zone uniforms for any program that includes RADIAL_FNS
function setRadial(gl: WebGL2RenderingContext, prog: WebGLProgram, p: DreamParams, w: number, h: number) {
  const m = Math.min(w, h);
  gl.uniform2f(gl.getUniformLocation(prog, "u_size"), w, h);
  gl.uniform2f(gl.getUniformLocation(prog, "u_center"), p.cx * w, p.cy * h);
  gl.uniform1f(gl.getUniformLocation(prog, "u_r0"), p.focusRadius * m);
  gl.uniform1f(gl.getUniformLocation(prog, "u_feather"), p.feather * m);
  gl.uniform1f(gl.getUniformLocation(prog, "u_aspect"), p.aspect);
  gl.uniform2f(gl.getUniformLocation(prog, "u_rot"), Math.cos(p.angle), Math.sin(p.angle));
}

// half-res scratch and result targets for the glow + haze stages
interface HalfTargets {
  a: Target;
  b: Target;
  glow: Target;
  haze: Target;
}

// glow and haze both run at half resolution (low frequency, 4x cheaper,
// visually identical after bilinear upsampling).
//
// glow is multi-scale: three gaussians (tight halo, medium spread, wide
// veil) summed with falling weights, the classic diffusion-filter response.
// built incrementally, each step's sigma^2 is the difference, so no pass
// needs a huge kernel. haze is the unthresholded composite blurred
// frame-wide; the final pass screens a slice of it back over the outer zone.
function runGlow(c: Ctx, compTex: WebGLTexture, half: HalfTargets, hw: number, hh: number, p: DreamParams) {
  const { gl } = c;
  const cap = MAX_R / 3;
  const base = Math.min(p.bloomSigma * 0.5, cap);
  const sigmas = [base * 0.35, base, Math.min(base * 2.5, cap)];
  const weights = [0.5, 0.32, 0.18];

  const blurPass = (src: WebGLTexture, dst: Target, horizontal: boolean, sigma: number) =>
    draw(c, c.progBlur2D, dst.fbo, hw, hh, () => {
      bindTex(gl, c.progBlur2D, 0, "u_tex", src);
      gl.uniform2f(gl.getUniformLocation(c.progBlur2D, "u_dir"), horizontal ? 1 / hw : 0, horizontal ? 0 : 1 / hh);
      gl.uniform1f(gl.getUniformLocation(c.progBlur2D, "u_sigma"), sigma);
    });

  if (p.haze > 0) {
    // frame-scale sigma with a floor so haze stays airy even at small
    // glow spreads; capped by the shader's tap budget
    const hazeSigma = Math.min(Math.max(sigmas[2], Math.min(hw, hh) * 0.15), cap);
    blurPass(compTex, half.a, true, hazeSigma);
    blurPass(half.a.t, half.haze, false, hazeSigma);
  }

  if (p.bloomIntensity > 0) {
    const knee = Math.max(0.02, p.bloomThreshold * 0.5);
    draw(c, c.progExtract, half.a.fbo, hw, hh, () => {
      bindTex(gl, c.progExtract, 0, "u_tex", compTex);
      gl.uniform1f(gl.getUniformLocation(c.progExtract, "u_threshold"), p.bloomThreshold);
      gl.uniform1f(gl.getUniformLocation(c.progExtract, "u_knee"), knee);
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, half.glow.fbo);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    let prev = 0;
    for (let i = 0; i < sigmas.length; i++) {
      const inc = Math.sqrt(Math.max(0, sigmas[i] ** 2 - prev * prev));
      blurPass(half.a.t, half.b, true, inc);
      blurPass(half.b.t, half.a, false, inc);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      draw(c, c.progWeighted, half.glow.fbo, hw, hh, () => {
        bindTex(gl, c.progWeighted, 0, "u_tex", half.a.t);
        gl.uniform1f(gl.getUniformLocation(c.progWeighted, "u_w"), weights[i]);
      });
      gl.disable(gl.BLEND);
      prev = sigmas[i];
    }
  }

  // stale contents when a stage is skipped are fine: the final shader
  // multiplies each by its (zero) amount
  return { glowTex: half.glow.t, hazeTex: half.haze.t };
}

export interface Pipeline {
  setParams(p: DreamParams): void;
  render(opts: { showOriginal: boolean }): void;
  destroy(): void;
}

// live, interactive preview bound to an on-screen canvas
export function createPipeline(canvas: HTMLCanvasElement, srcCanvas: HTMLCanvasElement): Pipeline {
  const w = srcCanvas.width;
  const h = srcCanvas.height;
  const hw = Math.max(1, w >> 1);
  const hh = Math.max(1, h >> 1);
  canvas.width = w;
  canvas.height = h;

  const gl = canvas.getContext("webgl2", { premultipliedAlpha: false, antialias: false });
  if (!gl) throw new Error("this browser has no webgl2");
  const c = makeCtx(gl);

  const srcTex = makeSrcTex(gl, srcCanvas);

  // pyramid: one texture array, K layers, rendered one layer at a time
  const pyr = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, pyr);
  setTexParams(gl, gl.TEXTURE_2D_ARRAY);
  gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, c.fmt, w, h, PYRAMID_LEVELS);
  const pyrFbos: WebGLFramebuffer[] = [];
  for (let k = 0; k < PYRAMID_LEVELS; k++) {
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, pyr, 0, k);
    pyrFbos.push(fbo);
  }

  const temp = makeTarget(c, w, h);
  const comp = makeTarget(c, w, h);
  const half: HalfTargets = {
    a: makeTarget(c, hw, hh),
    b: makeTarget(c, hw, hh),
    glow: makeTarget(c, hw, hh),
    haze: makeTarget(c, hw, hh),
  };

  let params: DreamParams = {
    sigmaMax: 0,
    bloomSigma: 0,
    bloomThreshold: 1,
    bloomIntensity: 0,
    warmth: 0,
    haze: 0,
    cx: 0.5,
    cy: 0.5,
    focusRadius: 0.3,
    feather: 0.6,
    aspect: 1,
    angle: 0,
  };
  let pyramidSigma = -1;

  const rebuildPyramid = () => {
    // layer 0: linearized source
    draw(c, c.progLinearize, pyrFbos[0], w, h, () => {
      bindTex(gl, c.progLinearize, 0, "u_tex", srcTex);
    });
    const sigmas = levelSigmas(params.sigmaMax);
    for (let k = 1; k < PYRAMID_LEVELS; k++) {
      // each level is blurred incrementally from the previous, so per-step
      // sigmas stay small: sigma_inc^2 = sigma_k^2 - sigma_{k-1}^2
      const inc = Math.sqrt(Math.max(0, sigmas[k] ** 2 - sigmas[k - 1] ** 2));
      draw(c, c.progBlurArr, temp.fbo, w, h, () => {
        bindTex(gl, c.progBlurArr, 0, "u_tex", pyr, gl.TEXTURE_2D_ARRAY);
        gl.uniform1f(gl.getUniformLocation(c.progBlurArr, "u_layer"), k - 1);
        gl.uniform2f(gl.getUniformLocation(c.progBlurArr, "u_dir"), 1 / w, 0);
        gl.uniform1f(gl.getUniformLocation(c.progBlurArr, "u_sigma"), inc);
      });
      draw(c, c.progBlur2D, pyrFbos[k], w, h, () => {
        bindTex(gl, c.progBlur2D, 0, "u_tex", temp.t);
        gl.uniform2f(gl.getUniformLocation(c.progBlur2D, "u_dir"), 0, 1 / h);
        gl.uniform1f(gl.getUniformLocation(c.progBlur2D, "u_sigma"), inc);
      });
    }
    pyramidSigma = params.sigmaMax;
  };

  rebuildPyramid();

  return {
    setParams(p) {
      params = p;
      if (p.sigmaMax !== pyramidSigma) rebuildPyramid();
    },
    render({ showOriginal }) {
      // focus composite from the pyramid, driven by the focal zone
      draw(c, c.progComposite, comp.fbo, w, h, () => {
        bindTex(gl, c.progComposite, 0, "u_pyr", pyr, gl.TEXTURE_2D_ARRAY);
        setRadial(gl, c.progComposite, params, w, h);
      });
      const { glowTex, hazeTex } = runGlow(c, comp.t, half, hw, hh, params);
      draw(c, c.progFinal, null, w, h, () => {
        bindTex(gl, c.progFinal, 0, "u_comp", comp.t);
        bindTex(gl, c.progFinal, 1, "u_glow", glowTex);
        bindTex(gl, c.progFinal, 2, "u_hazeTex", hazeTex);
        bindTex(gl, c.progFinal, 3, "u_src", srcTex);
        setRadial(gl, c.progFinal, params, w, h);
        gl.uniform1f(gl.getUniformLocation(c.progFinal, "u_bloomIntensity"), params.bloomIntensity);
        gl.uniform1f(gl.getUniformLocation(c.progFinal, "u_warmth"), params.warmth);
        gl.uniform1f(gl.getUniformLocation(c.progFinal, "u_haze"), params.haze);
        gl.uniform1i(gl.getUniformLocation(c.progFinal, "u_showOriginal"), showOriginal ? 1 : 0);
      });
    },
    destroy() {
      // free every gpu resource but keep the context alive: a canvas whose
      // context was lost hands back that same dead context forever, and the
      // preview canvas gets a new pipeline after exports and photo swaps
      for (const t of [temp, comp, half.a, half.b, half.glow, half.haze]) {
        gl.deleteTexture(t.t);
        gl.deleteFramebuffer(t.fbo);
      }
      for (const f of pyrFbos) gl.deleteFramebuffer(f);
      gl.deleteTexture(pyr);
      gl.deleteTexture(srcTex);
      for (const p of [
        c.progLinearize,
        c.progBlur2D,
        c.progBlurArr,
        c.progComposite,
        c.progAccum,
        c.progExtract,
        c.progWeighted,
        c.progFinal,
      ]) {
        gl.deleteProgram(p);
      }
      gl.deleteVertexArray(c.vao);
    },
  };
}

// one-shot full-resolution render for export. same math as the preview, but
// levels are computed sequentially and accumulated (tent-weighted by the
// radial ramp) so only three full-res float textures are alive at once
// instead of a resident pyramid, keeping memory sane on 40MP+ files.
// source can be the full bitmap or a pre-downscaled canvas (phone gpus).
export function renderToCanvas(opts: {
  source: ImageBitmap | HTMLCanvasElement;
  params: DreamParams; // sigmas in source px
}): HTMLCanvasElement {
  const { source, params } = opts;
  const w = source.width;
  const h = source.height;
  const hw = Math.max(1, w >> 1);
  const hh = Math.max(1, h >> 1);

  const glCanvas = document.createElement("canvas");
  glCanvas.width = w;
  glCanvas.height = h;
  const gl = glCanvas.getContext("webgl2", {
    premultipliedAlpha: false,
    antialias: false,
    preserveDrawingBuffer: true, // so drawImage can read the result back
  });
  if (!gl) throw new Error("this browser has no webgl2");

  const max = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  if (w > max || h > max) {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    throw new Error(
      `image is ${w}x${h}, beyond this gpu's ${max}px limit. resize it down a touch and try again.`,
    );
  }

  try {
    const c = makeCtx(gl);
    const srcTex = makeSrcTex(gl, source);

    // cur doubles as ping-pong: h-pass reads it into tmp, v-pass writes the
    // next level straight back over it, so no fourth full-res texture
    const cur = makeTarget(c, w, h); // current pyramid level
    const tmp = makeTarget(c, w, h); // horizontal pass scratch
    const acc = makeTarget(c, w, h); // tent-weighted accumulator
    const half: HalfTargets = {
      a: makeTarget(c, hw, hh),
      b: makeTarget(c, hw, hh),
      glow: makeTarget(c, hw, hh),
      haze: makeTarget(c, hw, hh),
    };

    // level 0: linearized source
    draw(c, c.progLinearize, cur.fbo, w, h, () => {
      bindTex(gl, c.progLinearize, 0, "u_tex", srcTex);
    });

    gl.bindFramebuffer(gl.FRAMEBUFFER, acc.fbo);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const accumulate = (levelTex: WebGLTexture, k: number) => {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      draw(c, c.progAccum, acc.fbo, w, h, () => {
        bindTex(gl, c.progAccum, 0, "u_level", levelTex);
        setRadial(gl, c.progAccum, params, w, h);
        gl.uniform1f(gl.getUniformLocation(c.progAccum, "u_k"), k);
      });
      gl.disable(gl.BLEND);
    };

    accumulate(cur.t, 0);
    const sigmas = levelSigmas(params.sigmaMax);
    for (let k = 1; k < PYRAMID_LEVELS; k++) {
      const inc = Math.sqrt(Math.max(0, sigmas[k] ** 2 - sigmas[k - 1] ** 2));
      draw(c, c.progBlur2D, tmp.fbo, w, h, () => {
        bindTex(gl, c.progBlur2D, 0, "u_tex", cur.t);
        gl.uniform2f(gl.getUniformLocation(c.progBlur2D, "u_dir"), 1 / w, 0);
        gl.uniform1f(gl.getUniformLocation(c.progBlur2D, "u_sigma"), inc);
      });
      draw(c, c.progBlur2D, cur.fbo, w, h, () => {
        bindTex(gl, c.progBlur2D, 0, "u_tex", tmp.t);
        gl.uniform2f(gl.getUniformLocation(c.progBlur2D, "u_dir"), 0, 1 / h);
        gl.uniform1f(gl.getUniformLocation(c.progBlur2D, "u_sigma"), inc);
      });
      accumulate(cur.t, k);
    }

    const { glowTex, hazeTex } = runGlow(c, acc.t, half, hw, hh, params);

    draw(c, c.progFinal, null, w, h, () => {
      bindTex(gl, c.progFinal, 0, "u_comp", acc.t);
      bindTex(gl, c.progFinal, 1, "u_glow", glowTex);
      bindTex(gl, c.progFinal, 2, "u_hazeTex", hazeTex);
      bindTex(gl, c.progFinal, 3, "u_src", srcTex);
      setRadial(gl, c.progFinal, params, w, h);
      gl.uniform1f(gl.getUniformLocation(c.progFinal, "u_bloomIntensity"), params.bloomIntensity);
      gl.uniform1f(gl.getUniformLocation(c.progFinal, "u_warmth"), params.warmth);
      gl.uniform1f(gl.getUniformLocation(c.progFinal, "u_haze"), params.haze);
      gl.uniform1i(gl.getUniformLocation(c.progFinal, "u_showOriginal"), 0);
    });
    gl.flush();

    // free every gpu texture before the readback + encode allocate their
    // buffers; the drawing buffer already holds the finished frame. keeps
    // peak memory down so ios safari does not jettison the page.
    for (const t of [cur, tmp, acc, half.a, half.b, half.glow, half.haze]) {
      gl.deleteTexture(t.t);
      gl.deleteFramebuffer(t.fbo);
    }
    gl.deleteTexture(srcTex);

    // the gl canvas already shows the image upright; copy into a 2d canvas
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    out.getContext("2d")!.drawImage(glCanvas, 0, 0);
    return out;
  } finally {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
