"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { RagaPlayer } from "@lib/carnatic/audio";
import { MELAKARTAS, Melakarta, melaSemitones } from "@lib/carnatic/melakarta";
import { notationPlayable } from "@lib/carnatic/notation";
import { SA_HZ, SVARAS, svaraFreq } from "@lib/carnatic/pitches";
import { Song } from "@lib/carnatic/songs";

import SvaraKeyboard, { UPPER_SA } from "@components/carnatic/SvaraKeyboard";
import { Wrapper } from "@components/ui";

import {
  FIXED_SLOTS,
  MAX_GUESSES,
  dailyMela,
  dailySong,
  gridText,
  puzzleNumber,
  randomMela,
  randomSong,
  scoreGuess,
  shareText,
} from "./logic";

const SUB = ["", "₁", "₂", "₃"] as const;

// sa, pa and the high sa are in every melakarta, always on
const LOCKED = new Set([0, 7, UPPER_SA]);

type Stats = {
  played: number;
  won: number;
  streak: number;
  maxStreak: number;
  lastPuzzle: number;
};

const STATE_KEY = "raagle:state";
const STATS_KEY = "raagle:stats";
const TUTORIAL_KEY = "raagle:tutorial";
const EMPTY_STATS: Stats = {
  played: 0,
  won: 0,
  streak: 0,
  maxStreak: 0,
  lastPuzzle: 0,
};

