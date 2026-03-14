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

// the 3 dynamic sankalpa lines in devanagari
function buildSankalpaDevanagari(p: PanchangaResult): string {
  const ayana = AYANA_LOCATIVE[p.ayana]?.sa ?? sa(p.ayana);
  return [
    `${sa(p.samvatsara)} नाम सम्वत्सरे, ${ayana}, ${sa(p.ritu)} ऋतौ,`,
    `${sa(p.maasa)} मासे, ${sa(p.paksha)} पक्षे, ${sa(p.tithi)} तिथौ,`,
    `${sa(p.vaasara)}वासरे, ${sa(p.nakshatra, true)} नक्षत्रे,`,
  ].join("\n");
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
    <Wrapper className="mb-12 w-full bg-white md:mb-20">
      <h1 className="mb-6 text-5xl font-medium text-gray-900 md:text-8xl">
        Panchanga
      </h1>

      {/* controls */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <input
          type="datetime-local"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
          value={inputVal}
          onChange={handleDateChange}
        />
        <button
          onClick={() => setIsLive(true)}
          className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
            isLive
              ? "border-[--columbiaYellow] bg-[--columbiaYellow] text-black"
              : "border-gray-200 text-gray-400 hover:border-gray-400"
          }`}
        >
          {isLive ? "● live" : "use current time"}
        </button>
      </div>

      {error && <p className="mb-6 text-sm text-red-500">{error}</p>}

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
                  className="flex flex-col gap-0.5 rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-3"
                >
                  <span className="text-3xl font-semibold leading-tight text-columbiaYellow">
                    {devaVal}
                  </span>
                  <span className="text-base text-gray-700">{val}</span>
                  <span className="text-sm text-gray-400">
                    {saLabel} · {en}
                  </span>
                </div>
              );
            })}
          </div>

          {/* sankalpa mantra */}
          <div className="rounded-lg bg-gray-50/60 px-6 py-5">
            <p className="text-xl leading-loose text-gray-800">
              {buildSankalpaDevanagari(panchanga)
                .split("\n")
                .map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
            </p>
          </div>
        </>
      )}
    </Wrapper>
  );
}
