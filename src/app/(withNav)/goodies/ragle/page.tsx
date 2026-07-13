"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { RagaPlayer } from "@lib/carnatic/audio";
import {
  MELAKARTAS,
  Melakarta,
  arohaAvarohaPlayable,
} from "@lib/carnatic/melakarta";
import { SA_HZ, SVARAS } from "@lib/carnatic/pitches";

import { Wrapper } from "@components/ui";

import {
  MAX_GUESSES,
  dailyMela,
  puzzleNumber,
  randomMela,
  scoreGuess,
  shareText,
} from "./logic";

type Stats = {
  played: number;
  won: number;
  streak: number;
  maxStreak: number;
  lastPuzzle: number;
};

const STATE_KEY = "ragle:state";
const STATS_KEY = "ragle:stats";
const EMPTY_STATS: Stats = {
  played: 0,
  won: 0,
  streak: 0,
  maxStreak: 0,
  lastPuzzle: 0,
};

function loadJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function saveJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked, the game still works
  }
}

function GuessRow({ guess, answer }: { guess: Melakarta; answer: Melakarta }) {
  const score = scoreGuess(guess, answer);
  return (
    <div className="flex gap-1">
      {guess.scale.map((id, i) => (
        <div
          key={i}
          className={`flex w-9 flex-col items-center rounded py-1 md:w-10 ${
            score[i]
              ? "bg-green-600 text-white"
              : "bg-surface-subtle text-muted"
          }`}
        >
          <span className="font-display text-base leading-tight">
            {SVARAS[id].kannada}
          </span>
          <span className="font-sans text-[10px] leading-tight">
            {SVARAS[id].latin}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RaglePage() {
  const [puzzle, setPuzzle] = useState<number | null>(null);
  const [mode, setMode] = useState<"daily" | "practice">("daily");
  const [answer, setAnswer] = useState<Melakarta | null>(null);
  const [dailyAnswer, setDailyAnswer] = useState<Melakarta | null>(null);
  const [guesses, setGuesses] = useState<Melakarta[]>([]);
  const [input, setInput] = useState("");
  const [droneOn, setDroneOn] = useState(true);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);

  const playerRef = useRef<RagaPlayer | null>(null);

  // today's puzzle and any saved progress. date and storage are client-only,
  // and lazy initializers would mismatch the static prerender, so sync once
  // on mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const now = new Date();
    const p = puzzleNumber(now);
    const mela = dailyMela(now);
    setPuzzle(p);
    setAnswer(mela);
    setDailyAnswer(mela);
    const saved = loadJSON<{ puzzle: number; guesses: number[] }>(STATE_KEY);
    if (saved?.puzzle === p) {
      setGuesses(saved.guesses.map((n) => MELAKARTAS[n - 1]).filter(Boolean));
    }
    setStats(loadJSON<Stats>(STATS_KEY) ?? EMPTY_STATS);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => () => playerRef.current?.dispose(), []);

  const won = answer !== null && guesses.includes(answer);
  const done = won || guesses.length >= MAX_GUESSES;

  const suggestions =
    input.trim().length > 0 && !done
      ? MELAKARTAS.filter(
          (m) =>
            m.name.toLowerCase().includes(input.trim().toLowerCase()) &&
            !guesses.includes(m),
        ).slice(0, 8)
      : [];

  function ensurePlayer(): RagaPlayer {
    if (!playerRef.current) playerRef.current = new RagaPlayer();
    if (droneOn) playerRef.current.startDrone(SA_HZ, 3 / 2);
    return playerRef.current;
  }

  async function handlePlay(key: string, m: Melakarta) {
    const player = ensurePlayer();
    if (playingKey === key) {
      player.stopMelody();
      setPlayingKey(null);
      return;
    }
    setPlayingKey(key);
    await player.play(arohaAvarohaPlayable(m), () => setPlayingKey(null));
  }

  function handleDroneToggle() {
    const next = !droneOn;
    setDroneOn(next);
    const player = playerRef.current;
    if (!player) return;
    if (next) player.startDrone(SA_HZ, 3 / 2);
    else player.stopDrone();
  }

  function handleGuess(m: Melakarta) {
    if (!answer || done || guesses.includes(m)) return;
    const next = [...guesses, m];
    setGuesses(next);
    setInput("");

    const nowWon = m === answer;
    const nowDone = nowWon || next.length >= MAX_GUESSES;

    if (mode === "daily" && puzzle !== null) {
      saveJSON(STATE_KEY, { puzzle, guesses: next.map((g) => g.n) });
      if (nowDone && stats.lastPuzzle !== puzzle) {
        const streak = nowWon
          ? stats.lastPuzzle === puzzle - 1
            ? stats.streak + 1
            : 1
          : 0;
        const updated: Stats = {
          played: stats.played + 1,
          won: stats.won + (nowWon ? 1 : 0),
          streak,
          maxStreak: Math.max(stats.maxStreak, streak),
          lastPuzzle: puzzle,
        };
        setStats(updated);
        saveJSON(STATS_KEY, updated);
      }
    }
  }

  function startPractice() {
    playerRef.current?.stopMelody();
    setPlayingKey(null);
    setMode("practice");
    setAnswer(randomMela(dailyAnswer ?? undefined));
    setGuesses([]);
    setInput("");
  }

  function backToDaily() {
    playerRef.current?.stopMelody();
    setPlayingKey(null);
    setMode("daily");
    setAnswer(dailyAnswer);
    setInput("");
    const saved = loadJSON<{ puzzle: number; guesses: number[] }>(STATE_KEY);
    setGuesses(
      saved?.puzzle === puzzle
        ? saved.guesses.map((n) => MELAKARTAS[n - 1]).filter(Boolean)
        : [],
    );
  }

  async function handleShare() {
    if (!answer) return;
    const rows = guesses.map((g) => scoreGuess(g, answer));
    await navigator.clipboard.writeText(
      shareText(mode === "daily" ? puzzle : null, rows, won),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Wrapper className="mb-section-sm w-full md:mb-section-md">
      <h1 className="mb-3 text-heading-md font-medium md:text-heading-lg">
        Ragle{" "}
        {puzzle !== null && (
          <span className="text-secondary">
            {mode === "daily" ? `#${puzzle}` : "· practice"}
          </span>
        )}
      </h1>
      <p className="mb-8 text-base text-secondary md:text-lg">
        Guess the mystery raga in {MAX_GUESSES} guesses.
      </p>

      {answer && (
        <>
          {/* the mystery */}
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handlePlay("mystery", answer)}
              className={`rounded px-4 py-2 font-sans text-sm font-medium transition-colors ${
                playingKey === "mystery"
                  ? "bg-accent text-black"
                  : "border border-line text-muted hover:text-accent"
              }`}
            >
              {playingKey === "mystery" ? "■ stop" : "▶ hear the mystery raga"}
            </button>
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
          </div>

          {/* the board */}
          <div className="mb-8 flex flex-col gap-2">
            {guesses.map((g, i) => (
              <div key={i} className="flex flex-wrap items-center gap-3">
                <GuessRow guess={g} answer={answer} />
                <button
                  onClick={() => handlePlay(g.slug, g)}
                  className="font-sans text-sm text-muted transition-colors hover:text-accent"
                >
                  {playingKey === g.slug ? "■" : "▶"} {g.name}
                </button>
              </div>
            ))}
            {!done &&
              Array.from({ length: MAX_GUESSES - guesses.length }).map(
                (_, i) => (
                  <div key={i} className="flex gap-1">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <div
                        key={j}
                        className="h-10 w-9 rounded border border-dashed border-line md:w-10"
                      />
                    ))}
                  </div>
                ),
              )}
          </div>

          {/* guessing */}
          {!done && (
            <div className="mb-8">
              <input
                type="text"
                value={input}
                placeholder="type a melakarta name..."
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && suggestions.length > 0) {
                    handleGuess(suggestions[0]);
                  }
                }}
                className="mb-3 w-72 rounded border border-line px-3 py-2 font-sans text-base focus:outline-accent"
              />
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((m) => (
                    <button
                      key={m.slug}
                      onClick={() => handleGuess(m)}
                      className="rounded border border-line px-3 py-1.5 font-sans text-sm text-secondary transition-colors hover:border-accent hover:text-accent"
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* the reveal */}
          {done && (
            <div className="mb-8 rounded-lg bg-surface-subtle px-6 py-5 md:px-8 md:py-6">
              <p className="mb-1 font-sans text-xs uppercase tracking-wider text-muted">
                {won ? `got it in ${guesses.length}` : "it slipped away"}
              </p>
              <p className="font-display text-2xl text-accent md:text-3xl">
                {answer.kannada}
              </p>
              <p className="mb-3 text-lg">
                #{answer.n} {answer.name} ·{" "}
                <span className="font-sans text-sm text-subtle">
                  {answer.scale.map((id) => SVARAS[id].latin).join(" ")}
                </span>
              </p>
              <div className="mb-4 flex flex-wrap gap-3">
                <button
                  onClick={handleShare}
                  className="rounded border border-line px-3 py-1.5 font-sans text-sm text-muted transition-colors hover:text-accent"
                >
                  {copied ? "copied ✓" : "share result"}
                </button>
                <Link
                  href={`/goodies/melakarta-ragas?raga=${answer.slug}`}
                  className="rounded border border-line px-3 py-1.5 font-sans text-sm text-muted transition-colors hover:text-accent"
                >
                  open in explorer →
                </Link>
                <button
                  onClick={startPractice}
                  className="rounded border border-line px-3 py-1.5 font-sans text-sm text-muted transition-colors hover:text-accent"
                >
                  {mode === "daily" ? "practice round" : "another one"}
                </button>
                {mode === "practice" && (
                  <button
                    onClick={backToDaily}
                    className="rounded border border-line px-3 py-1.5 font-sans text-sm text-muted transition-colors hover:text-accent"
                  >
                    back to today
                  </button>
                )}
              </div>
              {mode === "daily" && stats.played > 0 && (
                <p className="font-sans text-sm text-subtle">
                  played {stats.played} · won {stats.won} · streak{" "}
                  {stats.streak} · best {stats.maxStreak}
                </p>
              )}
            </div>
          )}

          {mode === "practice" && !done && (
            <button
              onClick={backToDaily}
              className="font-sans text-sm text-muted transition-colors hover:text-accent"
            >
              ← back to today&apos;s puzzle
            </button>
          )}
        </>
      )}
    </Wrapper>
  );
}
