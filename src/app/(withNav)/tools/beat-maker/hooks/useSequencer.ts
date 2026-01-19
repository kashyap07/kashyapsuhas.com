import { useCallback, useEffect, useRef, useState } from "react";

export interface SequencerControls {
  pattern: Record<string, Set<number>>;
  toggleCell: (soundId: string, beat: number) => void;
  clearPattern: () => void;
  isPlaying: boolean;
  togglePlayback: () => void;
  currentBeat: number;
  exportPattern: () => string;
  importPattern: (patternStr: string) => void;
}

export function useSequencer(
  numBeats: number,
  onPlaySound: (soundId: string) => void,
): SequencerControls {
  const [pattern, setPattern] = useState<Record<string, Set<number>>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);

  const BPM = 200; // fixed at 200 BPM
  const playbackIntervalRef = useRef<number | null>(null);
  const lastBeatRef = useRef(-1);

  const toggleCell = useCallback((soundId: string, beat: number) => {
    setPattern((prev) => {
      const newPattern = { ...prev };
      if (!newPattern[soundId]) {
        newPattern[soundId] = new Set();
      }

      const soundSet = new Set(newPattern[soundId]);
      if (soundSet.has(beat)) {
        soundSet.delete(beat);
      } else {
        soundSet.add(beat);
      }

      newPattern[soundId] = soundSet;
      return newPattern;
    });
  }, []);

  const clearPattern = useCallback(() => {
    setPattern({});
    setIsPlaying(false);
    setCurrentBeat(-1);
    lastBeatRef.current = -1;
  }, []);

  const togglePlayback = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const exportPattern = useCallback(() => {
    const lines: string[] = [];
    Object.entries(pattern).forEach(([soundId, beats]) => {
      if (beats.size > 0) {
        const beatNumbers = Array.from(beats).sort((a, b) => a - b);
        lines.push(`${soundId}:${beatNumbers.join(",")}`);
      }
    });
    return lines.join("\n");
  }, [pattern]);

  const importPattern = useCallback(
    (patternStr: string) => {
      const newPattern: Record<string, Set<number>> = {};
      const lines = patternStr.trim().split("\n");

      lines.forEach((line) => {
        const [soundId, beatsStr] = line.split(":");
        if (soundId && beatsStr) {
          const beats = beatsStr
            .split(",")
            .map(Number)
            .filter((n) => !isNaN(n) && n >= 0 && n < numBeats);
          if (beats.length > 0) {
            newPattern[soundId] = new Set(beats);
          }
        }
      });

      setPattern(newPattern);
    },
    [numBeats],
  );

  // playback loop
  useEffect(() => {
    if (!isPlaying) {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
      setCurrentBeat(-1);
      lastBeatRef.current = -1;
      return;
    }

    const beatDuration = (60 / BPM) * 1000; // ms per beat
    let startTime = Date.now();
    let beatIndex = 0;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const newBeat = Math.floor(elapsed / beatDuration) % numBeats;

      // only trigger sounds when beat changes
      if (newBeat !== lastBeatRef.current) {
        lastBeatRef.current = newBeat;
        setCurrentBeat(newBeat);

        // play all sounds scheduled for this beat
        Object.entries(pattern).forEach(([soundId, beats]) => {
          if (beats.has(newBeat)) {
            onPlaySound(soundId);
          }
        });

        // reset loop if we've completed all beats
        if (newBeat === 0 && beatIndex > 0) {
          startTime = Date.now();
        }
        beatIndex++;
      }
    };

    playbackIntervalRef.current = window.setInterval(tick, 10);

    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, [isPlaying, BPM, numBeats, pattern, onPlaySound]);

  return {
    pattern,
    toggleCell,
    clearPattern,
    isPlaying,
    togglePlayback,
    currentBeat,
    exportPattern,
    importPattern,
  };
}
