import slugify from "@utils/slugify";

export interface Heading {
  /** matches the id createHeading() puts on the rendered element */
  id: string;
  text: string;
  level: 2 | 3;
}

// fenced blocks are stripped first: `# comment` inside a bash fence is a
// comment, not a section, and the memory-leaks post is full of them.
const FENCE = /^```[\s\S]*?^```/gm;

// h2 and h3 only. h1 is the post title (rendered outside the article) and h4+
// is too granular to be worth a row in a sidebar.
const HEADING = /^(#{2,3})\s+(.+?)\s*$/gm;

// trip posts have no markdown h2s: every section is a <Stop>, which renders an
// h2 with the same slugify(title) id. without this a 27 stop travelogue looks
// like a one heading post and gets no toc at all.
const STOP = /^<Stop\b[^>]*?\stitle="([^"]+)"/gm;

// strip the inline markdown that would otherwise show up as literal syntax in
// the sidebar: `code`, **bold**, _em_, [text](href).
function plain(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_]/g, "")
    .trim();
}

export function extractHeadings(source: string): Heading[] {
  const body = source.replace(FENCE, "");
  // collected with their source offset so markdown headings and stops end up
  // interleaved in document order, which is what the toc's scroll tracking
  // assumes
  const found: { at: number; heading: Heading }[] = [];

  for (const m of body.matchAll(HEADING)) {
    const text = plain(m[2]);
    if (!text) continue;
    found.push({
      at: m.index,
      heading: { id: slugify(text), text, level: m[1].length === 2 ? 2 : 3 },
    });
  }

  for (const m of body.matchAll(STOP)) {
    // titles are jsx attributes, already plain text
    const text = m[1].trim();
    if (!text) continue;
    found.push({ at: m.index, heading: { id: slugify(text), text, level: 2 } });
  }

  return found.sort((a, b) => a.at - b.at).map((f) => f.heading);
}
