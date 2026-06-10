import { ReactNode } from "react";

// tiny shared footnote system for mdx posts. usage:
//   inline:   ...crown jewel of my _soloyolos_<Fn n={1} />
//   at the end of the post:
//   <Footnotes>
//     <Footnote n={1}>explanation here</Footnote>
//   </Footnotes>

export function Fn({ n }: { n: number | string }) {
  return (
    <sup id={`fnref-${n}`} className="scroll-mt-12 font-sans text-xs">
      <a href={`#fn-${n}`} className="no-underline">
        [{n}]
      </a>
    </sup>
  );
}

export function Footnotes({ children }: { children: ReactNode }) {
  return (
    <section className="not-prose mt-14 border-t border-line pt-4 font-sans text-sm text-muted">
      <ol className="flex list-none flex-col gap-2 p-0">{children}</ol>
    </section>
  );
}

export function Footnote({
  n,
  children,
}: {
  n: number | string;
  children: ReactNode;
}) {
  return (
    <li id={`fn-${n}`} className="scroll-mt-12">
      <span className="mr-1 text-subtle">[{n}]</span>
      {children}{" "}
      <a
        href={`#fnref-${n}`}
        aria-label="back to text"
        className="no-underline"
      >
        ↩
      </a>
    </li>
  );
}
