"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// a text box that gets genuinely worse the more you leak.
//
// the input itself does NOTHING. every bit of work below belongs to panels that
// are no longer on screen: each "leak a panel" click registers a window
// listener whose closure still holds its own 30k row index and a detached dom
// subtree, and re-ranks that whole index on every keystroke. nothing removes
// the listener, so the cost stacks forever.
//
// the lag is real work, not a setTimeout. the memory is real allocation.
// the one dishonest bit: this component removes its own listeners when the
// post unmounts, because leaving them on a reader's tab would be rude.

const LEAK_ROWS = 30000; // each dead panel's retained index
const DETACHED_NODES = 300; // detached divs each dead panel hangs on to
const MAX_LEAKS = 15; // past this your laptop starts making noises

const WORDS = [
  "auth",
  "token",
  "refresh",
  "session",
  "cart",
  "checkout",
  "invoice",
  "refund",
  "webhook",
  "retry",
  "queue",
  "worker",
  "timeout",
  "socket",
  "upload",
  "avatar",
  "profile",
  "settings",
  "billing",
  "seat",
  "dashboard",
  "widget",
  "chart",
  "export",
  "filter",
  "sort",
  "pagination",
  "cursor",
  "migration",
  "rollback",
  "flag",
  "rollout",
  "latency",
  "cache",
  "stale",
  "invalidate",
  "listener",
  "observer",
  "detached",
  "closure",
];

// deterministic, so nothing here can produce a hydration mismatch. every row is
// a fresh `join` rather than a shared literal, otherwise v8 hands out one
// interned string and the "memory" never actually grows.
function buildIndex(rows: number, tag: number): string[] {
  const out: string[] = new Array(rows);
  for (let i = 0; i < rows; i++) {
    const parts: string[] = [];
    for (let w = 0; w < 12; w++) {
      parts.push(WORDS[(i * 7 + w * 13 + tag * 31) % WORDS.length]);
    }
    parts.push(`p${tag}`, `r${i}`);
    out[i] = parts.join(" ");
  }
  return out;
}

// never appended to the document, so these nodes are detached the moment they
// exist. devtools calls them "Detached HTMLDivElement".
function buildDetachedPanel(nodes: number, tag: number): HTMLDivElement {
  const root = document.createElement("div");
  root.className = `leaked-panel-${tag}`;
  for (let i = 0; i < nodes; i++) {
    const row = document.createElement("div");
    row.textContent = `result ${tag}-${i}`;
    root.appendChild(row);
  }
  return root;
}

// subsequence match, fzf style, plus a word boundary bonus. scans the whole
// row every time rather than bailing on first match, because it wants the best
// match and not the first one. exactly what a hand rolled fuzzy panel does.
function fuzzyScore(hay: string, needle: string): number {
  let score = 0;
  let n = 0;
  for (let i = 0; i < hay.length; i++) {
    const c = hay.charCodeAt(i);
    if (n < needle.length && c === needle.charCodeAt(n)) {
      score += hay.length - i;
      n++;
    } else if (c === 32) {
      score += 1;
    }
  }
  return n === needle.length ? score : -1;
}

// what one dead panel does on every single keystroke: lowercase its whole
// index, score all of it, then rank it. for a panel nobody can see.
// the alphabetical tie break is the expensive bit and it is not a strawman:
// on a query that matches nothing, every row scores -1, so every comparison
// falls through to the string compare.
function rankAll(rows: string[], query: string): number {
  const needle = query.toLowerCase();
  const scored: { row: string; score: number }[] = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].toLowerCase();
    scored[i] = { row, score: fuzzyScore(row, needle) };
  }
  scored.sort((a, b) =>
    b.score !== a.score ? b.score - a.score : a.row < b.row ? -1 : 1,
  );
  return scored.length;
}

// keeps the dead panels' work observable so nothing gets optimised away
const sink = { hits: 0 };

type PerfWithMemory = Performance & {
  memory?: { usedJSHeapSize: number };
};

const fmt = (n: number) => n.toLocaleString("en-US");

