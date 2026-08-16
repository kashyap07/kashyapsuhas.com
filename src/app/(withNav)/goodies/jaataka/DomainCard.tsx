"use client";

import { useState } from "react";

import { GRAHA_NAMES, RASHIS } from "@lib/jyotisha/constants";
import {
  type DomainReading,
  type EventWindow,
  describeDasha,
  ord,
} from "@lib/jyotisha/rules/bhava";
import type { Activation } from "@lib/jyotisha/rules/engine";

const fmt = (d: Date) =>
  d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });


const DOT: Record<string, string> = {
  benefic: "bg-success",
  malefic: "bg-danger",
  mixed: "bg-accent",
};

type Props = {
  reading: DomainReading;
  timing: Activation[];
  windows: EventWindow[];
  now: Date;
};

export default function DomainCard({
  reading,
  timing,
  windows,
  now,
}: Props) {
  const [open, setOpen] = useState(false);
  const { def, houses, observations, summary, supporting, afflicting } = reading;

  const running = timing.find(
    (a) => a.period.start <= now && a.period.end > now,
  );
  // the next windows chronologically, not only the strongest ones. a "full" period
  // may be decades out, and the reader wants to know what is actually next.
  const ahead = timing.filter((a) => a.period.start > now).slice(0, 3);

  return (
    <div className="border-b border-line-subtle py-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-heading-sm font-medium">{def.label}</h3>
        <span className="ml-auto font-sans text-label-sm">
          <span className="text-success">{supporting} for</span>
          <span className="text-subtle"> · </span>
          <span className="text-danger">{afflicting} against</span>
        </span>
      </div>

      {/* the reading itself, which is the point of the card */}
      <div className="mt-2 flex flex-col gap-2">
        {summary.map((line, i) => (
          <p key={i} className={i === 0 ? "text-body-lg" : "text-secondary"}>
            {line}
          </p>
        ))}
      </div>

      {/* the dated answer, which is what most people came for */}
      {def.event && windows.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-line px-4 py-3">
          <p className="font-sans text-label-sm uppercase tracking-wider text-muted">
            when the tradition points to {def.event.phrasing}
          </p>
          {windows.map((w, i) => {
            const past = w.to < now;
            const current = w.from <= now && w.to > now;
            return (
              <div key={i} className="flex flex-col gap-0.5">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span
                    className={`text-body-lg font-medium ${
                      current ? "text-accent" : past ? "text-subtle" : ""
                    }`}
                  >
                    {fmt(w.from)} to {fmt(w.to)}
                  </span>
                  <span className="font-sans text-label-sm text-subtle">
                    age {Math.round(w.ageFrom)} to {Math.round(w.ageTo)}
                  </span>
                  {current && (
                    <span className="font-sans text-label-sm text-accent">
                      running now
                    </span>
                  )}
                  {past && (
                    <span className="font-sans text-label-sm text-subtle">
                      already passed
                    </span>
                  )}
                  <span className="ml-auto font-sans text-label-sm text-subtle">
                    {w.score >= 1 ? "strongest" : "possible"}
                  </span>
                </p>
                <p className="text-sm text-secondary">{w.because}</p>
                {w.triggers.length > 0 && (
                  <p className="font-sans text-label-sm text-subtle">
                    Guru on the bhava{" "}
                    {w.triggers
                      .map((t) => `${fmt(t.from)} to ${fmt(t.to)}`)
                      .join(", ")}
                  </p>
                )}
              </div>
            );
          })}
          <p className="font-sans text-label-sm text-subtle">
            These are the years the classical method points at, narrowed by the
            age at which the event is worth predicting at all. They are not a
            claim that it will happen.
          </p>
        </div>
      )}

      {/* when */}
      {(running || ahead.length > 0) && (
        <div className="mt-4 flex flex-col gap-2 rounded-lg bg-surface-subtle px-4 py-3">
          {running && (
            <p className="text-sm">
              <span className="font-sans uppercase tracking-wider text-subtle">
                now, until {fmt(running.period.end)}{" "}
              </span>
              <span className="text-accent">
                {running.lords.map((l) => GRAHA_NAMES[l].name).join(" / ")}
              </span>
              <span className="text-secondary">
                {" "}
                · {describeDasha(running.lords)}
              </span>
            </p>
          )}
          {ahead.map((a, i) => (
            <p key={i} className="text-sm">
              <span className="font-sans uppercase tracking-wider text-subtle">
                from {fmt(a.period.start)}{" "}
              </span>
              <span className="text-foreground">
                {a.lords.map((l) => GRAHA_NAMES[l].name).join(" / ")}
              </span>
              {a.strength === "full" && (
                <span className="font-sans text-label-sm text-accent">
                  {" "}
                  strongest
                </span>
              )}
              <span className="text-secondary"> · {describeDasha(a.lords)}</span>
            </p>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-3 font-sans text-label-sm uppercase tracking-wider text-subtle transition-colors duration-200 hover:text-accent"
      >
        {open
          ? "hide the chart reasoning"
          : `where this comes from (${observations.length})`}
      </button>

      {open && (
        <div className="mt-3 border-l-2 border-line pl-3">
          <p className="mb-3 font-sans text-sm text-subtle">
            {def.reads}
          </p>

          <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1">
            {houses.map((h) => (
              <span key={h.bhava} className="font-sans text-sm">
                <span className="text-subtle">{ord(h.bhava)} </span>
                {RASHIS[h.rashi].name}
                <span className="text-subtle">
                  {" "}
                  · lord {GRAHA_NAMES[h.lord].name}
                  {h.occupants.length > 0 &&
                    ` · ${h.occupants.map((o) => GRAHA_NAMES[o].short).join(" ")}`}
                </span>
              </span>
            ))}
          </div>

          <ul className="flex flex-col gap-3">
            {observations.map((o, i) => (
              <li key={i}>
                {o.means && (
                  <span className="flex items-baseline gap-2">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${DOT[o.polarity]}`}
                    />
                    <span className="text-sm text-secondary">{o.means}</span>
                  </span>
                )}
                <span className="ml-3.5 block font-sans text-label-sm text-subtle">
                  {o.label} · {o.detail} · {o.source.short},{" "}
                  {o.source.chapter}
                </span>
                {o.contested && (
                  <span className="ml-3.5 block font-sans text-label-sm text-subtle">
                    <span className="uppercase tracking-wider">disputed </span>
                    {o.contested}
                  </span>
                )}
              </li>
            ))}
            {def.note && (
              <li className="font-sans text-label-sm text-subtle">
                <span className="uppercase tracking-wider">note </span>
                {def.note}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
