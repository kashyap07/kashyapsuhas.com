// turning a remembered birth time into an absolute instant.
//
// this module exists because it is the single largest source of wrong charts. someone
// says "born 4:30 in the morning, Bombay, 1948" and every piece of software silently
// assumes IST. bombay city was still keeping its own local time, 39 minutes behind
// IST, and 39 minutes moves the lagna by nearly ten degrees: a different rashi, a
// different first bhava, a different chart.
//
// we do not guess. we resolve what we can from the IANA database and flag what we
// cannot, so the caller can ask.

export type LocalDateTime = {
  year: number;
  /** 1-12 */
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
};

export type TimeZoneSpec =
  | { kind: "iana"; zone: string }
  | { kind: "fixed"; offsetSeconds: number; label: string };

const HOUR = 3600;

/**
 * local mean times that tzdata does not model, but that people's birth certificates
 * were actually written in.
 *
 * tzdata's Asia/Kolkata jumps the whole country to IST on 1906-01-01. in practice
 * bombay and calcutta kept their own local time for decades after that, by municipal
 * decision and by habit. tzdata models the 1941-1945 wartime +6:30 correctly.
 */
export const HISTORICAL_ZONES = {
  bombay: {
    kind: "fixed" as const,
    offsetSeconds: 4 * HOUR + 51 * 60,
    label: "Bombay Time (UTC+4:51)",
  },
  calcutta: {
    kind: "fixed" as const,
    offsetSeconds: 5 * HOUR + 53 * 60 + 20,
    label: "Calcutta Time (UTC+5:53:20)",
  },
  madras: {
    kind: "fixed" as const,
    offsetSeconds: 5 * HOUR + 21 * 60 + 10,
    label: "Madras Time (UTC+5:21:10)",
  },
  ist: {
    kind: "fixed" as const,
    offsetSeconds: 5 * HOUR + 30 * 60,
    label: "IST (UTC+5:30)",
  },
} satisfies Record<string, Extract<TimeZoneSpec, { kind: "fixed" }>>;

/**
 * offset of an IANA zone at a specific instant, in seconds east of UTC.
 *
 * formats the instant into the zone and reads the wall-clock fields back, rather than
 * parsing a "GMT+05:30" string, because the string form rounds away the seconds that
 * pre-1906 indian local mean times actually carry.
 */
export function ianaOffsetSeconds(instant: Date, zone: string): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(instant).map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  // resolution of formatToParts is whole seconds, so round to kill float dust
  return Math.round((asUtc - instant.getTime()) / 1000);
}

/**
 * resolve a wall-clock local time to an absolute instant.
 *
 * for IANA zones the offset depends on the instant we are trying to find, so this
 * iterates: guess, look up the offset at the guess, correct. two passes settle it
 * except exactly on a transition, where a third changes nothing.
 */
export function resolveInstant(local: LocalDateTime, tz: TimeZoneSpec): Date {
  const naiveUtc = Date.UTC(
    local.year,
    local.month - 1,
    local.day,
    local.hour,
    local.minute,
    local.second ?? 0,
  );

  if (tz.kind === "fixed") {
    return new Date(naiveUtc - tz.offsetSeconds * 1000);
  }

  let instant = new Date(naiveUtc);
  for (let i = 0; i < 3; i++) {
    const offset = ianaOffsetSeconds(instant, tz.zone);
    instant = new Date(naiveUtc - offset * 1000);
  }
  return instant;
}

export type TimeAmbiguity = {
  code:
    | "bombay-local-time"
    | "calcutta-local-time"
    | "wartime-dst"
    | "pre-1906-lmt";
  message: string;
  /** the alternative worth offering the user */
  alternative?: TimeZoneSpec;
};

const inRange = (d: LocalDateTime, fromYear: number, toYear: number) =>
  d.year >= fromYear && d.year <= toYear;

/**
 * flags birth data where the recorded clock time is genuinely ambiguous, so the UI can
 * ask instead of assuming. returns an empty array when there is nothing to worry about.
 *
 * `place` is matched loosely on purpose: this is a prompt to the user, not a lookup.
 */
export function timeAmbiguities(
  local: LocalDateTime,
  place?: string,
): TimeAmbiguity[] {
  const out: TimeAmbiguity[] = [];
  const where = (place ?? "").toLowerCase();

  if (inRange(local, 1906, 1955) && /bombay|mumbai/.test(where)) {
    out.push({
      code: "bombay-local-time",
      message:
        "Bombay kept its own local time (UTC+4:51) alongside IST until 1955. A clock time recorded in Bombay Time is 39 minutes behind IST, which moves the lagna by about 10 degrees.",
      alternative: HISTORICAL_ZONES.bombay,
    });
  }

  if (inRange(local, 1906, 1948) && /calcutta|kolkata/.test(where)) {
    out.push({
      code: "calcutta-local-time",
      message:
        "Calcutta Time (UTC+5:53:20) remained in official use until 1948, 23 minutes ahead of IST.",
      alternative: HISTORICAL_ZONES.calcutta,
    });
  }

  // tzdata handles this one correctly, but people re-entering an old time from memory
  // often normalise it to IST themselves, which double-counts the shift
  if (
    (local.year === 1941 && local.month >= 10) ||
    (local.year > 1941 && local.year < 1945) ||
    (local.year === 1945 && local.month <= 10)
  ) {
    out.push({
      code: "wartime-dst",
      message:
        "India ran on UTC+6:30 from October 1941 to 15 October 1945. Check whether the recorded time was already converted to IST.",
      alternative: HISTORICAL_ZONES.ist,
    });
  }

  if (local.year < 1906) {
    out.push({
      code: "pre-1906-lmt",
      message:
        "Before 1906 there was no national standard time. Clock times were local mean time for the town, so the birth longitude matters more than the zone.",
    });
  }

  return out;
}
