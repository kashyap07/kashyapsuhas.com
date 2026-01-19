import { useCallback, useEffect, useState } from "react";

export interface KeyMapping {
  key: string;
  soundId: string;
  label: string;
}

// keyboard layout matching the 3x3 grid
export const KEY_MAPPINGS: KeyMapping[] = [
  { key: "q", soundId: "kick", label: "Kick" },
  { key: "w", soundId: "snare", label: "Snare" },
  { key: "e", soundId: "clap", label: "Clap" },
  { key: "a", soundId: "hihat", label: "Hi-Hat" },
  { key: "s", soundId: "tom1", label: "Tom 1" },
  { key: "d", soundId: "ride", label: "Ride" },
  { key: "z", soundId: "crash", label: "Crash" },
  { key: "x", soundId: "cowbell", label: "Cowbell" },
  { key: "c", soundId: "tom2", label: "Tom 2" },
];

export interface KeyboardControls {
  activeKeys: Set<string>;
  keyMappings: KeyMapping[];
  triggerSound: (soundId: string) => void;
}

export function useKeyboard(
  onSoundTrigger: (soundId: string) => void,
): KeyboardControls {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  const triggerSound = useCallback(
    (soundId: string) => {
      onSoundTrigger(soundId);
    },
    [onSoundTrigger],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // prevent repeat when key is held
      if (e.repeat) return;

      const key = e.key.toLowerCase();
      const mapping = KEY_MAPPINGS.find((m) => m.key === key);

      if (mapping) {
        e.preventDefault();
        setActiveKeys((prev) => new Set(prev).add(key));
        onSoundTrigger(mapping.soundId);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onSoundTrigger]);

  return {
    activeKeys,
    keyMappings: KEY_MAPPINGS,
    triggerSound,
  };
}
