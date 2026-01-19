import cn from "@utils/cn";

interface SequencerProps {
  isRecording: boolean;
  isPlaying: boolean;
  hasRecording: boolean;
  bpm: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTogglePlayback: () => void;
  onClear: () => void;
  onBpmChange: (bpm: number) => void;
}

export function Sequencer({
  isRecording,
  isPlaying,
  hasRecording,
  bpm,
  onStartRecording,
  onStopRecording,
  onTogglePlayback,
  onClear,
  onBpmChange,
}: SequencerProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* bpm control */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-600">Tempo (BPM)</label>
        <input
          type="range"
          min="60"
          max="200"
          step="1"
          value={bpm}
          onChange={(e) => onBpmChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200"
        />
      </div>

      {/* control buttons */}
      <div className="grid grid-cols-2 gap-2">
        {/* record button */}
        {!isRecording ? (
          <button
            onClick={onStartRecording}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-all",
              "border-2 border-red-500 bg-red-50 text-red-600",
              "hover:bg-red-500 hover:text-white",
            )}
          >
            <div className="h-3 w-3 rounded-full bg-current" />
            Record
          </button>
        ) : (
          <button
            onClick={onStopRecording}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-all",
              "animate-pulse border-2 border-red-600 bg-red-500 text-white",
              "hover:bg-red-600",
            )}
          >
            <div className="h-3 w-3 bg-current" />
            Stop
          </button>
        )}

        {/* play/pause button */}
        <button
          onClick={onTogglePlayback}
          disabled={!hasRecording}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-all",
            "border-2",
            hasRecording
              ? "border-green-500 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white"
              : "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400",
          )}
        >
          {isPlaying ? (
            <>
              <div className="flex gap-1">
                <div className="h-3 w-1 bg-current" />
                <div className="h-3 w-1 bg-current" />
              </div>
              Pause
            </>
          ) : (
            <>
              <div className="h-0 w-0 border-y-[6px] border-l-[10px] border-r-0 border-solid border-y-transparent border-l-current" />
              Play
            </>
          )}
        </button>

        {/* clear button */}
        <button
          onClick={onClear}
          disabled={!hasRecording && !isRecording}
          className={cn(
            "col-span-2 rounded-lg px-4 py-3 font-medium transition-all",
            "border-2",
            hasRecording || isRecording
              ? "border-orange-500 bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white"
              : "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400",
          )}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
