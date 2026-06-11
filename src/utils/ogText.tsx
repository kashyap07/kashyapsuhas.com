// helpers for og image text. satori (next/og) can't shape indic scripts:
// conjuncts and vowel signs come out mangled. for text containing those
// scripts we shape each word ourselves with harfbuzz and hand satori
// ready-made svg <img>s instead of raw text.

export const FRAUNCES = "Fraunces:opsz,wght,SOFT,WONK@144,600,100,1";

// script blocks needing real shaping, with a matching google font
const COMPLEX_SCRIPTS: { re: RegExp; family: string }[] = [
  { re: /[ಀ-೿]/, family: "Noto+Serif+Kannada:wght@600" },
  { re: /[ऀ-ॿ]/, family: "Noto+Serif+Devanagari:wght@600" },
];

export function hasComplexScript(text: string) {
  return COMPLEX_SCRIPTS.some((s) => s.re.test(text));
}

// google fonts css2 returns a static, subsetted ttf when given exact axis
// values + text (subsetter closes over GSUB so conjunct glyphs come along).
// null on any failure so callers can degrade gracefully.
export async function loadGoogleFont(
  family: string,
  text: string,
): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const resource = css.match(
      /src: url\((.+)\) format\('(opentype|truetype)'\)/,
    );
    if (!resource) return null;
    const res = await fetch(resource[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

// shared ascent/descent fractions (of upem) so words shaped in different
// fonts get the same box and their baselines line up in a flex row
const ASC = 1.2;
const DESC = 0.55;

export type ShapedWord = { src: string; width: number; height: number };

type Shaper = (word: string) => ShapedWord;

// shape every word of `text` into an svg data uri. words in a complex script
// use that script's font, the rest use fraunces. null on any failure.
export async function shapeWords(
  text: string,
  fontSize: number,
  color: string,
): Promise<ShapedWord[] | null> {
  try {
    const hb = await import("harfbuzzjs");

    const makeShaper = (fontData: ArrayBuffer): Shaper => {
      const blob = new hb.Blob(fontData);
      const face = new hb.Face(blob, 0);
      const font = new hb.Font(face);
      const upem = face.upem;

      return (word: string) => {
        const buf = new hb.Buffer();
        buf.addText(word);
        buf.guessSegmentProperties();
        hb.shape(font, buf);
        const glyphs = buf.getGlyphInfosAndPositions();

        let x = 0;
        let paths = "";
        for (const g of glyphs) {
          const d = font.glyphToPath(g.codepoint);
          if (d)
            paths += `<path transform="translate(${x + g.xOffset} ${g.yOffset})" d="${d}"/>`;
          x += g.xAdvance;
        }

        // glyph paths are font units, y-up: flip inside a viewBox that puts
        // the baseline at y=0
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${-ASC * upem} ${x} ${(ASC + DESC) * upem}" fill="${color}"><g transform="scale(1 -1)">${paths}</g></svg>`;
        return {
          src: `data:image/svg+xml,${encodeURIComponent(svg)}`,
          width: (x / upem) * fontSize,
          height: (ASC + DESC) * fontSize,
        };
      };
    };

    const neededScripts = COMPLEX_SCRIPTS.filter((s) => s.re.test(text));
    const families = [FRAUNCES, ...neededScripts.map((s) => s.family)];
    const buffers = await Promise.all(
      families.map((f) => loadGoogleFont(f, text)),
    );
    if (buffers.some((b) => !b)) return null;

    const shapers = new Map<string, Shaper>(
      families.map((f, i) => [f, makeShaper(buffers[i]!)]),
    );

    return text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => {
        const script = neededScripts.find((s) => s.re.test(word));
        return shapers.get(script ? script.family : FRAUNCES)!(word);
      });
  } catch {
    return null;
  }
}

// flex-wrapping row of shaped word images, drop-in for a text title
export function ShapedTitle({
  words,
  fontSize,
  style,
}: {
  words: ShapedWord[];
  fontSize: number;
  style?: Record<string, unknown>;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        columnGap: Math.round(fontSize * 0.28),
        ...style,
      }}
    >
      {words.map((w, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={w.src} width={w.width} height={w.height} alt="" />
      ))}
    </div>
  );
}
