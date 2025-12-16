import type { ReactNode } from "react";

interface CodeBlockProps {
  title?: string;
  children: ReactNode;
}

export function CodeBlock({ title, children }: CodeBlockProps) {
  return (
    <div className="my-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      {title && (
        <div className="border-b border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium dark:border-gray-800 dark:bg-gray-900">
          {title}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
