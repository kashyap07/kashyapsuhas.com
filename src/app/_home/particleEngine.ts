import {
  BufferAttribute,
  BufferGeometry,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";

// vertex: page-space coords (y down), flipped to gl space at the end.
// states: falling grains (intro) -> portrait (home) -> vertical katakana
// (scroll). every grain has a slot in the rasterized text; scroll position
// scrubs the journey (read, never hijacked), scrolling back reverses it.
// no pointer interaction: the print just sits, then morphs as you scroll.
const vertexShader = /* glsl */ `
  attribute vec2 aHome;     // portrait uv, y down
  attribute vec4 aText;     // u, v in the text block, ink shade, alpha
  attribute float aSize;    // size variance
  attribute float aShade;   // sampled luminance, grain jitter baked in
  attribute float aAlpha;   // sampled alpha, keeps the torn paper edge soft
  attribute vec3 aSeed;     // delay, phase, stagger

  uniform float uIntro;
  uniform float uMorph;
  uniform float uArc;          // 0 under reduced motion: no mid-flight swirl
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

    float size = aSize * mix(uDotScale, uTextScale, me);
    vAlpha = ie * mix(aAlpha, aText.w, me);
    vShade = mix(aShade, aText.z, me);

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
  // last morph value we drew at; -1 forces a redraw (measure/resize/first frame)
  private lastMorph = -1;
  // kept so we can rebuild the geometry if the gl context is lost and restored
  private img: HTMLImageElement | null = null;

  // scroll range over which the print becomes the text, set in measure()
  private morphStart = Infinity;
  private morphEnd = Infinity;
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
    this.img = img;
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
        seed.push(Math.random(), Math.random(), Math.random());
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
    geo.setAttribute("aSeed", new BufferAttribute(new Float32Array(seed), 3));

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uIntro: { value: 0 },
        uMorph: { value: 0 },
        uArc: { value: this.opts.reducedMotion ? 0 : 1 },
        uPortraitRect: { value: { x: 0, y: 0, z: 1, w: 1 } },
        uTextRect: { value: { x: 0, y: 0, z: 1, w: 1 } },
        uDotScale: { value: 1.5 },
        uTextScale: { value: 1.5 },
        uDpr: { value: 1 },
      },
    });

    this.points = new Points(geo, this.material);
    this.points.frustumCulled = false;
    this.points.matrixAutoUpdate = false; // static at the document origin
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
    // clientWidth excludes the scrollbar, matching getBoundingClientRect and
    // the canvas css width, so nothing squishes horizontally
    const w = document.documentElement.clientWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, w < 768 ? 1.5 : 2);

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
    u.uDpr.value = dpr;

    // the canvas covers the document from the top down to the bottom of the
    // last grain target. sized this way it scrolls natively with the page
    // (compositor, pixel-locked) instead of us chasing scrollY on the main
    // thread, which is what made the portrait lag behind the text
    let cover = pr.top + scroll + pr.height + h * 0.2;

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
      this.morphEnd = Math.max(this.morphStart + 280, tr.top + scroll - h * 0.5);
      cover = tr.top + scroll + tr.height + h * 0.2;
    } else {
      this.morphStart = Infinity;
      this.morphEnd = Infinity;
    }

    // keep the framebuffer inside gpu limits on very tall pages
    const coverHeight = Math.min(cover, 8192 / dpr);

    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, coverHeight);
    this.camera.left = 0;
    this.camera.right = w;
    this.camera.top = 0;
    this.camera.bottom = -coverHeight;
    this.camera.updateProjectionMatrix();

    // geometry/uniforms just changed, force the next tick to redraw
    this.lastMorph = -1;
  };

  private bind() {
    window.addEventListener("resize", this.onResize);
    // layout above the portrait can shift as late fonts/images land; the print
    // is static so a stale measure leaves it detached from its anchor (this is
    // what put the katakana in the wrong spot on android). re-measure once the
    // fonts settle and once the page has fully loaded
    document.fonts?.ready.then(() => {
      if (!this.disposed) this.measure();
    });
    window.addEventListener("load", this.onLoad);
    const gl = this.renderer.domElement;
    gl.addEventListener("webglcontextlost", this.onContextLost);
    gl.addEventListener("webglcontextrestored", this.onContextRestored);
  }

  private resizeTimer = 0;
  private onResize = () => {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(this.measure, 150);
  };

  private onLoad = () => this.measure();

  // ask the browser to give the context back rather than dying for good, and
  // pause the loop until it does
  private onContextLost = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(this.raf);
  };

  // gl resources were wiped: rebuild geometry + material from the kept image
  // and resume. intro state lives in plain js, so it picks up where it left off
  private onContextRestored = () => {
    if (this.disposed || !this.img) return;
    this.scene.remove(this.points);
    this.points.geometry.dispose();
    this.material.dispose();
    this.buildGeometry(this.img);
    this.measure();
    this.lastT = performance.now();
    this.raf = requestAnimationFrame(this.tick);
    this.rasterizeText().then(() => {
      if (!this.disposed) this.measure();
    });
  };

  private tick = (t: number) => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.tick);

    const dt = Math.min((t - this.lastT) / 1000, 0.05);
    this.lastT = t;
    const u = this.material.uniforms;

    const introRunning = !this.opts.reducedMotion && this.intro < 1.3;
    if (introRunning) this.intro += dt / 1.7;

    const scroll = window.scrollY;
    const morph =
      this.morphEnd === Infinity
        ? 0
        : Math.min(
            1,
            Math.max(
              0,
              (scroll - this.morphStart) / (this.morphEnd - this.morphStart),
            ),
          );

    // the canvas scrolls natively with the page, so a still portrait needs no
    // render at all: only redraw while the intro plays or the morph progresses.
    // no per-frame scrollY chasing means the print stays pixel-locked to the
    // page like the rest of the content
    if (!introRunning && morph === this.lastMorph) return;
    this.lastMorph = morph;

    u.uIntro.value = Math.max(0, Math.min(this.intro, 1.3));
    u.uMorph.value = morph;
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.clearTimeout(this.resizeTimer);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("load", this.onLoad);
    const gl = this.renderer.domElement;
    gl.removeEventListener("webglcontextlost", this.onContextLost);
    gl.removeEventListener("webglcontextrestored", this.onContextRestored);
    this.points?.geometry.dispose();
    this.material?.dispose();
    this.renderer.dispose();
  }
}
