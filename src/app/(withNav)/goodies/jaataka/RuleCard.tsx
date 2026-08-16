"use client";

import { useState } from "react";

import { GRAHA_NAMES } from "@lib/jyotisha/constants";
import type { Activation } from "@lib/jyotisha/rules/engine";
import { DOMAIN_LABEL, type FiredRule } from "@lib/jyotisha/rules/types";

const fmt = (d: Date) =>
  d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });

const POLARITY_DOT: Record<string, string> = {
  benefic: "bg-success",
  malefic: "bg-danger",
  mixed: "bg-accent",
};

type Props = {
  rule: FiredRule;
  past: Activation[];
  upcoming: Activation[];
};

export default function RuleCard({ rule, past, upcoming }: Props) {
  const [open, setOpen] = useState(false);

  // the strongest few, rather than every antardasha, or the card becomes a wall
  const nextFull = upcoming.filter((a) => a.strength === "full").slice(0, 3);
  const lastFull = past.filter((a) => a.strength === "full").slice(-3);

  return (
    <div className="border-b border-line-subtle py-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
            POLARITY_DOT[rule.result.polarity] ?? "bg-subtle"
          }`}
          title={rule.result.polarity}
        />
        <h3 className="text-body-lg font-medium">{rule.name}</h3>
        {rule.kannada && (
          <span className="font-display text-lg text-accent">{rule.kannada}</span>
        )}
        <span className="font-sans text-label-sm uppercase tracking-wider text-subtle">
          {rule.kind}
        </span>
        <span className="font-sans text-label-sm text-subtle">
          {rule.domains.map((d) => DOMAIN_LABEL[d]).join(" · ")}
        </span>
      </div>

      <p className="mt-1 text-secondary">
        <span className="text-subtle">the texts give </span>
        {rule.says}
      </p>

      {/* what actually triggered it */}
      <ul className="mt-3 flex flex-col gap-1">
        {rule.result.factors.map((f, i) => (
          <li key={i} className="font-sans text-sm">
            <span className="text-foreground">{f.label}</span>
            <span className="text-subtle"> · {f.detail}</span>
          </li>
        ))}
      </ul>

      {/* when it is expected to speak */}
      {(nextFull.length > 0 || lastFull.length > 0) && (
        <div className="mt-3 flex flex-col gap-1">
          {lastFull.length > 0 && (
            <p className="font-sans text-sm">
              <span className="uppercase tracking-wider text-subtle">past </span>
              {lastFull.map((a, i) => (
                <span key={i} className="text-secondary">
                  {i > 0 && ", "}
                  {a.lords.map((l) => GRAHA_NAMES[l].name).join("/")}{" "}
                  {fmt(a.period.start)}
                </span>
              ))}
            </p>
          )}
          {nextFull.length > 0 && (
            <p className="font-sans text-sm">
              <span className="uppercase tracking-wider text-subtle">ahead </span>
              {nextFull.map((a, i) => (
                <span key={i} className="text-accent">
                  {i > 0 && ", "}
                  {a.lords.map((l) => GRAHA_NAMES[l].name).join("/")}{" "}
                  {fmt(a.period.start)}
                </span>
              ))}
            </p>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-3 font-sans text-label-sm uppercase tracking-wider text-subtle transition-colors duration-200 hover:text-accent"
      >
        {open ? "hide source" : "source"}
      </button>

      {open && (
        <div className="mt-2 border-l-2 border-line pl-3">
          <p className="font-sans text-sm text-secondary">
            {rule.source.text}, {rule.source.chapter}
          </p>
          {rule.source.note && (
            <p className="mt-1 font-sans text-sm text-subtle">
              {rule.source.note}
            </p>
          )}
          {rule.contested && (
            <p className="mt-1 font-sans text-sm text-subtle">
              <span className="uppercase tracking-wider">disputed </span>
              {rule.contested}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
