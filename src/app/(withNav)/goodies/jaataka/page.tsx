"use client";

import { useEffect, useMemo, useState } from "react";

import { formatDms } from "@lib/jyotisha/angles";
import {
  BHAVAS,
  GRAHA_NAMES,
  NAKSHATRAS,
  RASHIS,
} from "@lib/jyotisha/constants";
import { DIGNITY_LABEL, allStates } from "@lib/jyotisha/dignity";
import {
  domainTiming,
  eventWindows,
  readAllDomains,
} from "@lib/jyotisha/rules/bhava";
import {
  buildContext,
  evaluate,
  pastActivations,
  upcomingActivations,
} from "@lib/jyotisha/rules/engine";
import type { GrahaId } from "@lib/jyotisha/types";

import { Wrapper } from "@components/ui";

import DomainCard from "./DomainCard";
import RuleCard from "./RuleCard";
import SouthIndianChart, { type ChartOccupant } from "./SouthIndianChart";
import { PRESET_PLACES, type Place, searchPlaces } from "./geocode";

// the barrel pulls in astronomy-engine, so it is loaded after mount as its own chunk
// rather than sitting in the initial route js. constants, angles, dignity and the rule
// engine are plain data and arithmetic over an already-built chart, with no ephemeris
// dependency, so those are imported normally above.
type Jyotisha = typeof import("@lib/jyotisha");

const GRAHA_ORDER: GrahaId[] = [
  "surya",
  "chandra",
  "kuja",
  "budha",
  "guru",
  "shukra",
  "shani",
  "rahu",
  "ketu",
];