// the game spent its first two days named "ragle"; carry saves across
function migrateOldKeys() {
  try {
    for (const k of ["state", "stats", "tutorial"]) {
      const old = localStorage.getItem(`ragle:${k}`);
      if (old !== null) {
        if (localStorage.getItem(`raagle:${k}`) === null) {
          localStorage.setItem(`raagle:${k}`, old);
        }
        localStorage.removeItem(`ragle:${k}`);
      }
    }
  } catch {
    // storage blocked, nothing to carry
  }
}

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
  // the upper sa rides along for display, fixed like sa and pa
  const cells = [...guess.scale, "S" as const];
  return (
    <div className="flex gap-1">
      {cells.map((id, i) => {
        const s = SVARAS[id];
        const upper = i === cells.length - 1;
        const fixed = upper || FIXED_SLOTS.has(i);
        return (
          <div
            key={i}
            className={`flex w-9 flex-col items-center rounded py-1 md:w-10 ${
              fixed
                ? "text-subtle"
                : score[i]
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
            }`}
          >
            <span className="h-2 font-sans text-[10px] leading-none">
              {upper ? "•" : " "}
            </span>
            <span className="font-display text-base leading-tight">
              {s.kannada + SUB[s.variant]}
            </span>
            <span className="font-sans text-[10px] leading-tight">
              {s.latin}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Tutorial({ replay, onDone }: { replay: boolean; onDone: () => void }) {
  return (
    <div className="max-w-prose">
      <h2 className="mb-4 font-sans text-xs uppercase tracking-wider text-muted">
        how to play
      </h2>
      <ul className="mb-6 flex flex-col gap-2 text-secondary">
        <li>
          A mystery Mēḷakartā raga hides here every day. Press play to hear a
          familiar varnam sung in it, its swaras bent to the mystery scale.
        </li>
        <li>
          Don&apos;t know the 72 names? Tap the swaras you hear on the keyboard
          and the list narrows to the ragas that hold them.
        </li>
        <li>
          Guess by name: swaras in the right spot turn green, wrong ones turn
          red. You get {MAX_GUESSES} guesses.
        </li>
      </ul>
      <div className="mb-2">
        <GuessRow guess={MELAKARTAS[28]} answer={MELAKARTAS[14]} />
      </div>
      <p className="mb-6 font-sans text-sm text-subtle">
        Here Dheerashankarabharana was guessed while Mayamalavagowla hid: ri and
        da missed, the rest landed.
      </p>
      <button
        onClick={onDone}
        className="rounded border border-accent px-4 py-2 font-sans text-sm text-accent transition-colors hover:bg-accent hover:text-black"
      >
        {replay ? "back to the game" : "let's play"}
      </button>
    </div>
  );
}

export default function RaaglePage() {
  const [puzzle, setPuzzle] = useState<number | null>(null);
  const [dateLabel, setDateLabel] = useState<string | null>(null);
  const [mode, setMode] = useState<"daily" | "practice">("daily");
  const [answer, setAnswer] = useState<Melakarta | null>(null);
  const [dailyAnswer, setDailyAnswer] = useState<Melakarta | null>(null);
  const [song, setSong] = useState<Song | null>(null);
  const [dailyTune, setDailyTune] = useState<Song | null>(null);
  const [guesses, setGuesses] = useState<Melakarta[]>([]);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [droneOn, setDroneOn] = useState(true);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [showTutorial, setShowTutorial] = useState(false);

  const playerRef = useRef<RagaPlayer | null>(null);

  // today's puzzle and any saved progress. date and storage are client-only,
  // and lazy initializers would mismatch the static prerender, so sync once
  // on mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    migrateOldKeys();
    const now = new Date();
    const p = puzzleNumber(now);
    const mela = dailyMela(now);
    const tune = dailySong(now);
    setPuzzle(p);
    setDateLabel(
      now.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    );
    setAnswer(mela);
    setDailyAnswer(mela);
    setSong(tune);
    setDailyTune(tune);
    const saved = loadJSON<{ puzzle: number; guesses: number[] }>(STATE_KEY);
    if (saved?.puzzle === p) {
      setGuesses(saved.guesses.map((n) => MELAKARTAS[n - 1]).filter(Boolean));
    }
    setStats(loadJSON<Stats>(STATS_KEY) ?? EMPTY_STATS);
    // first-timers get the tutorial
    if (!saved && !loadJSON<boolean>(TUTORIAL_KEY)) setShowTutorial(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => () => playerRef.current?.dispose(), []);

  const won = answer !== null && guesses.includes(answer);
  const done = won || guesses.length >= MAX_GUESSES;

  // the keyboard narrows the field, the text box narrows it further
  const kbMatches = MELAKARTAS.filter((m) => {
    const have = new Set(melaSemitones(m));
    return [...selected].every((s) => have.has(s));
  });
  const query = input.trim().toLowerCase();
  const suggestions =
    !done && (query.length > 0 || selected.size > 0)
      ? kbMatches
          .filter(
            (m) => m.name.toLowerCase().includes(query) && !guesses.includes(m),
          )
          .slice(0, 8)
      : [];

  function ensurePlayer(): RagaPlayer {
    if (!playerRef.current) playerRef.current = new RagaPlayer();
    if (droneOn) playerRef.current.startDrone(SA_HZ, 3 / 2);
    return playerRef.current;
  }

  async function handlePlay(key: string, m: Melakarta) {
    if (!song) return;
    const player = ensurePlayer();
    if (playingKey === key) {
      player.stopMelody();
      setPlayingKey(null);
      return;
    }
    setPlayingKey(key);
    await player.play(notationPlayable(song.notation, m), () =>
      setPlayingKey(null),
    );
  }

  function handleDroneToggle() {
    const next = !droneOn;
    setDroneOn(next);
    const player = playerRef.current;
    if (!player) return;
    if (next) player.startDrone(SA_HZ, 3 / 2);
    else player.stopDrone();
  }

  // a lone reference tone, so the ear can check itself against the tune
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
    setPlayingKey(null);
  }

  function handleTap(id: number) {
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
    setSong(randomSong());
    setGuesses([]);
    setInput("");
    setSelected(new Set());
  }

  function backToDaily() {
    playerRef.current?.stopMelody();
    setPlayingKey(null);
    setMode("daily");
    setAnswer(dailyAnswer);
    setSong(dailyTune);
    setInput("");
    setSelected(new Set());
    const saved = loadJSON<{ puzzle: number; guesses: number[] }>(STATE_KEY);
    setGuesses(
      saved?.puzzle === puzzle
        ? saved.guesses.map((n) => MELAKARTAS[n - 1]).filter(Boolean)
        : [],
    );
  }

  function dismissTutorial() {
    saveJSON(TUTORIAL_KEY, true);
    setShowTutorial(false);
  }

  async function handleShare() {
    if (!answer) return;
    const rows = guesses.map((g) => scoreGuess(g, answer));
    await navigator.clipboard.writeText(
      shareText(mode === "daily" ? dateLabel : null, rows, won),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Wrapper className="mb-section-sm w-full md:mb-section-md">
      <h1 className="mb-3 text-heading-md font-medium md:text-heading-lg">
        Raagle{" "}
        {puzzle !== null && (
          <span className="text-lg text-secondary md:text-xl">
            {mode === "daily" ? dateLabel : "· practice"}
          </span>
        )}
      </h1>
      <p className="mb-8 text-base text-secondary md:text-lg">
        A familiar tune, a mystery Mēḷakartā raga. Guess it in {MAX_GUESSES}.
      </p>

      {showTutorial && (
        <Tutorial replay={guesses.length > 0} onDone={dismissTutorial} />
      )}

      {!showTutorial && answer && song && (
        <>
          {/* the mystery */}
          <div className="mb-2 flex flex-wrap items-center gap-3">
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
            <button
              onClick={() => setShowTutorial(true)}
              className="font-sans text-sm text-muted transition-colors hover:text-accent"
            >
              how to play
            </button>
          </div>
          <p className="mb-8 font-sans text-sm text-subtle">
            today&apos;s tune: {song.title} {song.kannada} · sung in the mystery
            raga
          </p>

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
                    {Array.from({ length: 8 }).map((_, j) => (
                      <div
                        key={j}
                        className="h-12 w-9 rounded border border-dashed border-line md:w-10"
                      />
                    ))}
                  </div>
                ),
              )}
          </div>

          {/* guessing: the keyboard finds, the box confirms */}
          {!done && (
            <div className="mb-8">
              <div className="mb-3">
                <SvaraKeyboard
                  selected={selected}
                  locked={LOCKED}
                  active={null}
                  onTap={handleTap}
                />
              </div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="font-sans text-sm text-subtle">
                  {selected.size > 0
                    ? `${kbMatches.length} of 72 hold those swaras`
                    : "tap the swaras you hear to narrow the names"}
                </span>
                {selected.size > 0 && (
                  <button
                    onClick={() => setSelected(new Set())}
                    className="font-sans text-sm text-muted transition-colors hover:text-accent"
                  >
                    reset
                  </button>
                )}
              </div>
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

          {/* the end screen */}
          {done && (
            <div className="mb-8 rounded-lg bg-surface-subtle px-6 py-5 md:px-8 md:py-6">
              <p className="mb-1 font-sans text-xs uppercase tracking-wider text-muted">
                {won
                  ? `got it in ${guesses.length} of ${MAX_GUESSES}`
                  : "it slipped away"}
              </p>
              <p className="font-display text-2xl text-accent md:text-3xl">
                {answer.kannada}
              </p>
              <p className="mb-1 text-lg">
                #{answer.n} {answer.name} ·{" "}
                <span className="font-sans text-sm text-subtle">
                  {answer.scale.map((id) => SVARAS[id].latin).join(" ")}
                </span>
              </p>
              <p className="mb-3 font-sans text-sm text-subtle">
                you heard {song.title}, {song.detail} · its true home is{" "}
                {song.homeRaga} (#{song.homeMela})
              </p>
              <pre className="mb-4 font-sans text-sm leading-snug">
                {gridText(guesses.map((g) => scoreGuess(g, answer)))}
              </pre>
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
              {mode === "daily" && (
                <p className="mt-1 font-sans text-sm text-subtle">
                  a new raga arrives at midnight
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
