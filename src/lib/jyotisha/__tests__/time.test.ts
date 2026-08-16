import { lagnaLongitude } from "../chart";
import {
  HISTORICAL_ZONES,
  ianaOffsetSeconds,
  resolveInstant,
  timeAmbiguities,
} from "../time";

const KOLKATA = { kind: "iana" as const, zone: "Asia/Kolkata" };

describe("iana offsets", () => {
  it("gives IST for a modern date", () => {
    expect(
      ianaOffsetSeconds(new Date("2000-01-01T00:00:00Z"), "Asia/Kolkata"),
    ).toBe(5 * 3600 + 30 * 60);
  });

  it("knows about the 1942 wartime shift to UTC+6:30", () => {
    // india ran on +6:30 from october 1941 to 15 october 1945
    expect(
      ianaOffsetSeconds(new Date("1942-09-01T00:00:00Z"), "Asia/Kolkata"),
    ).toBe(6 * 3600 + 30 * 60);
  });

  it("is back on IST after october 1945", () => {
    expect(
      ianaOffsetSeconds(new Date("1946-01-01T00:00:00Z"), "Asia/Kolkata"),
    ).toBe(5 * 3600 + 30 * 60);
  });

  it("uses madras local mean time before 1906", () => {
    // tzdata carries the seconds here, which is why we read the offset off formatted
    // fields instead of parsing a rounded "GMT+05:21" string
    expect(
      ianaOffsetSeconds(new Date("1900-01-01T00:00:00Z"), "Asia/Kolkata"),
    ).toBe(5 * 3600 + 21 * 60 + 10);
  });
});

describe("resolveInstant", () => {
  it("round trips a modern IST birth", () => {
    const instant = resolveInstant(
      { year: 1990, month: 5, day: 1, hour: 6, minute: 0 },
      KOLKATA,
    );
    // 06:00 IST is 00:30 UTC the same day
    expect(instant.toISOString()).toBe("1990-05-01T00:30:00.000Z");
  });

  it("applies wartime DST without being told", () => {
    const instant = resolveInstant(
      { year: 1942, month: 9, day: 1, hour: 6, minute: 0 },
      KOLKATA,
    );
    // 06:00 local at +6:30 is 23:30 the previous day UTC
    expect(instant.toISOString()).toBe("1942-08-31T23:30:00.000Z");
  });

  it("honours a fixed historical offset", () => {
    const instant = resolveInstant(
      { year: 1948, month: 3, day: 12, hour: 4, minute: 30 },
      HISTORICAL_ZONES.bombay,
    );
    // 04:30 bombay time (+4:51) is 23:39 the previous day UTC
    expect(instant.toISOString()).toBe("1948-03-11T23:39:00.000Z");
  });

  it("keeps sub-minute offsets intact", () => {
    const instant = resolveInstant(
      { year: 1930, month: 1, day: 1, hour: 12, minute: 0 },
      HISTORICAL_ZONES.calcutta,
    );
    // +5:53:20
    expect(instant.toISOString()).toBe("1930-01-01T06:06:40.000Z");
  });
});

describe("why this module exists", () => {
  it("shows bombay time vs IST moving the lagna by most of a rashi", () => {
    const place = { latitude: 19.076, longitude: 72.8777 }; // bombay
    const local = { year: 1948, month: 3, day: 12, hour: 4, minute: 30 };

    const asIst = lagnaLongitude({
      ...place,
      when: resolveInstant(local, HISTORICAL_ZONES.ist),
    });
    const asBombay = lagnaLongitude({
      ...place,
      when: resolveInstant(local, HISTORICAL_ZONES.bombay),
    });

    const shift = Math.abs(asBombay - asIst);
    // 39 minutes of clock is roughly 10 degrees of lagna
    expect(shift).toBeGreaterThan(8);
    expect(shift).toBeLessThan(12);
  });
});

describe("ambiguity flags", () => {
  it("flags a bombay birth in the contested window", () => {
    const flags = timeAmbiguities(
      { year: 1948, month: 3, day: 12, hour: 4, minute: 30 },
      "Bombay",
    );
    expect(flags.map((f) => f.code)).toContain("bombay-local-time");
    expect(
      flags.find((f) => f.code === "bombay-local-time")?.alternative,
    ).toEqual(HISTORICAL_ZONES.bombay);
  });

  it("matches mumbai as well as bombay", () => {
    const flags = timeAmbiguities(
      { year: 1950, month: 1, day: 1, hour: 12, minute: 0 },
      "Mumbai, Maharashtra",
    );
    expect(flags.map((f) => f.code)).toContain("bombay-local-time");
  });

  it("does not flag bombay after 1955", () => {
    const flags = timeAmbiguities(
      { year: 1960, month: 1, day: 1, hour: 12, minute: 0 },
      "Bombay",
    );
    expect(flags.map((f) => f.code)).not.toContain("bombay-local-time");
  });

  it("flags the wartime window regardless of place", () => {
    expect(
      timeAmbiguities({ year: 1943, month: 6, day: 1, hour: 9, minute: 0 }).map(
        (f) => f.code,
      ),
    ).toContain("wartime-dst");
    expect(
      timeAmbiguities({
        year: 1941,
        month: 11,
        day: 1,
        hour: 9,
        minute: 0,
      }).map((f) => f.code),
    ).toContain("wartime-dst");
    // just outside on both ends
    expect(
      timeAmbiguities({ year: 1941, month: 8, day: 1, hour: 9, minute: 0 }).map(
        (f) => f.code,
      ),
    ).not.toContain("wartime-dst");
    expect(
      timeAmbiguities({ year: 1946, month: 1, day: 1, hour: 9, minute: 0 }).map(
        (f) => f.code,
      ),
    ).not.toContain("wartime-dst");
  });

  it("flags pre-1906 births as local mean time", () => {
    expect(
      timeAmbiguities({ year: 1890, month: 1, day: 1, hour: 9, minute: 0 }).map(
        (f) => f.code,
      ),
    ).toContain("pre-1906-lmt");
  });

  it("says nothing about an ordinary modern birth", () => {
    expect(
      timeAmbiguities(
        { year: 1990, month: 5, day: 1, hour: 6, minute: 0 },
        "Bengaluru",
      ),
    ).toEqual([]);
  });
});
