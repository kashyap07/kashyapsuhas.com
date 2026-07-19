"use client";

import { useEffect, useRef, useState } from "react";

import { RagaPlayer } from "@lib/carnatic/audio";
import { POSITIONS } from "@lib/carnatic/pitches";
import { PitchFrame } from "@lib/carnatic/yin";

import { Wrapper } from "@components/ui";

import PitchLattice, { TracePoint } from "./components/PitchLattice";
import { useMicPitch } from "./hooks/useMicPitch";
import {
  GATES,
  MelaRank,
  NoteTracker,
  SA_STOPS,
  SaSetting,
  centsFromHz,
  foldCents,
  heardCount,
  makeHistogram,
  nearestSvara,
  pickSaHz,
  rankMelas,
  saHzFor,
  settingFromHz,
  suggestSaOffset,
  svaraMasses,
  totalMass,
} from "./logic";

const SUB = ["", "₁", "₂", "₃"] as const;

// enharmonic names share a position, label them together like the keyboard
const POS_LABELS = POSITIONS.map((p) => ({
  kannada: p.svaras.map((s) => s.kannada + SUB[s.variant]).join("/"),
  latin: p.svaras.map((s) => s.latin).join(" "),
}));

// g in the normal register (196 hz), the classic sruti-box default
const DEFAULT_SA: SaSetting = { stop: 7, octave: 0, fine: 0 };

const OCTAVES: { value: SaSetting["octave"]; label: string }[] = [
  { value: -1, label: "low" },
  { value: 0, label: "normal" },
  { value: 1, label: "high" },
];

const saName = (s: SaSetting) =>
  SA_STOPS[s.stop].label +
  (s.fine !== 0 ? ` ${s.fine > 0 ? "+" : ""}${s.fine}¢` : "") +
  (s.octave === -1 ? " (low)" : s.octave === 1 ? " (high)" : "");

type Ui = {
  masses: number[];
  ranks: MelaRank[];
  heard: number;
  mass: number;
  live: { semitone: number; dev: number; octave: number } | null;
  saHint: SaSetting | null;
};

const EMPTY_UI: Ui = {
  masses: Array(12).fill(0),
  ranks: [],
  heard: 0,
  mass: 0,
  live: null,
  saHint: null,
};

const fmtHz = (hz: number) => `${Math.round(hz)} Hz`;

