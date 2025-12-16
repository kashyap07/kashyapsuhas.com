import type { ReactNode } from "react";

type CalloutType = "info" | "warning" | "success" | "danger";

interface CalloutProps {
  type?: CalloutType;
  children: ReactNode;
  title?: string;
}

const typeStyles: Record<CalloutType, string> = {
  info: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
  warning: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30",
  success: "border-green-500 bg-green-50 dark:bg-green-950/30",
  danger: "border-red-500 bg-red-50 dark:bg-red-950/30",
};

const typeIcons: Record<CalloutType, string> = {
  info: "ℹ️",
  warning: "⚠️",
  success: "✅",
  danger: "🚨",
};

export function Callout({ type = "info", children, title }: CalloutProps) {
  return (
    <div
      className={`my-6 rounded-lg border-l-4 p-4 ${typeStyles[type]}`}
      role="alert"
    >
      {title && (
        <div className="mb-2 flex items-center gap-2 font-semibold">
          <span>{typeIcons[type]}</span>
          <span>{title}</span>
        </div>
      )}
      <div className="prose-p:my-2">{children}</div>
    </div>
  );
}
