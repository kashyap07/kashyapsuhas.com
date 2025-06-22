import formatDate from "../formatDate";

jest.mock("next/cache", () => ({
  unstable_noStore: jest.fn(),
}));

describe("formatDate", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    // fake today for deterministic values
    jest.setSystemTime(new Date("2025-06-23T12:00:00.000Z"));
  });
  afterAll(() => jest.useRealTimers());
  afterEach(() => jest.clearAllMocks());

  const cases: Record<string, string> = {
    "2025-06-23": "June 23, 2025 (Today)",
    "2025-06-23T00:00:00": "June 23, 2025 (Today)",
    "2025-06-09T04:01:45.414Z": "June 9, 2025 (14d ago)",
    "2024-11-04T16:04:24.080Z": "November 4, 2024 (7mo ago)",
    "2024-07-04T12:04:24.080Z": "July 4, 2024 (11mo ago)",
    "2024-07-01T00:00:00.000Z": "July 1, 2024 (11mo ago)",
    "2024-06-24T00:00:00.000Z": "June 24, 2024 (1y ago)",
    "2024-06-23T00:00:00.000Z": "June 23, 2024 (1y ago)",
    "2024-06-04T00:00:00.000Z": "June 4, 2024 (1y ago)",
    "2024-05-04T00:00:00.000Z": "May 4, 2024 (1y ago)",
    "2022-08-01T09:10:55+05:30": "August 1, 2022 (3y ago)",
  };

  for (const [input, expected] of Object.entries(cases)) {
    it(`should format "${input}" → "${expected}"`, () => {
      expect(formatDate(input)).toBe(expected);
    });
  }
});
