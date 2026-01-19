import cn from "@utils/cn";

interface SoundListProps {
  soundTypes: Array<{ id: string; label: string }>;
  isRecording: (soundId: string) => boolean;
  customRecordings: Record<string, boolean>;
  onRecord: (soundId: string) => void;
  onClear: (soundId: string) => void;
}

export function SoundList({
  soundTypes,
  isRecording,
  customRecordings,
  onRecord,
  onClear,
}: SoundListProps) {
  return (
    <div className="mb-6 rounded-lg border-2 border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Sounds
        <span className="ml-2 text-xs font-normal text-gray-500">
          (Record your voice to replace any sound)
        </span>
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {soundTypes.map((sound) => {
          const recording = isRecording(sound.id);
          const hasCustom = customRecordings[sound.id] || false;

          return (
            <div
              key={sound.id}
              className="flex items-center justify-between rounded-md border border-gray-200 p-2"
            >
              <span
                className={cn(
                  "text-xs font-medium",
                  hasCustom ? "text-columbiaYellow" : "text-gray-700",
                )}
              >
                {sound.label}
                {hasCustom && " 🎤"}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => onRecord(sound.id)}
                  className={cn(
                    "rounded px-2 py-1 text-xs font-medium transition-colors",
                    recording
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  )}
                  title={
                    recording
                      ? "Click to stop recording"
                      : "Record voice (1 bar at 200 BPM, auto-trims silence)"
                  }
                >
                  {recording ? "⏹ Stop" : "⏺"}
                </button>
                {hasCustom && (
                  <button
                    onClick={() => onClear(sound.id)}
                    className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    title="Clear recording"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