export default function RagaRadar() {
  const [sa, setSa] = useState<SaSetting>(DEFAULT_SA);
  const [droneOn, setDroneOn] = useState(false);
  const [ui, setUi] = useState<Ui>(EMPTY_UI);

  const playerRef = useRef<RagaPlayer | null>(null);
  const histRef = useRef(makeHistogram());
  const trackerRef = useRef<NoteTracker | null>(null);
  const traceRef = useRef<TracePoint[]>([]);
  const f0sRef = useRef<number[]>([]);
  const saHzRef = useRef(saHzFor(DEFAULT_SA));
  const lastUiRef = useRef(0);
  const lastHintRef = useRef(0);
  const saHintRef = useRef<SaSetting | null>(null);

  function refreshUi(tMs: number, live: Ui["live"]) {
    const hist = histRef.current;
    const masses = svaraMasses(hist, foldCents(centsFromHz(saHzRef.current)));

    // sa hunting is the costliest bit, once a second is plenty
    if (tMs - lastHintRef.current > 1000) {
      lastHintRef.current = tMs;
      const suggestion = suggestSaOffset(hist);
      if (suggestion) {
        const hz = pickSaHz(suggestion.offsetCents, f0sRef.current);
        // exact, not snapped to a stop: 20+ cents of sa mismatch already
        // starts crediting the wrong svarasthana
        const setting = settingFromHz(hz);
        const dist = Math.abs(
          1200 * Math.log2(saHzFor(setting) / saHzRef.current),
        );
        saHintRef.current = dist > 20 ? setting : null;
      } else {
        saHintRef.current = null;
      }
    }

    setUi({
      masses,
      ranks: rankMelas(masses).slice(0, 5),
      heard: heardCount(masses),
      mass: totalMass(hist),
      live,
      saHint: saHintRef.current,
    });
  }

  function onFrame(frame: PitchFrame, tMs: number) {
    let live: Ui["live"] = null;
    const voiced =
      frame.f0 > 0 &&
      frame.clarity > GATES.minClarity &&
      frame.rms > GATES.minRms;
    const tracker = (trackerRef.current ??= new NoteTracker(histRef.current));
    if (voiced) {
      const saCents = centsFromHz(frame.f0, saHzRef.current);
      // notes vote, glides and blips between them do not
      tracker.voiced(frame.f0, frame.clarity, tMs / 1000);
      traceRef.current.push({ t: tMs, cents: saCents, clarity: frame.clarity });
      const f0s = f0sRef.current;
      f0s.push(frame.f0);
      if (f0s.length > 3000) f0s.splice(0, 1000);
      live = {
        ...nearestSvara(saCents),
        octave: Math.floor(saCents / 1200 + 0.5 / 12),
      };
    } else {
      tracker.unvoiced(tMs / 1000);
    }
    if (tMs - lastUiRef.current > 200) {
      lastUiRef.current = tMs;
      refreshUi(tMs, live);
    }
  }

  const mic = useMicPitch(onFrame);

  function reset() {
    histRef.current = makeHistogram();
    trackerRef.current = new NoteTracker(histRef.current);
    traceRef.current = [];
    f0sRef.current = [];
    saHintRef.current = null;
    setUi(EMPTY_UI);
  }

  function player(): RagaPlayer {
    if (!playerRef.current) playerRef.current = new RagaPlayer();
    return playerRef.current;
  }

  function toggleDrone() {
    if (droneOn) {
      player().stopDrone();
      setDroneOn(false);
    } else {
      player().startDrone(saHzFor(sa), 3 / 2);
      setDroneOn(true);
    }
  }

  function changeSa(next: SaSetting) {
    setSa(next);
    // the histogram is anchored to c4, not to sa, so it survives the change.
    // the trace is sa-relative and does not
    traceRef.current = [];
    if (droneOn) {
      player().stopDrone();
      player().startDrone(saHzFor(next), 3 / 2);
    }
  }

  useEffect(() => {
    saHzRef.current = saHzFor(sa);
  }, [sa]);

  useEffect(() => () => playerRef.current?.dispose(), []);

  const listening = mic.state === "listening";
  const top = ui.ranks[0];
  const maxMass = Math.max(...ui.masses, 1e-6);

  return (
    <Wrapper maxWidth="WIDE" className="mb-section-sm w-full md:mb-section-md">
      <h1 className="mb-3 text-heading-md font-medium md:text-heading-lg">
        Raga Radar
      </h1>
      <p className="mb-8 text-base text-secondary md:text-lg">
        [experimental] Sing into the mic for Svaras to draw themselves on the
        lattice, and the radar narrows down which Mēḷakartā you are in.
      </p>

      {/* controls */}
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <button
          onClick={() => (listening ? mic.stop() : void mic.start())}
          disabled={mic.state === "starting"}
          className={`min-w-44 rounded border border-accent px-4 py-2 font-sans text-sm font-medium transition-colors ${
            listening
              ? "hover:bg-accent/10 text-accent"
              : "hover:bg-accent/80 bg-accent text-black"
          }`}
        >
          {mic.state === "starting"
            ? "asking for the mic…"
            : listening
              ? "■ stop listening"
              : "● start listening"}
        </button>

        <label className="flex items-center gap-2 font-sans text-sm text-muted">
          shruti
          <select
            value={sa.stop}
            onChange={(e) => changeSa({ ...sa, stop: +e.target.value })}
            className="rounded border border-line bg-surface px-2 py-2 font-sans text-sm text-foreground"
          >
            {SA_STOPS.map((s) => (
              <option key={s.idx} value={s.idx}>
                {s.label} · {fmtHz(s.baseHz * 2 ** sa.octave)}
              </option>
            ))}
          </select>
          <select
            value={sa.octave}
            onChange={(e) =>
              changeSa({
                ...sa,
                octave: +e.target.value as SaSetting["octave"],
              })
            }
            className="rounded border border-line bg-surface px-2 py-2 font-sans text-sm text-foreground"
            aria-label="octave"
          >
            {OCTAVES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {/* the fine knob every pettige has */}
          <span className="flex items-center gap-1 rounded border border-line px-1.5 py-1.5">
            <button
              onClick={() =>
                changeSa({ ...sa, fine: Math.max(-50, sa.fine - 5) })
              }
              className="px-1 text-muted transition-colors hover:text-accent"
              aria-label="fine tune down"
            >
              −
            </button>
            <span className="min-w-10 text-center font-sans text-xs tabular-nums text-secondary">
              {sa.fine > 0 ? "+" : ""}
              {sa.fine}¢
            </span>
            <button
              onClick={() =>
                changeSa({ ...sa, fine: Math.min(50, sa.fine + 5) })
              }
              className="px-1 text-muted transition-colors hover:text-accent"
              aria-label="fine tune up"
            >
              +
            </button>
          </span>
        </label>

        <button
          onClick={toggleDrone}
          className={`min-w-28 rounded px-3 py-2 font-sans text-sm transition-colors ${
            droneOn
              ? "border border-accent text-accent"
              : "border border-line text-muted hover:text-accent"
          }`}
        >
          tamburi {droneOn ? "on" : "off"}
        </button>

        {ui.mass > 0 && (
          <button
            onClick={reset}
            className="font-sans text-sm text-muted transition-colors hover:text-accent"
          >
            reset
          </button>
        )}
      </div>

      <p className="mb-4 font-sans text-sm text-subtle">
        solo voice sung a lil slow and without too many gamakas works best.
      </p>

      {mic.state === "denied" && (
        <p className="mb-4 font-sans text-sm text-danger">
          mic permission was blocked. allow microphone access for this site and
          try again.
        </p>
      )}
      {mic.state === "error" && (
        <p className="mb-4 font-sans text-sm text-danger">
          could not open the microphone. is another app holding it?
        </p>
      )}

      {ui.saHint && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface-subtle px-4 py-3">
          <span className="font-sans text-sm text-secondary">
            you sound anchored near <b>{saName(ui.saHint)}</b>, not {saName(sa)}
          </span>
          <button
            onClick={() => changeSa(ui.saHint!)}
            className="rounded border border-accent px-3 py-1 font-sans text-sm text-accent transition-colors hover:bg-accent hover:text-black"
          >
            switch to {saName(ui.saHint)}
          </button>
        </div>
      )}

      {/* the lattice */}
      <div className="relative mb-6 h-72 w-full overflow-hidden rounded-lg border border-line md:h-96">
        <PitchLattice trace={traceRef} className="h-full w-full" />
        {listening && ui.live && (
          <div className="absolute right-3 top-2 rounded bg-surface px-2 py-1 text-right">
            <span className="font-display text-2xl leading-none text-foreground">
              {POS_LABELS[ui.live.semitone].kannada}
            </span>
            <span className="ml-2 font-sans text-sm tabular-nums text-muted">
              {ui.live.dev >= 0 ? "+" : ""}
              {Math.round(ui.live.dev)}¢
            </span>
          </div>
        )}
        {!listening && ui.mass === 0 && (
          <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-sans text-sm text-subtle">
            the lattice waits for your voice
          </p>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* svaras heard */}
        <div>
          <h2 className="mb-3 font-sans text-sm font-medium text-secondary">
            svaras heard
          </h2>
          <div className="grid grid-cols-6 gap-1.5 md:grid-cols-12">
            {POS_LABELS.map((label, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded border border-line px-0.5 py-1.5"
                style={{
                  backgroundColor: `rgba(240, 160, 68, ${
                    ui.masses[i] > 0
                      ? 0.12 + 0.88 * (ui.masses[i] / maxMass)
                      : 0
                  })`,
                }}
              >
                <span className="font-display text-sm leading-tight">
                  {label.kannada}
                </span>
                <span className="font-sans text-[9px] leading-tight text-muted">
                  {label.latin}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* the radar */}
        <div>
          <h2 className="mb-3 font-sans text-sm font-medium text-secondary">
            radar
          </h2>
          {ui.heard < 3 ? (
            <p className="font-sans text-sm text-subtle">
              {ui.mass === 0
                ? "sing a few phrases and the 72 melakartas start dropping off this list."
                : `${ui.heard} of the 5 telling svaras heard so far, keep going…`}
            </p>
          ) : (
            <ol className="flex flex-col gap-2">
              {ui.ranks.map(({ mela, score }, i) => (
                <li key={mela.n} className="flex items-center gap-3">
                  <span className="w-6 shrink-0 text-right font-sans text-xs tabular-nums text-subtle">
                    {mela.n}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`truncate font-sans text-sm ${
                          i === 0 && score > 0
                            ? "font-medium text-foreground"
                            : "text-secondary"
                        }`}
                      >
                        {mela.name}{" "}
                        <span className="font-display text-muted">
                          {mela.kannada}
                        </span>
                      </span>
                      <span className="font-sans text-xs tabular-nums text-subtle">
                        {Math.round(score * 100)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-surface-subtle">
                      <div
                        className="h-1.5 rounded-full bg-accent transition-all duration-200"
                        style={{ width: `${Math.max(2, score * 100)}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {top && top.score > 0.97 && ui.heard >= 4 && (
            <p className="mt-3 font-sans text-sm text-secondary">
              locked on: <b>{top.mela.name}</b>, mela {top.mela.n}
            </p>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
