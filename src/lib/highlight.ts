import { type Highlighter, createHighlighter } from "shiki";

// shiki highlighting for mdx code fences. runs at build (blog pages are
// force-static), so none of this reaches the client bundle.
//
// theme picked on measured contrast against the code surface, not on vibes.
// vitesse-light was warm and pretty and unreadable: 32 of 68 tokens in a plain
// js sample fell under 3:1. github-light-default puts every token over 4.3:1
// (avg ~9.7) while staying restrained, and its brown params + purple callables
// sit fine on a warm ground. light-plus scores marginally better and looks like
// a 2015 ide, pure #0000FF keywords and all.
// re-measure before swapping this: contrast is the constraint, not taste.

export const THEME = "github-light-default";

// only what the posts actually use, plus aliases. an unknown fence renders as
// plain text rather than throwing the page away.
const LANGS = [
  "bash",
  "javascript",
  "json",
  "jsx",
  "tsx",
  "typescript",
] as const;

const ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  console: "bash",
};

// one highlighter for the whole build. creating it is expensive (it compiles
// textmate grammars), so the promise is cached rather than the resolved value:
// concurrent callers await the same in-flight load instead of racing to make
// their own.
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: [THEME],
    langs: [...LANGS],
  });
  return highlighterPromise;
}

export function normalizeLang(raw: string | undefined): string {
  if (!raw) return "text";
  const lang = raw.toLowerCase();
  return ALIASES[lang] ?? lang;
}

export interface Highlighted {
  html: string;
  /** the language actually used, after aliasing and the unknown-lang fallback */
  lang: string;
}

export async function highlightCode(
  code: string,
  rawLang: string | undefined,
): Promise<Highlighted> {
  const requested = normalizeLang(rawLang);
  const highlighter = await getHighlighter();
  const known = highlighter.getLoadedLanguages();
  const lang = known.includes(requested) ? requested : "text";

  const html = highlighter.codeToHtml(code, {
    lang,
    theme: THEME,
    structure: "classic",
    transformers: [
      {
        // shiki inlines the theme's background/foreground on <pre>, which
        // would beat any stylesheet rule. drop it so the code surface is
        // owned by globals.css (--code-bg / --code-fg) and stays one edit.
        // tabindex stays: it makes a scrolling block keyboard reachable.
        //
        // the "\n" text nodes shiki puts between line spans are left alone.
        // they are the only line breaks a css-less reader gets (safari
        // reader, rss, screen readers, plain text extraction), so the lines
        // must not be display:block or the preserved newline doubles every
        // row's height. see .code-body in globals.css.
        pre(node) {
          delete node.properties.style;
        },
      },
    ],
  });

  return { html, lang: requested };
}
