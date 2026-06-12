import {
  BufferAttribute,
  BufferGeometry,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector4,
  WebGLRenderer,
} from "three";

// number of brush samples behind the cursor; mirrored in the shader loop
const TRAIL_N = 15;

// vertex: page-space coords (y down), flipped to gl space at the end.
// states: falling grains (intro) -> portrait (home) -> vertical katakana
// (scroll). every grain has a slot in the rasterized text; scroll position
// scrubs the journey (read, never hijacked), scrolling back reverses it.
// the cursor is a brush: samples laid along the raw pointer path part grains
// in a smooth dipole flow, healing as they age.
const vertexShader = /* glsl */ `
  attribute vec2 aHome;     // portrait uv, y down
  attribute vec4 aText;     // u, v in the text block, ink shade, alpha
  attribute float aSize;    // size variance
  attribute float aShade;   // sampled luminance, grain jitter baked in
  attribute float aAlpha;   // sampled alpha, keeps the torn paper edge soft
  attribute vec4 aSeed;     // delay, phase, stagger, spare

  uniform float uTime;
  uniform float uIntro;
  uniform float uMorph;
  uniform float uArc;          // 0 under reduced motion: no mid-flight swirl
  uniform vec4 uTrail[${TRAIL_N}]; // xy page coords, zw stroke dir * strength
  uniform float uTrailR;
  uniform vec3 uBurst;         // x, y page coords, z seconds since click
  uniform vec4 uPortraitRect;  // x, y, w, h page coords
  uniform vec4 uTextRect;
  uniform float uDotScale;
  uniform float uTextScale;
  uniform float uDpr;

  varying float vAlpha;
  varying float vShade;

  float easeOutCubic(float t) { return 1.0 - pow(1.0 - t, 3.0); }
  float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    vec2 home = uPortraitRect.xy + aHome * uPortraitRect.zw;
    vec2 textPos = uTextRect.xy + aText.xy * uTextRect.zw;

    // intro: print-head sweep, columns left to right, grains drop into place
    float delay = aHome.x * 0.6 + aSeed.x * 0.25;
    float ip = clamp((uIntro - delay) / 0.35, 0.0, 1.0);
    float ie = easeOutCubic(ip);
    vec2 pos = home + vec2((aSeed.y - 0.5) * 90.0, -(140.0 + aSeed.x * 260.0)) * (1.0 - ie);

    // scroll morph: dissolve, stream down with a little turbulence, and
    // condense into the katakana block
    float mp = smoothstep(aSeed.z * 0.45, aSeed.z * 0.45 + 0.55, uMorph);
    float me = easeInOutCubic(mp);
    float arc = sin(me * 3.14159) * uArc;
    vec2 target = mix(pos, textPos, me);
    target.x += sin(aSeed.y * 6.2832 + me * 5.0) * 90.0 * arc;
    target.y += ((aSeed.x - 0.5) * 140.0 - 60.0) * arc;

    // breathing, very subtle at grain scale
    float j = 0.1 + aSeed.z * 0.2;
    target += vec2(
      sin(uTime * 0.9 + aSeed.y * 6.2832),
      cos(uTime * 0.8 + aSeed.x * 6.2832)
    ) * j;

    // brush wake: a smooth dipole flow field around the stroke. grains part
    // sideways with a tanh falloff across the line (no hard seam) and drift
    // along the stroke, so the print flows open like water around a finger
    float disp = 0.0;
    for (int i = 0; i < ${TRAIL_N}; i++) {
      vec2 td = target - uTrail[i].xy;
      float fall = exp(-dot(td, td) / (uTrailR * uTrailR));
      vec2 dirS = uTrail[i].zw;
      float st = length(dirS);
      vec2 dir = dirS / max(st, 0.001);
      vec2 perp = vec2(-dir.y, dir.x);
      float across = tanh(dot(td, perp) / (uTrailR * 0.35));
      vec2 flow = perp * across * (0.8 + 0.5 * aSeed.y)
                + dir * (0.45 + 0.5 * aSeed.x);
      float f = fall * st;
      target += flow * f;
      disp += f;
    }

    // click ripple: expanding ring, decays over ~a second
    vec2 bd = target - uBurst.xy;
    float br = max(length(bd), 0.001);
    float ring = exp(-pow(br - uBurst.z * 700.0, 2.0) / 7200.0) * exp(-uBurst.z * 2.2);
    target += (bd / br) * ring * 55.0;

    // disturbed grains lift a little: bigger and a touch lighter, like dust
    float lift = min(disp / 60.0, 1.0);
    float size = aSize * mix(uDotScale, uTextScale, me) * (1.0 + lift * 0.35);
    vAlpha = ie * mix(aAlpha, aText.w, me);
    vShade = min(mix(aShade, aText.z, me) + lift * 0.05, 1.0);

    vec4 mv = modelViewMatrix * vec4(target.x, -target.y, 0.0, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = max(size * uDpr, 1.0);
  }
`;

