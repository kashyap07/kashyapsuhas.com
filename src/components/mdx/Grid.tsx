import type { ReactNode } from "react";

interface GridProps {
  cols?: 2 | 3 | 4;
  children: ReactNode;
}

const colsMap = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

export function Grid({ cols = 2, children }: GridProps) {
  return (
    <div className={`my-6 grid grid-cols-1 gap-4 ${colsMap[cols]}`}>
      {children}
    </div>
  );
}
