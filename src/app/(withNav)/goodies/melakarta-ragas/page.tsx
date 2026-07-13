"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import { RagaPlayer, Scheduled } from "@lib/carnatic/audio";
import {
  CHAKRAS,
  MELAKARTAS,
  Melakarta,
  arohaAvaroha,
  arohaAvarohaPlayable,
  melaSemitones,
} from "@lib/carnatic/melakarta";
import { SA_HZ, SVARAS, svaraFreq } from "@lib/carnatic/pitches";

import SvaraKeyboard, { UPPER_SA } from "@components/carnatic/SvaraKeyboard";
import { Wrapper } from "@components/ui";

// sa, pa and the high sa are in every melakarta, always on
const LOCKED = new Set([0, 7, UPPER_SA]);

function parseSelected(param: string | null): Set<number> {
  const sel = new Set(LOCKED);
  for (const part of (param ?? "").split(",")) {
    const s = parseInt(part, 10);
    if (s >= 1 && s <= 11 && !LOCKED.has(s)) sel.add(s);
  }
  return sel;
}

function findMela(param: string | null): Melakarta | null {
  if (!param) return null;
  return (
    MELAKARTAS.find((m) => m.slug === param || String(m.n) === param) ?? null
  );
}

function MelakartaRagas() {
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Set<number>>(() =>
    parseSelected(searchParams.get("s")),
  );
  const [lastPlayed, setLastPlayed] = useState<string | null>(
    () => findMela(searchParams.get("raga"))?.slug ?? null,
  );
  const [droneOn, setDroneOn] = useState(true);
  const [playingSlug, setPlayingSlug] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<number | null>(null);

  const playerRef = useRef<RagaPlayer | null>(null);
  const schedRef = useRef<Scheduled | null>(null);
  const seqKeysRef = useRef<number[]>([]);

  const candidates = useMemo(() => {
    return MELAKARTAS.filter((m) => {
      const have = new Set(melaSemitones(m));
      return [...selected].every((s) => s === UPPER_SA || have.has(s));
    });
  }, [selected]);
  const candidateSlugs = useMemo(
    () => new Set(candidates.map((m) => m.slug)),
    [candidates],
  );

  // a shared link lands on its raga
  useEffect(() => {
    if (lastPlayed) {
      document
        .getElementById(lastPlayed)
        ?.scrollIntoView({ block: "center", behavior: "instant" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep the url shareable: pressed swaras and the last raga heard
  useEffect(() => {
    const params = new URLSearchParams();
    const extra = [...selected]
      .filter((s) => !LOCKED.has(s))
      .sort((a, b) => a - b)
      .join(",");
    if (extra) params.set("s", extra);
    if (lastPlayed) params.set("raga", lastPlayed);
    const q = params.toString();
    window.history.replaceState(
      null,
      "",
      q ? `?${q}` : window.location.pathname,
    );
  }, [selected, lastPlayed]);

  // make the sounding key jump
  useEffect(() => {
    if (!playingSlug) return;
    let raf: number;
    const tick = () => {
      const s = schedRef.current;
      if (s) {
        const now = s.now();
        const cur = s.sched.find((n) => now >= n.start && now < n.end);
        setActiveKey(cur ? (seqKeysRef.current[cur.idx] ?? null) : null);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playingSlug]);

  useEffect(() => () => playerRef.current?.dispose(), []);

  function ensurePlayer(): RagaPlayer {
    if (!playerRef.current) playerRef.current = new RagaPlayer();
    if (droneOn) playerRef.current.startDrone(SA_HZ, 3 / 2);
    return playerRef.current;
  }

  function soundKey(id: number) {
    const freq =
      id === UPPER_SA
        ? svaraFreq("S", 1)
        : svaraFreq(
            Object.values(SVARAS).find((v) => v.semitone === id)!.id,
            0,
          );
    ensurePlayer().play(
      [{ freq, beats: 1.5, restBefore: 0, idx: -1 }],
      () => {},
    );
  }

  function handleTap(id: number) {
    // a tap interrupts whatever raga is playing
    setPlayingSlug(null);
    setActiveKey(null);
    if (LOCKED.has(id)) {
      soundKey(id);
      return;
    }
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
      soundKey(id);
    }
    setSelected(next);
  }

  async function playMela(m: Melakarta) {
    const player = ensurePlayer();
    if (playingSlug === m.slug) {
      player.stopMelody();
      setPlayingSlug(null);
      setActiveKey(null);
      return;
    }
    seqKeysRef.current = arohaAvaroha(m).map((s) =>
      s.octave >= 1 ? UPPER_SA : SVARAS[s.id].semitone,
    );
    setPlayingSlug(m.slug);
    setLastPlayed(m.slug);
    schedRef.current = await player.play(arohaAvarohaPlayable(m), () => {
      setPlayingSlug(null);
      setActiveKey(null);
    });
  }

  function handleDroneToggle() {
    const next = !droneOn;
    setDroneOn(next);
    const player = playerRef.current;
    if (!player) return;
    if (next) player.startDrone(SA_HZ, 3 / 2);
    else player.stopDrone();
  }

  const extraCount = [...selected].filter((s) => !LOCKED.has(s)).length;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={handleDroneToggle}
          className={`min-w-28 rounded px-3 py-2 font-sans text-sm transition-colors ${
            droneOn
              ? "border border-accent text-accent"
              : "border border-line text-muted hover:text-accent"
          }`}
        >
          tamburi {droneOn ? "on" : "off"}
        </button>
        {extraCount > 0 && (
          <button
            onClick={() => setSelected(new Set(LOCKED))}
            className="rounded border border-line px-3 py-2 font-sans text-sm text-muted transition-colors hover:text-accent"
          >
            reset
          </button>
        )}
        <span className="font-sans text-sm text-subtle">
          {extraCount > 0
            ? `${candidates.length} of 72 match`
            : "tap swaras to filter, click a raga to hear it"}
        </span>
      </div>

      <div className="mb-10">
        <SvaraKeyboard
          selected={selected}
          locked={LOCKED}
          active={activeKey}
          onTap={handleTap}
        />
      </div>

      {candidates.length === 0 && (
        <p className="text-secondary">
          No melakarta holds all of those at once. Drop one and try again.
        </p>
      )}

      <div className="flex flex-col gap-10">
        {CHAKRAS.map((chakra, ci) => {
          const melas = MELAKARTAS.slice(ci * 6, ci * 6 + 6).filter((m) =>
            candidateSlugs.has(m.slug),
          );
          if (melas.length === 0) return null;
          return (
            <section key={chakra.name}>
              <h2 className="mb-3 flex items-baseline gap-2 border-b border-line pb-2 font-sans text-sm uppercase tracking-wider text-muted">
                <span>
                  {ci + 1} · {chakra.name}
                </span>
                <span className="normal-case">{chakra.kannada}</span>
              </h2>
              <ul className="flex flex-col">
                {melas.map((m) => {
                  const isPlaying = playingSlug === m.slug;
                  return (
                    <li key={m.slug} id={m.slug} className="scroll-mt-24">
                      <button
                        onClick={() => playMela(m)}
                        className="group flex w-full items-baseline gap-3 rounded px-2 py-1.5 text-left transition-colors hover:bg-surface-subtle"
                      >
                        <span className="w-6 shrink-0 text-right font-sans text-sm text-subtle">
                          {m.n}
                        </span>
                        <span
                          className={`shrink-0 font-sans text-sm ${
                            isPlaying ? "text-accent" : "text-muted"
                          }`}
                        >
                          {isPlaying ? "■" : "▶"}
                        </span>
                        <span
                          className={`font-medium group-hover:text-accent ${
                            isPlaying ? "text-accent" : ""
                          }`}
                        >
                          {m.name}
                        </span>
                        <span className="hidden text-secondary md:inline">
                          {m.kannada}
                        </span>
                        <span className="ml-auto hidden shrink-0 font-sans text-sm text-subtle sm:block">
                          {m.scale.map((id) => SVARAS[id].latin).join(" ")}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}

export default function MelakartaRagasPage() {
  return (
    <Wrapper className="mb-section-sm w-full md:mb-section-md">
      <h1 className="mb-3 text-heading-md font-medium md:text-heading-lg">
        Melakarta Ragas
      </h1>
      {/* useSearchParams needs a suspense boundary on a static route */}
      <Suspense fallback={null}>
        <MelakartaRagas />
      </Suspense>
    </Wrapper>
  );
}