const TZ_OPTIONS: { value: string; label: string }[] = [
  { value: "Asia/Kolkata", label: "India, IST (UTC+5:30)" },
  { value: "bombay", label: "Bombay Time (UTC+4:51), in use until 1955" },
  { value: "calcutta", label: "Calcutta Time (UTC+5:53:20), until 1948" },
  { value: "madras", label: "Madras Time (UTC+5:21:10), until 1906" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Europe/London", label: "London" },
  { value: "America/New_York", label: "New York" },
  { value: "Australia/Sydney", label: "Sydney" },
];

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function JaatakaPage() {
  const [lib, setLib] = useState<Jyotisha | null>(null);

  // a placeholder, deliberately not anyone's real birth data: this page is public and
  // whatever sits here is the chart every visitor lands on
  const [date, setDate] = useState("1990-01-01");
  const [time, setTime] = useState("12:00");
  const [tzKey, setTzKey] = useState("Asia/Kolkata");
  const [place, setPlace] = useState<Place>(PRESET_PLACES[0]);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("@lib/jyotisha").then((mod) => {
      if (!cancelled) setLib(mod);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // debounced place search
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setSearchError(null);
      return;
    }
    const controller = new AbortController();
    const id = setTimeout(() => {
      setSearching(true);
      searchPlaces(query, controller.signal)
        .then((r) => {
          setResults(r);
          setSearchError(r.length ? null : "no matches");
        })
        .catch((e: unknown) => {
          if ((e as Error).name !== "AbortError")
            setSearchError("lookup failed");
        })
        .finally(() => setSearching(false));
    }, 400);
    return () => {
      controller.abort();
      clearTimeout(id);
    };
  }, [query]);

  const result = useMemo(() => {
    if (!lib) return null;
    const [y, mo, d] = date.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    if ([y, mo, d, hh, mm].some((n) => Number.isNaN(n))) return null;

    const local = { year: y, month: mo, day: d, hour: hh, minute: mm };
    const preset = (lib.HISTORICAL_ZONES as Record<string, unknown>)[tzKey];
    const tz = preset
      ? (preset as Parameters<typeof lib.resolveInstant>[1])
      : ({ kind: "iana", zone: tzKey } as const);

    const when = lib.resolveInstant(local, tz);
    const chart = lib.buildChart({
      when,
      latitude: place.lat,
      longitude: place.lon,
    });
    const moonLon = chart.grahas.chandra.lon;

    // one tree at antardasha depth serves both the timeline and the rule timing
    const nested = lib.vimshottari(moonLon, when, { depth: 2 });
    const now = new Date();
    const fired = evaluate(chart);

    return {
      when,
      chart,
      warnings: lib.timeAmbiguities(local, place.label),
      balance: lib.dashaBalance(moonLon),
      tree: lib.vimshottari(moonLon, when, { depth: 1 }),
      running: lib.dashaAt(nested, now),
      states: allStates(chart.grahas),
      now,
      phala: fired.map((rule) => ({
        rule,
        past: pastActivations(rule, nested, now),
        upcoming: upcomingActivations(rule, nested, now),
      })),
      domains: (() => {
        const ctx = buildContext(chart);
        // guru's transits over each domain's primary bhava, computed once over the
        // span the windows can fall in. this is the only part that needs the
        // ephemeris, so it comes from the dynamically loaded lib.
        const horizon = new Date(when.getTime() + 75 * 365.25 * 86400000);
        const guruCache = new Map<number, { from: Date; to: Date }[]>();
        return readAllDomains(ctx).map((reading) => {
          const primary = reading.def.bhavas[0];
          const rashi = chart.bhavaRashi[primary - 1];
          if (!guruCache.has(rashi)) {
            guruCache.set(rashi, lib.guruTouches(rashi, when, horizon));
          }
          return {
            reading,
            timing: domainTiming(reading, nested),
            windows: eventWindows(
              ctx,
              reading,
              nested,
              when,
              guruCache.get(rashi)!,
            ),
          };
        });
      })(),
    };
  }, [lib, date, time, tzKey, place]);

  const occupants = useMemo(() => {
    const map = new Map<number, ChartOccupant[]>();
    if (!result) return map;
    for (const id of GRAHA_ORDER) {
      const g = result.chart.grahas[id];
      const list = map.get(g.rashi) ?? [];
      list.push({ id, vakri: g.vakri });
      map.set(g.rashi, list);
    }
    return map;
  }, [result]);

  const inputCls =
    "rounded border border-line px-3 py-2 font-sans text-sm focus:outline-accent";

  return (
    <Wrapper maxWidth="WIDE" className="mb-section-sm w-full md:mb-section-md">
      <h1 className="mb-8 text-heading-md font-medium md:text-heading-lg">
        Jaataka
      </h1>

      {/* ── inputs ─────────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 rounded-lg bg-surface-subtle p-4 md:p-6">
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-sans text-label-sm uppercase tracking-wider text-muted">
              date
            </span>
            <input
              type="date"
              className={inputCls}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-sans text-label-sm uppercase tracking-wider text-muted">
              time
            </span>
            <input
              type="time"
              className={inputCls}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
          <label className="flex min-w-[16rem] flex-1 flex-col gap-1">
            <span className="font-sans text-label-sm uppercase tracking-wider text-muted">
              timezone of the recorded time
            </span>
            <select
              className={inputCls}
              value={tzKey}
              onChange={(e) => setTzKey(e.target.value)}
            >
              {TZ_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-sans text-label-sm uppercase tracking-wider text-muted">
            birth place
          </span>
          <input
            type="text"
            className={inputCls}
            placeholder="search a place, or pick one below"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {(results.length ? results : PRESET_PLACES).map((p) => (
              <button
                key={`${p.label}${p.lat}`}
                onClick={() => {
                  setPlace(p);
                  setQuery("");
                  setResults([]);
                }}
                className={`rounded border px-2 py-1 text-left font-sans text-label-sm transition-colors duration-200 ${
                  place.label === p.label
                    ? "border-accent text-accent"
                    : "border-line text-muted hover:text-accent"
                }`}
              >
                {p.label.length > 46 ? `${p.label.slice(0, 46)}...` : p.label}
              </button>
            ))}
            {searching && (
              <span className="font-sans text-label-sm text-subtle">
                searching...
              </span>
            )}
            {searchError && (
              <span className="font-sans text-label-sm text-subtle">
                {searchError}
              </span>
            )}
          </div>
          <p className="mt-1 font-sans text-label-sm text-subtle">
            using {place.label} at {place.lat.toFixed(4)},{" "}
            {place.lon.toFixed(4)}. Place search goes to OpenStreetMap
            Nominatim; nothing else leaves your browser.
          </p>
        </div>
      </div>

      {!lib && <p className="text-muted">loading ephemeris...</p>}

      {result && (
        <>
          {/* ── timezone warnings ──────────────────────────────────────── */}
          {result.warnings.map((w) => (
            <div
              key={w.code}
              className="bg-accent/5 mb-4 rounded-lg border border-accent px-4 py-3"
            >
              <p className="font-sans text-sm text-secondary">{w.message}</p>
            </div>
          ))}

          {/* ── summary ────────────────────────────────────────────────── */}
          <div className="mb-8 flex flex-wrap gap-x-10 gap-y-4">
            {/* chandra rashi first: when someone says "my rashi is Kanya" this is the
                one they mean. the lagna is the less familiar of the two and gets
                mistaken for it constantly. */}
            <Fact label="rashi · chandra">
              {RASHIS[result.chart.grahas.chandra.rashi].name}{" "}
              <span className="text-secondary">
                {formatDms(result.chart.grahas.chandra.degInRashi)}
              </span>
            </Fact>
            <Fact label="lagna · rising">
              {RASHIS[result.chart.lagna.rashi].name}{" "}
              <span className="text-secondary">
                {formatDms(result.chart.lagna.degInRashi)}
              </span>
            </Fact>
            <Fact label="janma nakshatra">
              {NAKSHATRAS[result.chart.grahas.chandra.nakshatra].name}
              <span className="text-secondary">
                {" "}
                pada {result.chart.grahas.chandra.pada}
              </span>
            </Fact>
            <Fact label="ayanamsa">{formatDms(result.chart.ayanamsa)}</Fact>
            <Fact label="utc instant">
              <span className="font-sans text-sm">
                {result.when.toISOString().replace(".000Z", "Z")}
              </span>
            </Fact>
          </div>

          {/* the graha table wants seven columns, which is more than it gets sharing a
              row with the chart at this page width, so the chart sits on its own and
              the table runs full width underneath */}
          <div className="mb-10 flex flex-col gap-8">
            <div className="w-full max-w-[24rem]">
              <SouthIndianChart
                lagnaRashi={result.chart.lagna.rashi}
                occupants={occupants}
                centre={
                  <>
                    <span className="font-display text-xl text-accent">
                      {RASHIS[result.chart.lagna.rashi].kannada}
                    </span>
                    <span className="font-sans text-label-sm uppercase tracking-wider text-subtle">
                      lagna
                    </span>
                  </>
                }
              />
            </div>

            {/* ── graha table ──────────────────────────────────────────── */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line font-sans text-label-sm uppercase tracking-wider text-muted">
                    <th className="py-2 pr-3 font-normal">graha</th>
                    <th className="py-2 pr-3 font-normal">rashi</th>
                    <th className="py-2 pr-3 font-normal">degree</th>
                    <th className="py-2 pr-3 font-normal">nakshatra</th>
                    <th className="py-2 pr-3 font-normal">pada</th>
                    <th className="py-2 pr-3 font-normal">bhava</th>
                    <th className="py-2 font-normal">state</th>
                  </tr>
                </thead>
                <tbody>
                  {GRAHA_ORDER.map((id) => {
                    const g = result.chart.grahas[id];
                    const bhava = result.chart.bhava[id];
                    return (
                      <tr
                        key={id}
                        className="border-b border-line-subtle hover:bg-surface-hover"
                      >
                        <td className="py-2 pr-3 font-medium">
                          {GRAHA_NAMES[id].name}
                          {g.vakri && (
                            <span
                              title="vakri (retrograde)"
                              className="text-danger"
                            >
                              {" "}
                              ˚
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3">{RASHIS[g.rashi].name}</td>
                        <td className="py-2 pr-3 tabular-nums text-secondary">
                          {formatDms(g.degInRashi)}
                        </td>
                        <td className="py-2 pr-3">
                          {NAKSHATRAS[g.nakshatra].name}
                        </td>
                        <td className="py-2 pr-3 tabular-nums">{g.pada}</td>
                        <td className="py-2 pr-3 text-secondary">
                          {bhava} {BHAVAS[bhava - 1].name}
                        </td>
                        <td className="py-2 text-secondary">
                          {DIGNITY_LABEL[result.states[id].dignity]}
                          {result.states[id].astangata && (
                            <span
                              className="text-danger"
                              title={`astangata, ${result.states[id].fromSurya.toFixed(1)} degrees from Surya`}
                            >
                              {" "}
                              combust
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="mt-2 font-sans text-label-sm text-subtle">
                ˚ vakri (retrograde). Rahu and Ketu use the mean node, as Indian
                panchangas do, and take their dignity from their dispositor
                since the tradition does not agree on their exaltation.
              </p>
            </div>
          </div>

          {/* ── vimshottari ──────────────────────────────────────────── */}
          <h2 className="mb-1 text-heading-sm font-medium md:text-heading-md">
            Vimshottari Dasha
          </h2>
          <p className="mb-5 font-sans text-sm text-muted">
            balance at birth: {GRAHA_NAMES[result.balance.lord].name}{" "}
            {result.balance.years.toFixed(2)} years
            {result.running.length > 0 && (
              <>
                {" · "}running today:{" "}
                <span className="text-accent">
                  {result.running
                    .map((p) => GRAHA_NAMES[p.lord].name)
                    .join(" / ")}
                </span>
              </>
            )}
          </p>

          <ol className="flex flex-col">
            {result.tree.map((p) => {
              const from = p.startedBeforeBirth ? result.when : p.start;
              const now = Date.now();
              const isNow = now >= p.start.getTime() && now < p.end.getTime();
              return (
                <li
                  key={`${p.lord}${p.start.toISOString()}`}
                  className={`flex flex-wrap items-baseline gap-x-3 border-b border-line-subtle py-2 ${
                    isNow ? "text-accent" : ""
                  }`}
                >
                  <span className="w-20 font-medium">
                    {GRAHA_NAMES[p.lord].name}
                  </span>
                  <span className="font-sans text-sm tabular-nums text-secondary">
                    {fmtDate(from)} to {fmtDate(p.end)}
                  </span>
                  {p.startedBeforeBirth && (
                    <span className="font-sans text-label-sm text-subtle">
                      balance
                    </span>
                  )}
                </li>
              );
            })}
          </ol>

          {/* ── life areas ───────────────────────────────────────────── */}
          <h2 className="mb-1 mt-10 text-heading-sm font-medium md:text-heading-md">
            Life Areas
          </h2>
          <p className="mb-6 max-w-2xl text-secondary">
            Each matter read the classical way: its bhava, where the bhava lord
            went and in what condition, who stands in the bhava and who aspects
            it, and the karaka of that matter. The counts are a tally of the
            reasoning shown, not a traditional measure of strength.
          </p>

          <div className="mb-4 flex flex-col">
            {result.domains.map(({ reading, timing, windows }) => (
              <DomainCard
                key={reading.def.domain}
                reading={reading}
                timing={timing}
                windows={windows}
                now={result.now}
              />
            ))}
          </div>

          {/* ── yogas ────────────────────────────────────────────────── */}
          <h2 className="mb-1 mt-10 text-heading-sm font-medium md:text-heading-md">
            Yogas and Doshas
          </h2>
          <p className="mb-6 max-w-2xl text-secondary">
            Named combinations that fire for this chart, each showing what
            triggered it and where it comes from. Unlike the chart above, none
            of this is verifiable against an ephemeris. It is what the tradition
            claims, shown with its reasoning so you can weigh it yourself.
          </p>

          {result.phala.length === 0 ? (
            <p className="text-muted">
              No rule in the current corpus fires for this chart. The corpus is
              small and deliberately limited to well attested yogas, so silence
              here means the corpus is thin, not that the chart is empty.
            </p>
          ) : (
            <div className="flex flex-col">
              {result.phala.map(({ rule, past, upcoming }) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  past={past}
                  upcoming={upcoming}
                />
              ))}
            </div>
          )}
        </>
      )}
    </Wrapper>
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-sans text-label-sm uppercase tracking-wider text-subtle">
        {label}
      </span>
      <span className="text-body-lg font-medium">{children}</span>
    </div>
  );
}
