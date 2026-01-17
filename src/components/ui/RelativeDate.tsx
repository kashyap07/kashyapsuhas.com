"use client";

import { useEffect, useState } from "react";

// this exists so that the relative date can be calculated on the client side
// prev util required redeployment everytime
function getRelativeDate(date: string) {
  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }

  const currentDate = new Date();
  const targetDate = new Date(date);

  const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
  const monthsAgo = currentDate.getMonth() - targetDate.getMonth();
  const daysAgo = currentDate.getDate() - targetDate.getDate();
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

  // full date is stable - can render on server
  const fullDate = new Date(
    date.includes("T") ? date : `${date}T00:00:00`,
  ).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    setRelative(getRelativeDate(date));
  }, [date]);

  return (
    <p className={className}>
      {fullDate}
      {relative && ` (${relative})`}
    </p>
  );
}
