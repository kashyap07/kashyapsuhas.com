import cn from "@utils/cn";

interface GridProps {
  soundTypes: Array<{ id: string; label: string }>;
  numBeats: number;
  pattern: Record<string, Set<number>>;
  onToggleCell: (soundId: string, beat: number) => void;
  isPlaying: boolean;
  currentBeat: number;
}

export function Grid({
  soundTypes,
  numBeats,
  pattern,
  onToggleCell,
  isPlaying,
  currentBeat,
}: GridProps) {
  return (
    <div className="overflow-x-auto rounded-lg border-2 border-gray-200 bg-white">
      <div className="min-w-max">
        {/* header with beat numbers */}
        <div className="flex border-b-2 border-gray-200 bg-gray-50">
          <div className="w-24 flex-shrink-0 p-2 text-xs font-semibold text-gray-600">
            Sound
          </div>
          {Array.from({ length: numBeats }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex h-8 w-12 min-w-[3rem] max-w-[3rem] flex-shrink-0 items-center justify-center text-xs font-medium",
                i % 4 === 0 ? "border-l-2 border-gray-300" : "border-l border-gray-200",
                i === currentBeat && isPlaying
                  ? "bg-columbiaYellow text-gray-900"
                  : "text-gray-600"
              )}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* rows for each sound */}
        {soundTypes.map((sound) => (
          <div
            key={sound.id}
            className="flex border-b border-gray-200 hover:bg-gray-50"
          >
            {/* sound label */}
            <div className="flex w-24 flex-shrink-0 items-center p-2 text-xs font-medium text-gray-700">
              {sound.label}
            </div>

            {/* beat cells */}
            {Array.from({ length: numBeats }).map((_, i) => {
              const isActive = pattern[sound.id]?.has(i) || false;

              return (
                <button
                  key={i}
                  onClick={() => onToggleCell(sound.id, i)}
                  className={cn(
                    "flex h-10 w-12 min-w-[3rem] max-w-[3rem] flex-shrink-0 items-center justify-center transition-all",
                    i % 4 === 0 ? "border-l-2 border-gray-300" : "border-l border-gray-200",
                    i === currentBeat && isPlaying && "bg-columbiaYellow/20",
                    isActive
                      ? "bg-orange-400 hover:bg-orange-500"
                      : "hover:bg-gray-200"
                  )}
                >
                  {isActive && (
                    <div className="h-3 w-3 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
