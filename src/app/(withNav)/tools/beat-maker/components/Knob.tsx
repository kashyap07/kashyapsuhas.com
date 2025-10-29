import { useRef } from "react";
import cn from "@utils/cn";

interface KnobProps {
  label: string;
  value: number; // 0-1
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function Knob({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
}: KnobProps) {
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  // convert value to rotation angle (-135 to 135 degrees)
  const rotation = -135 + (value - min) / (max - min) * 270;

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startValueRef.current = value;
    e.preventDefault();

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const deltaY = startYRef.current - e.clientY;
      const sensitivity = 0.005;
      const newValue = Math.max(
        min,
        Math.min(max, startValueRef.current + deltaY * sensitivity * (max - min))
      );

      onChange(newValue);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex h-16 w-16 cursor-ns-resize select-none items-center justify-center rounded-full bg-gray-800 shadow-lg"
        onMouseDown={handleMouseDown}
      >
        {/* knob body */}
        <div className="h-full w-full rounded-full border-4 border-gray-700 bg-gradient-to-b from-gray-600 to-gray-800">
          {/* indicator line */}
          <div
            className="absolute left-1/2 top-2 h-5 w-1 -translate-x-1/2 rounded-full bg-columbiaYellow shadow-sm"
            style={{
              transform: `translateX(-50%) rotate(${rotation}deg)`,
              transformOrigin: "center 1.75rem",
            }}
          />
        </div>
      </div>

      <span className="text-xs font-medium text-gray-600">{label}</span>
      <span className="text-xs text-gray-500">
        {((value - min) / (max - min) * 100).toFixed(0)}%
      </span>
    </div>
  );
}
