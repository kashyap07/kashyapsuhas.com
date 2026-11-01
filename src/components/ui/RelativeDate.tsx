"use client";

import { useEffect, useState } from "react";

// every date on the site renders in utc. an offset-less string would parse as
// whatever tz the runtime happens to be in (ist locally, utc on vercel), so
// pin those to utc too and the output stops depending on where it ran.
function toUtcDate(date: string): Date {
  const withTime = date.includes("T") ? date : `${date}T00:00:00`;
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(withTime);
  return new Date(hasZone ? withTime : `${withTime}Z`);
}

// this exists so that the relative date can be calculated on the client side
// prev util required redeployment everytime
function getRelativeDate(date: string) {
  const now = new Date();
  const target = toUtcDate(date);

  // whole calendar months elapsed, minus one if the day-of-month hasn't come round yet
  const months =
    (now.getUTCFullYear() - target.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - target.getUTCMonth()) -
    (now.getUTCDate() < target.getUTCDate() ? 1 : 0);

  if (months >= 12) return `${Math.floor(months / 12)}y ago`;
  if (months >= 1) return `${months}mo ago`;

  // whole utc days between the two calendar dates
  const dayMs = 86400000;
  const days = Math.round(
    (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) -
      Date.UTC(
        target.getUTCFullYear(),
        target.getUTCMonth(),
        target.getUTCDate(),
      )) /
      dayMs,
  );

  return days > 0 ? `${days}d ago` : "Today";
}

interface Props {
  date: string;
  className?: string;
}

export default function RelativeDate({ date, className }: Props) {
  const [relative, setRelative] = useState<string | null>(null);

  // utc-pinned, so this is byte-identical on the server and the client
  const fullDate = toUtcDate(date).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  useEffect(() => {
    setRelative(getRelativeDate(date));
  }, [date]);

  // span (phrasing content) so it can be wrapped in <time>
  return (
    <span className={className}>
      {fullDate}
      {relative && ` (${relative})`}
    </span>
  );
}
