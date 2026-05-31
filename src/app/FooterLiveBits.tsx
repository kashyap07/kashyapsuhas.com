"use client";

import { useEffect, useState } from "react";

interface Props {
  buildTime: string;
}

const relativeFromNow = (iso: string) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
};

export default function FooterLiveBits({ buildTime }: Props) {
  // null on server + initial client render so hydration matches.
  // populated on mount, refreshed every minute.
  const [updated, setUpdated] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setUpdated(relativeFromNow(buildTime));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [buildTime]);

  if (!updated) return null;

  return (
    <span suppressHydrationWarning>
      {" · "}updated {updated}
    </span>
  );
}
