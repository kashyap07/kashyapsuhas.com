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
  const currentDate = new Date();
  const targetDate = toUtcDate(date);

  const yearsAgo = currentDate.getUTCFullYear() - targetDate.getUTCFullYear();
  const monthsAgo = currentDate.getUTCMonth() - targetDate.getUTCMonth();
  const daysAgo = currentDate.getUTCDate() - targetDate.getUTCDate();
  const isLessthanAYear = yearsAgo === 1 && monthsAgo < 0;
  const monthsAgoAbs = Math.abs(monthsAgo);

  let formattedDate = "";

  if (isLessthanAYear) {
    if (monthsAgoAbs > 0) {
      formattedDate = `${12 - monthsAgoAbs}mo ago`;
    } else if (daysAgo > 0) {
      formattedDate = `${daysAgo}d ago`;
    } else {
      formattedDate = "Today";
    }
  } else {
    if (yearsAgo > 0) {
      formattedDate = `${yearsAgo}y ago`;
    } else if (monthsAgoAbs > 0) {
      formattedDate = `${monthsAgoAbs}mo ago`;
    } else if (daysAgo > 0) {
      formattedDate = `${daysAgo}d ago`;
    } else {
      formattedDate = "Today";
    }
  }

  return formattedDate;
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
