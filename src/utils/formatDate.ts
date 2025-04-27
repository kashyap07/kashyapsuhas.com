import { unstable_noStore as noStore } from "next/cache";

// TODO: add some UTs
export default function formatDate(date: string) {
  noStore();
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
      formattedDate = `${monthsAgoAbs - 1}mo ago`;
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

  const fullDate = targetDate.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `${fullDate} (${formattedDate})`;
}
