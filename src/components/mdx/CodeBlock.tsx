"use client";

import { useEffect, useRef, useState } from "react";

import { Check, Copy, FileCode } from "lucide-react";

interface Props {
  /** shiki output: <pre class="shiki"><code><span class="line">... */
  html: string;
  /** the raw source, kept verbatim so copy gives back exactly what was written */
  raw: string;
  /** language as the author wrote it on the fence. exposed as an attribute,
   *  not painted: a floating label sat on top of long lines and was unreadable */
  lang: string;
  /** optional filename from the fence meta: ```js title="foo.js" */
  title?: string;
}

// the visible shell around a highlighted fence: copy button plus the shiki
// markup. highlighting happens on the server (lib/highlight), this exists
// purely because clipboard access needs a client component.
//
// the class names are load bearing beyond styling. reader modes (safari
// reader, and every readability descendant) score a div by its class string
// and delete anything scoring negative. "hidden" and "scroll" are both in
// that negative list, so `overflow-hidden` + `code-scroll` used to get every
// code block on the page thrown away. `overflow-clip` is neutral and
// "code-body" scores positive. don't reintroduce either word here.
export function CodeBlock({ html, raw, lang, title }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  // a stray timer outliving the component is the exact bug this post is about
  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(raw);
    } catch {
      return; // insecure origin or permission denied, leave the label alone
    }
    setCopied(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  const copyButton = (inBar: boolean) => (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy code"}
      className={`pointer-events-auto rounded text-code-faint opacity-100 transition-all duration-200 hover:text-foreground focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100 ${
        inBar
          ? // flat inside the bar. negative margin so it never grows the bar
            "-my-1 ml-auto shrink-0 p-1 hover:bg-code"
          : "border border-code-line bg-code-chip p-1.5 shadow-sm"
      }`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
    </button>
  );

  return (
    <div
      data-language={lang}
      className="not-prose group relative my-7 overflow-clip rounded-lg bg-code md:-mx-4"
    >
      {/* filename bar. "header" is a negative reader mode word, hence
          code-title. with a title the copy button lives in here instead of
          floating over the bar's border */}
      {title ? (
        <div className="code-title flex items-start gap-2 border-b border-code-line bg-code-chip px-4 py-2.5 pr-2 font-mono text-xs leading-4 text-code-faint">
          <FileCode className="h-4 w-4 shrink-0" aria-hidden />
          {/* dim the directories, let the filename itself read */}
          <span className="break-all">
            {title.slice(0, title.lastIndexOf("/") + 1)}
            <span className="font-medium text-[var(--code-fg)]">
              {title.slice(title.lastIndexOf("/") + 1)}
            </span>
          </span>
          {copyButton(true)}
        </div>
      ) : (
        // copy sits absolute so it never pushes the code down, and above the
        // scroll container so a wide line scrolls under it rather than
        // dragging it sideways. opaque, because it does overlap long lines.
        <div className="pointer-events-none absolute right-2 top-2 z-10 flex items-center">
          {copyButton(false)}
        </div>
      )}

      <div
        className="code-body overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
