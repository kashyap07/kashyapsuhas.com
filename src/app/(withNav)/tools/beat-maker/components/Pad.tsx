import cn from "@utils/cn";

interface PadProps {
  label: string;
  keyLabel: string;
  isActive: boolean;
  onClick: () => void;
}

export function Pad({ label, keyLabel, isActive, onClick }: PadProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-lg",
        "h-20 w-full font-medium transition-all duration-75 ease-out",
        "border-2 shadow-md",
        "hover:scale-[1.02] active:scale-95",
        isActive
          ? "scale-95 border-orange-500 bg-columbiaYellow shadow-lg shadow-orange-300"
          : "border-gray-300 bg-gray-100 hover:border-gray-400 hover:bg-gray-200"
      )}
    >
      <span className="text-xs font-bold uppercase tracking-wide text-gray-600">
        {keyLabel}
      </span>
      <span
        className={cn(
          "text-sm font-semibold",
          isActive ? "text-gray-900" : "text-gray-700"
        )}
      >
        {label}
      </span>
    </button>
  );
}
