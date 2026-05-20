"use client";

import { useEffect, useState } from "react";

import { Wrapper } from "@components/ui";

import { type PanchangaResult, computePanchanga } from "./calculations";
import { DEVANAGARI, DEVANAGARI_NAKSHATRA } from "./data";

// helper: english → devanagari, with nakshatra-aware override
function sa(value: string, isNakshatra = false): string {
  const map = isNakshatra ? DEVANAGARI_NAKSHATRA : DEVANAGARI;
  return map[value] ?? value;
}

// locative (सप्तमी विभक्ति) forms for ayana
const AYANA_LOCATIVE: Record<string, { sa: string; en: string }> = {
  Uttarayana: { sa: "उत्तरायणे", en: "Uttarayane" },
  Dakshinayana: { sa: "दक्षिणायने", en: "Dakshinayane" },
};

// sankalpa mantra as inline segments, dynamic values highlighted
type SankalpaSegment = { text: string; highlight?: boolean };

function buildSankalpaSegments(p: PanchangaResult): SankalpaSegment[] {
  const ayana = AYANA_LOCATIVE[p.ayana]?.sa ?? sa(p.ayana);
  return [
    { text: "... " },
    { text: sa(p.samvatsara), highlight: true },
    { text: " नाम सम्वत्सरे, " },
    { text: ayana, highlight: true },
    { text: ", " },
    { text: sa(p.ritu), highlight: true },
    { text: " ऋतौ, " },
    { text: sa(p.maasa), highlight: true },
    { text: " मासे, " },
    { text: sa(p.paksha), highlight: true },
    { text: " पक्षे, " },
    { text: sa(p.tithi), highlight: true },
    { text: " तिथौ, " },
    { text: sa(p.vaasara), highlight: true },
    { text: "वासर युक्तायाम्, " },
    { text: sa(p.nakshatra, true), highlight: true },
    { text: " नक्षत्र ..." },
  ];
}

const CARDS: {
  key: keyof PanchangaResult;
  sa: string; // sanskrit category label in devanagari
  en: string; // english label
}[] = [
  { key: "samvatsara", sa: "सम्वत्सर", en: "year" },
  { key: "ayana", sa: "अयन", en: "solar transit" },
  { key: "ritu", sa: "ऋतु", en: "season" },
  { key: "maasa", sa: "मास", en: "month" },
  { key: "paksha", sa: "पक्ष", en: "fortnight" },
  { key: "tithi", sa: "तिथि", en: "lunar day" },
  { key: "vaasara", sa: "वासर", en: "weekday" },
  { key: "nakshatra", sa: "नक्षत्र", en: "lunar mansion" },
];

function formatDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export default function PanchangaPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [inputVal, setInputVal] = useState("");
  const [isLive, setIsLive] = useState(true);

  const [panchanga, setPanchanga] = useState<PanchangaResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputVal(formatDatetimeLocal(new Date()));
  }, []);

  useEffect(() => {
    if (!isLive) return;
    const tick = () => {
      const now = new Date();
      setDate(now);
      setInputVal(formatDatetimeLocal(now));
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [isLive]);

  useEffect(() => {
    try {
      setPanchanga(computePanchanga(date));
      setError(null);
    } catch (e) {
      setError(String(e));
    }
  }, [date]);

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIsLive(false);
    const parsed = new Date(e.target.value);
    if (!isNaN(parsed.getTime())) setDate(parsed);
    setInputVal(e.target.value);
  }

  return (
    <Wrapper className="mb-section-sm w-full md:mb-section-md">
      <h1 className="mb-8 text-heading-md font-medium md:text-heading-lg">
        Panchanga
      </h1>

      {/* controls */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <input
          type="datetime-local"
          className="rounded border border-line px-3 py-2 font-sans text-sm focus:outline-accent"
          value={inputVal}
          onChange={handleDateChange}
        />
        <button
          onClick={() => setIsLive(true)}
          className={`rounded px-3 py-2 font-sans text-sm font-medium transition-colors ${
            isLive
              ? "bg-accent text-black"
              : "border border-line text-muted hover:text-accent"
          }`}
        >
          {isLive ? "● live" : "use current time"}
        </button>
      </div>

      {error && <p className="mb-6 font-sans text-sm text-danger">{error}</p>}

      {panchanga && (
        <>
          {/* element grid */}
          <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-4">
            {CARDS.map(({ key, sa: saLabel, en }) => {
              const val = panchanga[key];
              const devaVal = sa(val, key === "nakshatra");
              return (
                <div key={key} className="flex flex-col gap-1">
                  <span className="font-display text-2xl leading-tight text-accent md:text-3xl">
                    {devaVal}
                  </span>
                  <span className="text-sm text-secondary md:text-base">
                    {val}
                  </span>
                  <span className="flex items-baseline gap-1 font-sans text-subtle">
                    <span className="text-sm uppercase tracking-wider">
                      {saLabel}
                    </span>
                    ·<span className="text-xs lowercase">{en}</span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* sankalpa mantra */}
          <div className="mt-4 rounded-lg bg-surface-subtle px-6 py-5 md:px-8 md:py-6">
            <h2 className="mb-3 font-sans text-xs uppercase tracking-wider text-muted">
              sankalpa
            </h2>
            <p className="text-lg leading-relaxed">
              {buildSankalpaSegments(panchanga).map((seg, i) => (
                <span
                  key={i}
                  className={seg.highlight ? "font-medium text-accent" : ""}
                >
                  {seg.text}
                </span>
              ))}
            </p>
          </div>
        </>
      )}
    </Wrapper>
  );
}
