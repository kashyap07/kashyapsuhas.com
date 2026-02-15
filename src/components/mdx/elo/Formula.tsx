import katex from "katex";
import "katex/dist/katex.min.css";

interface FormulaProps {
  tex: string;
  inline?: boolean;
}

// renders math formulas using KaTeX
export function Formula({ tex, inline = false }: FormulaProps) {
  const html = katex.renderToString(tex, {
    displayMode: !inline,
    throwOnError: false,
  });

  if (inline) {
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <div
      className="not-prose my-6 overflow-x-auto text-center"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