export function LeakySearch() {
  const [value, setValue] = useState("");
  const [leaks, setLeaks] = useState(0);
  const [latency, setLatency] = useState(0);
  const [heapMB, setHeapMB] = useState<number | null>(null);

  const leaked = useRef<((e: Event) => void)[]>([]);
  const meter = useRef<((e: Event) => void) | null>(null);
  const startedAt = useRef(0);

  // the meter has to be the LAST window listener so it reads the clock after
  // every leaked handler has finished. re-registering moves it back to the end.
  const remountMeter = useCallback(() => {
    if (meter.current) window.removeEventListener("input", meter.current);
    const fn = () => setLatency(performance.now() - startedAt.current);
    window.addEventListener("input", fn);
    meter.current = fn;
  }, []);

  useEffect(() => {
    remountMeter();

    const listeners = leaked;
    const meterRef = meter;
    return () => {
      listeners.current.forEach((fn) =>
        window.removeEventListener("input", fn),
      );
      listeners.current = [];
      if (meterRef.current) {
        window.removeEventListener("input", meterRef.current);
      }
    };
  }, [remountMeter]);

  // chrome only, non-standard, quantised. good enough to watch a number climb.
  // `performance.memory` hands back a fresh snapshot object per access, so this
  // has to go through the getter every tick. holding the reference reads stale.
  useEffect(() => {
    if (!(performance as PerfWithMemory).memory) return;
    const read = () => {
      const used = (performance as PerfWithMemory).memory?.usedJSHeapSize;
      if (used !== undefined) setHeapMB(used / 1048576);
    };
    read();
    const id = window.setInterval(read, 800);
    return () => window.clearInterval(id);
  }, []);

  const addLeak = () => {
    if (leaked.current.length >= MAX_LEAKS) return;

    const tag = leaked.current.length + 1;
    const index = buildIndex(LEAK_ROWS, tag);
    const detached = buildDetachedPanel(DETACHED_NODES, tag);

    // this is the whole bug. the panel is gone. this closure is not, and it is
    // still holding `index` and `detached` by the collar.
    const handler = (e: Event) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) return;
      sink.hits = rankAll(index, target.value) + detached.childElementCount;
    };

    window.addEventListener("input", handler);
    leaked.current.push(handler);
    remountMeter();
    setLeaks(leaked.current.length);
  };

  const reset = () => {
    // literally what the cleanup function was supposed to do
    leaked.current.forEach((fn) => window.removeEventListener("input", fn));
    leaked.current = [];
    setLeaks(0);
    setLatency(0);
  };

  const tone =
    latency >= 50
      ? "text-danger"
      : latency >= 16
        ? "text-accent"
        : "text-success";

  const capped = leaks >= MAX_LEAKS;

  return (
    <div className="not-prose my-8 rounded-lg border border-line p-4 md:p-6">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <span className="font-sans text-xs uppercase tracking-wide text-muted">
          type anything
        </span>
        <span className="font-sans text-xs text-muted">
          {leaks === 0 ? "clean" : `${leaks} dead panel${leaks > 1 ? "s" : ""}`}
        </span>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => {
          startedAt.current = performance.now();
          setValue(e.target.value);
        }}
        placeholder="mash the keyboard"
        aria-label="type here to feel the leak"
        className="w-full rounded border border-line p-2 font-sans focus:outline-accent"
      />

      {/* latency bar. 150ms of blocked main thread fills it */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <span className="font-sans text-xs uppercase tracking-wide text-muted">
            main thread blocked
          </span>
          <span className={`font-mono text-lg font-medium ${tone}`}>
            {latency.toFixed(1)} ms
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line-subtle">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              latency >= 50
                ? "bg-danger"
                : latency >= 16
                  ? "bg-accent"
                  : "bg-success"
            }`}
            style={{ width: `${Math.min(100, (latency / 150) * 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="leaked listeners" value={fmt(leaks)} />
        <Stat label="rows retained" value={fmt(leaks * LEAK_ROWS)} />
        <Stat
          label="detached nodes"
          value={fmt(leaks * (DETACHED_NODES + 1))}
        />
        <Stat
          label="js heap"
          value={heapMB === null ? "chrome only" : `${heapMB.toFixed(1)} MB`}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addLeak}
          disabled={capped}
          className="rounded bg-accent px-4 py-2 font-sans font-medium text-black transition-all duration-100 ease-in-out hover:shadow-md disabled:opacity-50 disabled:hover:shadow-none"
        >
          leak a panel
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded border border-line px-4 py-2 font-sans text-sm font-medium transition-colors hover:bg-surface-subtle"
        >
          reset
        </button>
        {capped && (
          <span className="font-sans text-xs text-muted">
            that&apos;s enough, your fans have feelings
          </span>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-subtle px-3 py-2">
      <div className="font-sans text-xs uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-base text-foreground">{value}</div>
    </div>
  );
}
