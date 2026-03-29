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
    <Wrapper className="mb-section-sm w-full bg-surface md:mb-section-md">
      <h1 className="mb-6 text-heading-lg font-medium md:text-display">
        Panchanga
      </h1>

      {/* controls */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <input
          type="datetime-local"
          className="rounded border border-line bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-line"
          value={inputVal}
          onChange={handleDateChange}
        />
        <button
          onClick={() => setIsLive(true)}
          className={`rounded border px-3 py-2 text-sm transition-colors ${
            isLive
              ? "border-accent bg-accent text-black"
              : "border-line text-subtle hover:border-muted"
          }`}
        >
          {isLive ? "● live" : "use current time"}
        </button>
      </div>

      {error && <p className="mb-6 text-sm text-danger">{error}</p>}

      {panchanga && (
        <>
          {/* element grid */}
          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CARDS.map(({ key, sa: saLabel, en }) => {
              const val = panchanga[key];
              const devaVal = sa(val, key === "nakshatra");
              return (
                <div
                  key={key}
                  className="flex flex-col gap-0.5 rounded-lg border border-line-subtle bg-surface-subtle/60 px-4 py-3"
                >
                  <span className="text-3xl font-semibold leading-tight text-accent">
                    {devaVal}
                  </span>
                  <span className="text-base text-secondary">{val}</span>
                  <span className="text-sm text-subtle">
                    {saLabel} · {en}
                  </span>
                </div>
              );
            })}
          </div>

          {/* sankalpa mantra */}
          <div className="rounded-lg bg-surface-subtle/60 px-6 py-5">
            <p className="text-xl leading-relaxed text-foreground">
              {buildSankalpaSegments(panchanga).map((seg, i) => (
                <span
                  key={i}
                  className={seg.highlight ? "font-semibold text-accent" : ""}
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
