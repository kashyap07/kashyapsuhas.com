import { Children, ReactElement, ReactNode, isValidElement } from "react";

// shared footnote system for mdx posts. notes are keyed by a stable id and
// numbered automatically from the order their markers appear in the source, so
// slipping a new one into the middle of a post doesn't mean renumbering every
// later note by hand. usage:
//   inline:   ...crown jewel of my _soloyolos_<Fn id="soloyolo" />
//   at the end of the post:
//   <Footnotes>
//     <Footnote id="soloyolo">explanation here</Footnote>
//   </Footnotes>
//
// the numbers can't come from react context or from <Footnotes> itself: <Fn>
// renders first and nothing later in the tree can reach back and tell an
// already-rendered marker its number. so the raw mdx source is scanned once up
// front and the resulting id -> number map is closed over by the bound
// components, the same shape as bindTripComponents.

const FN_MARKER = /<Fn\s+id="([^"]+)"/g;

export type FootnoteIndex = Map<string, { num: number; refs: number }>;

// document order of first reference is the numbering a reader expects.
export function scanFootnotes(source: string): FootnoteIndex {
  const index: FootnoteIndex = new Map();
  for (const [, id] of source.matchAll(FN_MARKER)) {
    const seen = index.get(id);
    if (seen) seen.refs++;
    else index.set(id, { num: index.size + 1, refs: 1 });
  }
  return index;
}

// same treatment as the trip components: surface authoring mistakes in the page
// instead of failing silently or throwing the whole post away.
function Broken({ children }: { children: ReactNode }) {
  return (
    <span className="rounded border border-line bg-surface-subtle px-1 font-sans text-xs text-danger">
      {children}
    </span>
  );
}

export function bindFootnoteComponents(source: string) {
  const index = scanFootnotes(source);

  // a note referenced once owns the `fnref-` anchor outright. referenced twice,
  // that id would be duplicated in the dom, so no marker claims it and the note
  // drops its back-link rather than sending readers to an arbitrary occurrence.
  const anchored = (id: string) => index.get(id)?.refs === 1;

  function Fn({ id }: { id: string }) {
    const entry = index.get(id);
    if (!entry) return <Broken>unknown footnote: {id}</Broken>;
    return (
      <sup
        id={anchored(id) ? `fnref-${id}` : undefined}
        className="scroll-mt-12 font-sans text-xs"
      >
        <a href={`#fn-${id}`} className="no-underline">
          [{entry.num}]
        </a>
      </sup>
    );
  }

  function Footnote({ id, children }: { id: string; children: ReactNode }) {
    const entry = index.get(id);
    return (
      <li id={`fn-${id}`} className="scroll-mt-12">
        <span className="mr-1 text-subtle">[{entry?.num ?? "?"}]</span>
        {children}{" "}
        {!entry && (
          <Broken>no &lt;Fn id=&quot;{id}&quot; /&gt; in the post</Broken>
        )}
        {entry && anchored(id) && (
          <a
            href={`#fnref-${id}`}
            aria-label="back to text"
            className="no-underline"
          >
            ↩
          </a>
        )}
      </li>
    );
  }

  // ordered by number so the list always reads in the same order as the
  // markers, however the <Footnote>s happen to be arranged in the mdx.
  // anything unreferenced sorts to the bottom with its [?] marker.
  function Footnotes({ children }: { children: ReactNode }) {
    const rank = (node: ReactElement<{ id?: string }>) =>
      (node.props.id && index.get(node.props.id)?.num) || Infinity;
    const ordered = Children.toArray(children)
      .filter((c): c is ReactElement<{ id?: string }> => isValidElement(c))
      .sort((a, b) => rank(a) - rank(b));

    return (
      <section className="not-prose mt-14 border-t border-line pt-4 font-sans text-sm text-muted">
        <ol className="flex list-none flex-col gap-2 p-0">{ordered}</ol>
      </section>
    );
  }

  return { Fn, Footnotes, Footnote };
}
