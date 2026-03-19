import { computePanchanga } from "../calculations";

// helper: IST noon = UTC 06:30
function istNoon(isoDate: string): Date {
  return new Date(`${isoDate}T06:30:00Z`);
}

describe("computePanchanga", () => {
  describe("known date: 2026-03-14 (Saturday, Phalguna Krishna Ekadashi)", () => {
    const result = computePanchanga(istNoon("2026-03-14"));

    it("samvatsara is Vishvavasu", () => {
      expect(result.samvatsara).toBe("Vishvavasu");
    });

    it("ayana is Uttarayana", () => {
      expect(result.ayana).toBe("Uttarayana");
    });

    it("ritu is Shishira", () => {
      expect(result.ritu).toBe("Shishira");
    });

    it("maasa is Phalguna", () => {
      expect(result.maasa).toBe("Phalguna");
    });

    it("paksha is Krishna", () => {
      expect(result.paksha).toBe("Krishna");
    });

    it("tithi is Ekadashi", () => {
      expect(result.tithi).toBe("Ekadashi");
    });

    it("vaasara is Shani", () => {
      expect(result.vaasara).toBe("Shani");
    });
  });

  describe("ugadi 2026: chaitra shukla pratipada starts", () => {
    // new moon is march 19 01:24 UTC; pratipada/ugadi is march 20 in IST
    const result = computePanchanga(istNoon("2026-03-20"));

    it("maasa is Chaitra", () => {
      expect(result.maasa).toBe("Chaitra");
    });

    it("paksha is Shukla", () => {
      expect(result.paksha).toBe("Shukla");
    });

    it("ritu is Vasantha", () => {
      expect(result.ritu).toBe("Vasantha");
    });
  });

  describe("samvatsara transition at ugadi 2026", () => {
    it("before ugadi (march 18) → Vishvavasu", () => {
      expect(computePanchanga(istNoon("2026-03-18")).samvatsara).toBe("Vishvavasu");
    });

    it("ugadi day (march 19, pratipada) → Parabhava", () => {
      expect(computePanchanga(istNoon("2026-03-19")).samvatsara).toBe("Parabhava");
    });

    it("after ugadi (march 20+) → Parabhava", () => {
      expect(computePanchanga(istNoon("2026-03-21")).samvatsara).toBe("Parabhava");
    });
  });

  describe("ayana boundaries", () => {
    it("mid-january is Uttarayana (sun in Makara)", () => {
      expect(computePanchanga(istNoon("2026-01-15")).ayana).toBe("Uttarayana");
    });

    it("late-july is Dakshinayana (sun in Karka, enters ~jul 17)", () => {
      expect(computePanchanga(istNoon("2026-07-20")).ayana).toBe("Dakshinayana");
    });
  });

  describe("ritu from maasa", () => {
    it("Vasantha: Chaitra/Vaishakha → april", () => {
      expect(computePanchanga(istNoon("2026-04-10")).ritu).toBe("Vasantha");
    });

    it("Varsha: Shravana/Bhadrapada → late-august", () => {
      expect(computePanchanga(istNoon("2026-08-25")).ritu).toBe("Varsha");
    });
  });

  describe("vaasara (day of week)", () => {
    // 2026-03-16 is a Monday
    it("Monday → Soma", () => {
      expect(computePanchanga(new Date("2026-03-16T06:30:00Z")).vaasara).toBe("Soma");
    });

    // 2026-03-18 is a Wednesday
    it("Wednesday → Budha", () => {
      expect(computePanchanga(new Date("2026-03-18T06:30:00Z")).vaasara).toBe("Budha");
    });
  });

  describe("output shape", () => {
    const result = computePanchanga(istNoon("2026-03-14"));
    const keys = ["samvatsara", "ayana", "ritu", "maasa", "paksha", "tithi", "vaasara", "nakshatra"];

    it("returns all required fields", () => {
      keys.forEach((k) => expect(result).toHaveProperty(k));
    });

    it("all fields are non-empty strings", () => {
      keys.forEach((k) =>
        expect(typeof result[k as keyof typeof result]).toBe("string"),
      );
    });
  });
});
