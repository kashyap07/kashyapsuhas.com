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
  const out: Heading[] = [];

  for (const [, hashes, rawText] of body.matchAll(HEADING)) {
    const text = plain(rawText);
    if (!text) continue;
    out.push({
      id: slugify(text),
      text,
      level: hashes.length === 2 ? 2 : 3,
    });
  }

  return out;
}
