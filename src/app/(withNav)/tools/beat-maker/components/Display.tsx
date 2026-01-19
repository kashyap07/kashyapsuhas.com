import cn from "@utils/cn";

import { Knob } from "./Knob";

interface DisplayProps {
  bpm: number;
  isRecording: boolean;
  isPlaying: boolean;
  currentBeat: number;
  // knob controls
  filter: number;
  reverb: number;
  pitch: number;
  drive: number;
  onFilterChange: (value: number) => void;
  onReverbChange: (value: number) => void;
  onPitchChange: (value: number) => void;
  onDriveChange: (value: number) => void;
}

export function Display({
  bpm,
  isRecording,
  isPlaying,
  currentBeat,
  filter,
  reverb,
  pitch,
  drive,
  onFilterChange,
  onReverbChange,
  onPitchChange,
  onDriveChange,
}: DisplayProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-gray-900 p-6 shadow-lg">
      {/* top row: bpm and status */}
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
          BPM
        </span>
        <span className="font-mono text-3xl font-bold text-columbiaYellow">
          {bpm}
        </span>
        <div className="flex items-center gap-4">
          {/* recording indicator */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                isRecording ? "animate-pulse bg-red-500" : "bg-gray-700",
              )}
            />
            <span className="text-xs uppercase text-gray-400">
              {isRecording ? "REC" : "---"}
            </span>
          </div>

          {/* playback indicator */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                isPlaying ? "bg-green-500" : "bg-gray-700",
              )}
            />
            <span className="text-xs uppercase text-gray-400">
              {isPlaying ? "PLAY" : "---"}
            </span>
          </div>
        </div>
      </div>

      {/* beat indicator (16 beats) - aligned with grid columns */}
      <div className="flex">
        {/* spacer to align with grid label column (w-24) */}
        <div className="w-24 flex-shrink-0" />
        {/* beat indicators matching grid column widths */}
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-12 min-w-[3rem] max-w-[3rem] flex-shrink-0 transition-all",
              i % 4 === 0
                ? "border-l-2 border-transparent"
                : "border-l border-transparent",
              i === currentBeat && isPlaying
                ? "bg-columbiaYellow"
                : i % 4 === 0
                  ? "bg-gray-600"
                  : "bg-gray-700",
            )}
          />
        ))}
      </div>

      {/* knobs section */}
      <div className="mt-2 flex items-center justify-around gap-4 border-t border-gray-700 pt-4">
        <Knob label="Filter" value={filter} onChange={onFilterChange} />
        <Knob label="Reverb" value={reverb} onChange={onReverbChange} />
        <Knob
          label="Pitch"
          value={pitch}
          min={-12}
          max={12}
          onChange={onPitchChange}
        />
        <Knob label="Drive" value={drive} onChange={onDriveChange} />
      </div>
    </div>
  );
}