// each grain carries its sampled gray value, like film grain on paper
const fragmentShader = /* glsl */ `
  precision mediump float;
  varying float vAlpha;
  varying float vShade;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    // near-hard disc, thin aa rim: soft dots leave white pinholes between cells
    float a = smoothstep(0.5, 0.38, d) * vAlpha;
    if (a < 0.015) discard;
    gl_FragColor = vec4(vec3(vShade), a);
  }
`;

type EngineOpts = {
  imageSrc: string;
  portraitEl: HTMLElement;
  // text target is optional: without an anchor the scroll morph stays inert
  textEl?: HTMLElement | null;
  reducedMotion?: boolean;
};

// vertical katakana, two columns read right to left like the print:
// レス ヤップ / モア ドゥ, "less yap, more do". y values are glyph centres
// in the 500x800 raster, gaps mirror the reference layout
const TEXT_RASTER_W = 500;
const TEXT_RASTER_H = 800;
const TEXT_COLUMNS: { x: number; glyphs: { ch: string; y: number }[] }[] = [
  {
    x: 350,
    glyphs: [
      { ch: "レ", y: 95 },
      { ch: "ス", y: 215 },
      { ch: "ヤ", y: 430 },
      { ch: "ッ", y: 540 },
      { ch: "プ", y: 655 },
    ],
  },
  {
    x: 150,
    glyphs: [
      { ch: "モ", y: 135 },
      { ch: "ア", y: 255 },
      { ch: "ド", y: 520 },
      { ch: "ゥ", y: 630 },
    ],
  },
];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

type TrailSample = {
  x: number;
  y: number;
  dirX: number;
  dirY: number;
  strength: number;
  age: number;
};

export class HalftoneEngine {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera: OrthographicCamera;
  private material!: ShaderMaterial;
  private points!: Points;
  private opts: EngineOpts;

  private raf = 0;
  private lastT = 0;
  private intro = -0.2; // small startup delay before the sweep begins
  private disposed = false;

  // raw pointer path; brush samples are laid immediately on each move event
  // so the stroke lands under the cursor with no smoothing latency
  private lastPointer = { x: -9999, y: -9999 };
  private trail: TrailSample[] = Array.from({ length: TRAIL_N }, () => ({
    x: -9999,
    y: -9999,
    dirX: 1,
    dirY: 0,
    strength: 0,
    age: 10,
  }));
  private trailHead = 0;
  private burst = { x: -9999, y: -9999, t: 1000 };

  // scroll range over which the print becomes the text, set in measure()
  private morphStart = Infinity;
  private morphEnd = Infinity;
  private sleepBelow = Infinity;
  private textGridW = 0;

  constructor(canvas: HTMLCanvasElement, opts: EngineOpts) {
    this.opts = opts;
    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.camera = new OrthographicCamera(0, 1, 0, -1, -10, 10);
  }

  async init() {
    const img = await loadImage(this.opts.imageSrc);
    if (this.disposed) return;
    this.buildGeometry(img);
    if (this.opts.reducedMotion) this.intro = 1.3; // print is just there, no show
    this.measure();
    this.bind();
    this.lastT = performance.now();
    this.raf = requestAnimationFrame(this.tick);
    // text targets fill in async once the japanese font is ready; the morph
    // stays inert until then (measure leaves it off while textGridW is 0)
    this.rasterizeText().then(() => {
      if (!this.disposed) this.measure();
    });
  }

