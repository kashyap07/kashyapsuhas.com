// the phala (interpretation) layer.
//
// hard boundary: everything under src/lib/jyotisha OUTSIDE this directory is ganita,
// is verifiable against swiss ephemeris, and is tested that way. nothing in here is
// verifiable in that sense. these are claims the tradition makes.
//
// so every rule carries three things the ganita layer never needs: where it comes
// from, what actually triggered it in this chart, and what the text claims. the ui
// shows all three. a reader should always be able to see the reasoning and disagree
// with it.
import type { Chart } from "../chart";
import type { GrahaState } from "../dignity";
import type { GrahaId } from "../types";

export type Domain =
  | "swabhava" // character, disposition
  | "dhana" // wealth
  | "vivaha" // marriage
  | "arogya" // health
  | "vyavasaya" // career
  | "vidya" // learning
  | "santana" // children
  | "ayu"; // longevity, life course

export const DOMAIN_LABEL: Record<Domain, string> = {
  swabhava: "character",
  dhana: "wealth",
  vivaha: "marriage",
  arogya: "health",
  vyavasaya: "career",
  vidya: "learning",
  santana: "children",
  ayu: "life course",
};

/**
 * where a rule comes from.
 *
 * deliberately chapter-level, not verse-level. verse numbering in BPHS differs
 * between the santhanam and sharma translations and between manuscript recensions, so
 * a precise "36.5" would look more authoritative than it can honestly be. `note` is
 * where a rule admits it is regional practice rather than textual.
 */
export type Citation = {
  /** full name of the source text */
  text: string;
  /** short form for display */
  short: string;
  /** chapter or topic, as a name rather than a number where possible */
  chapter: string;
  note?: string;
};

/** a single thing in the chart that made the rule fire. shown to the reader. */
export type Factor = {
  label: string;
  detail: string;
};

export type Polarity = "benefic" | "malefic" | "mixed";

export type RuleResult = {
  factors: Factor[];
  /** whose dashas bring this to the surface. drives the timing view. */
  grahas: GrahaId[];
  polarity: Polarity;
};

export type RuleContext = {
  chart: Chart;
  states: Record<GrahaId, GrahaState>;
  /** lord of a bhava, 1-indexed */
  lordOf: (bhava: number) => GrahaId;
  /** which bhava a graha occupies, 1-indexed */
  bhavaOf: (graha: GrahaId) => number;
  /** bhava counted from chandra rather than from lagna */
  fromChandra: (graha: GrahaId) => number;
  /** grahas occupying a bhava */
  occupants: (bhava: number) => GrahaId[];
  /** bhavas a graha owns, 1-indexed */
  owns: (graha: GrahaId) => number[];
};

export type Rule = {
  id: string;
  name: string;
  kannada?: string;
  kind: "yoga" | "dosha" | "state";
  domains: Domain[];
  source: Citation;
  /** what the tradition claims. phrased as the claim, never as a prediction of fact. */
  says: string;
  /** where lineages disagree about this rule, said out loud */
  contested?: string;
  test: (ctx: RuleContext) => RuleResult | null;
};

export type FiredRule = Omit<Rule, "test"> & { result: RuleResult };

export const KENDRA = [1, 4, 7, 10];
export const TRIKONA = [1, 5, 9];
export const DUSTHANA = [6, 8, 12];

/** the natural benefics and malefics, before any state is considered. */
export const NAISARGIKA_SHUBHA: GrahaId[] = [
  "guru",
  "shukra",
  "chandra",
  "budha",
];
export const NAISARGIKA_PAPA: GrahaId[] = [
  "surya",
  "kuja",
  "shani",
  "rahu",
  "ketu",
];