  private gridW = 660;

  private buildGeometry(img: HTMLImageElement) {
    // sample near display resolution: the source is fine photographic grain,
    // not halftone, so fidelity needs a grain-sized dot per cell. low-memory
    // devices get a coarser grid (roughly 40% fewer grains)
    const mobile = window.innerWidth < 768;
    const mem = (navigator as { deviceMemory?: number }).deviceMemory ?? 8;
    const gw = mobile ? (mem <= 4 ? 300 : 380) : mem <= 4 ? 520 : 660;
    const gh = Math.round((gw * img.naturalHeight) / img.naturalWidth);
    this.gridW = gw;

    const cnv = document.createElement("canvas");
    cnv.width = gw;
    cnv.height = gh;
    const ctx = cnv.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0, gw, gh);
    const data = ctx.getImageData(0, 0, gw, gh).data;

    const home: number[] = [];
    const size: number[] = [];
    const shade: number[] = [];
    const alphaArr: number[] = [];
    const seed: number[] = [];

    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const i = (y * gw + x) * 4;
        const lum =
          (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
        const alpha = data[i + 3] / 255;
        // keep faint edge grains and fade them via aAlpha instead of cutting
        // them off: hard thresholds chewed the torn-paper border
        if (alpha < 0.04) continue;
        if ((1 - lum) * alpha < 0.015) continue; // truly invisible on white

        home.push(x / gw, y / gh);
        size.push(0.95 + Math.random() * 0.45);
        // re-grain: small luminance jitter keeps the film texture alive
        shade.push(
          Math.min(1, Math.max(0, lum + (Math.random() - 0.5) * 0.06)),
        );
        alphaArr.push(Math.min(1, alpha * 1.05));
        seed.push(Math.random(), Math.random(), Math.random(), Math.random());
      }
    }

    const n = size.length;

    const geo = new BufferGeometry();
    geo.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(n * 3), 3),
    );
    geo.setAttribute("aHome", new BufferAttribute(new Float32Array(home), 2));
    // filled in async by rasterizeText once the font is available
    geo.setAttribute("aText", new BufferAttribute(new Float32Array(n * 4), 4));
    geo.setAttribute("aSize", new BufferAttribute(new Float32Array(size), 1));
    geo.setAttribute("aShade", new BufferAttribute(new Float32Array(shade), 1));
    geo.setAttribute(
      "aAlpha",
      new BufferAttribute(new Float32Array(alphaArr), 1),
    );
    geo.setAttribute("aSeed", new BufferAttribute(new Float32Array(seed), 4));

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uIntro: { value: 0 },
        uMorph: { value: 0 },
        uArc: { value: this.opts.reducedMotion ? 0 : 1 },
        uTrail: {
          value: Array.from(
            { length: TRAIL_N },
            () => new Vector4(-9999, -9999, 0, 0),
          ),
        },
        uTrailR: { value: 80 },
        uBurst: { value: { x: -9999, y: -9999, z: 1000 } },
        uPortraitRect: { value: { x: 0, y: 0, z: 1, w: 1 } },
        uTextRect: { value: { x: 0, y: 0, z: 1, w: 1 } },
        uDotScale: { value: 1.5 },
        uTextScale: { value: 1.5 },
        uDpr: { value: 1 },
      },
    });

    this.points = new Points(geo, this.material);
    this.points.frustumCulled = false;
    this.points.matrixAutoUpdate = false; // page-scroll updates it manually
    this.scene.add(this.points);
  }

  // draw the vertical katakana into an offscreen canvas with the site's
  // japanese serif, sample the ink, and give every grain a slot. several
  // grains stack per cell (jittered) so the strokes read as solid ink
  private async rasterizeText() {
    if (!this.opts.textEl || !this.points) return;

    const family =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--font-shippori-mincho")
        .trim() || "serif";
    const font = `700 110px ${family}`;
    try {
      await document.fonts.load(font, "レスヤップモアドゥ");
    } catch {
      // fallback serif still renders katakana, just less pretty
    }
    if (this.disposed) return;

    const cnv = document.createElement("canvas");
    cnv.width = TEXT_RASTER_W;
    cnv.height = TEXT_RASTER_H;
    const ctx = cnv.getContext("2d", { willReadFrequently: true })!;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000";
    for (const col of TEXT_COLUMNS) {
      for (const g of col.glyphs) ctx.fillText(g.ch, col.x, g.y);
    }
    const data = ctx.getImageData(0, 0, TEXT_RASTER_W, TEXT_RASTER_H).data;

    // sample on a grid a bit finer than display grain spacing
    const gw = 340;
    const gh = Math.round((gw * TEXT_RASTER_H) / TEXT_RASTER_W);
    const cells: number[] = []; // u, v, alpha triplets
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const sx = Math.floor(((x + 0.5) / gw) * TEXT_RASTER_W);
        const sy = Math.floor(((y + 0.5) / gh) * TEXT_RASTER_H);
        const a = data[(sy * TEXT_RASTER_W + sx) * 4 + 3] / 255;
        if (a > 0.35) cells.push((x + 0.5) / gw, (y + 0.5) / gh, a);
      }
    }
    if (cells.length === 0) return; // nothing drawn, morph stays inert

    const attr = this.points.geometry.getAttribute("aText") as BufferAttribute;
    const out = attr.array as Float32Array;
    const n = attr.count;
    const cellCount = cells.length / 3;
    const ju = 1 / gw; // jitter within a cell keeps stacked grains organic
    const jv = 1 / gh;
    for (let i = 0; i < n; i++) {
      const c = (i % cellCount) * 3;
      out[i * 4] = cells[c] + (Math.random() - 0.5) * ju;
      out[i * 4 + 1] = cells[c + 1] + (Math.random() - 0.5) * jv;
      out[i * 4 + 2] = 0.12 + Math.random() * 0.1; // ink
      out[i * 4 + 3] = cells[c + 2] * (0.85 + Math.random() * 0.15);
    }
    attr.needsUpdate = true;
    this.textGridW = gw;
  }

  private measure = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, w < 768 ? 1.5 : 2);

    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h);
    this.camera.left = 0;
    this.camera.right = w;
    this.camera.top = 0;
    this.camera.bottom = -h;
    this.camera.updateProjectionMatrix();

    const scroll = window.scrollY;
    const pr = this.opts.portraitEl.getBoundingClientRect();
    const u = this.material.uniforms;

    u.uPortraitRect.value = {
      x: pr.left,
      y: pr.top + scroll,
      z: pr.width,
      w: pr.height,
    };
    // grains sized to overlap their sample cell so flat tones close up solid
    u.uDotScale.value = (pr.width / this.gridW) * 1.85;
    u.uTrailR.value = Math.max(70, pr.width * 0.18);
    u.uDpr.value = dpr;

    const tr = this.opts.textEl?.getBoundingClientRect();
    if (tr && this.textGridW > 0) {
      u.uTextRect.value = {
        x: tr.left,
        y: tr.top + scroll,
        z: tr.width,
        w: tr.height,
      };
      // same overlap rule as the portrait so the ink reads solid
      u.uTextScale.value = (tr.width / this.textGridW) * 1.85;
      // one smooth motion: starts just into the scroll, fully formed by the
      // time the text block sits around mid-viewport
      this.morphStart = h * 0.07;
      this.morphEnd = Math.max(
        this.morphStart + 280,
        tr.top + scroll - h * 0.5,
      );
      this.sleepBelow = tr.top + scroll + tr.height + h;
    } else {
      this.morphStart = Infinity;
      this.morphEnd = Infinity;
      this.sleepBelow = pr.top + scroll + pr.height + h;
    }
  };

  private laySample(
    x: number,
    y: number,
    dirX: number,
    dirY: number,
    strength: number,
  ) {
    const s = this.trail[this.trailHead];
    s.x = x;
    s.y = y;
    s.dirX = dirX;
    s.dirY = dirY;
    s.strength = strength;
    s.age = 0;
    this.trailHead = (this.trailHead + 1) % TRAIL_N;
  }

  private onPointerMove = (e: PointerEvent) => {
    const x = e.clientX;
    const y = e.clientY + window.scrollY;
    // first contact: just anchor, no stroke from offscreen
    if (this.lastPointer.x === -9999) {
      this.lastPointer.x = x;
      this.lastPointer.y = y;
      return;
    }
    const dx = x - this.lastPointer.x;
    const dy = y - this.lastPointer.y;
    const len = Math.hypot(dx, dy);
    if (len < 4) return; // still-ish cursor lays nothing
    const dirX = dx / len;
    const dirY = dy / len;
    const strength = Math.min(8 + len * 0.9, 48);
    // interpolate along the segment so fast flicks paint a continuous stroke
    const steps = Math.min(Math.floor(len / 12) + 1, 8);
    for (let k = 1; k <= steps; k++) {
      const t = k / steps;
      this.laySample(
        this.lastPointer.x + dx * t,
        this.lastPointer.y + dy * t,
        dirX,
        dirY,
        strength,
      );
    }
    this.lastPointer.x = x;
    this.lastPointer.y = y;
  };

  private onPointerDown = (e: PointerEvent) => {
    this.burst.x = e.clientX;
    this.burst.y = e.clientY + window.scrollY;
    this.burst.t = 0;
  };

  private bind() {
    if (!this.opts.reducedMotion) {
      window.addEventListener("pointermove", this.onPointerMove, {
        passive: true,
      });
      window.addEventListener("pointerdown", this.onPointerDown, {
        passive: true,
      });
    }
    window.addEventListener("resize", this.onResize);
    this.renderer.domElement.addEventListener(
      "webglcontextlost",
      this.onContextLost,
    );
  }

  private resizeTimer = 0;
  private onResize = () => {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(this.measure, 150);
  };

  private onContextLost = () => this.dispose();

  private tick = (t: number) => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.tick);

    const dt = Math.min((t - this.lastT) / 1000, 0.05);
    this.lastT = t;
    const u = this.material.uniforms;
    const scroll = window.scrollY;

    // skip work once everything relevant is far above the viewport
    if (scroll > this.sleepBelow) return;

    if (!this.opts.reducedMotion) {
      u.uTime.value += dt;

      if (this.intro < 1.3) this.intro += dt / 1.7;

      // age the brush samples; the stroke itself is laid in onPointerMove.
      // smooth envelope: swell in over ~120ms, then relax out lazily, so the
      // wake breathes open instead of snapping
      const trailU = u.uTrail.value as Vector4[];
      for (let i = 0; i < TRAIL_N; i++) {
        const s = this.trail[i];
        s.age += dt;
        const a = Math.min(s.age / 0.12, 1);
        const attack = a * a * (3 - 2 * a);
        const eff = s.strength * attack * Math.exp(-s.age * 1.4);
        trailU[i].set(s.x, s.y, s.dirX * eff, s.dirY * eff);
      }

      this.burst.t += dt;
      u.uBurst.value.x = this.burst.x;
      u.uBurst.value.y = this.burst.y;
      u.uBurst.value.z = this.burst.t;
    }

    u.uIntro.value = Math.max(0, Math.min(this.intro, 1.3));
    u.uMorph.value =
      this.morphEnd === Infinity
        ? 0
        : Math.min(
            1,
            Math.max(
              0,
              (scroll - this.morphStart) / (this.morphEnd - this.morphStart),
            ),
          );

    if (this.points.position.y !== scroll) {
      this.points.position.y = scroll;
      this.points.updateMatrix();
    }
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.clearTimeout(this.resizeTimer);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("resize", this.onResize);
    this.renderer.domElement.removeEventListener(
      "webglcontextlost",
      this.onContextLost,
    );
    this.points?.geometry.dispose();
    this.material?.dispose();
    this.renderer.dispose();
  }
}
