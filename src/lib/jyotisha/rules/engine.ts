// deterministic evaluation. no randomness, no model in the loop: the same chart
// always produces the same cards, and every card can point at what triggered it.
import type { Chart } from "../chart";
import { RASHIS } from "../constants";
import type { DashaPeriod } from "../dasha";
import { allStates } from "../dignity";
import type { GrahaId } from "../types";
import { RULES } from "./corpus";
import type { Domain, FiredRule, Rule, RuleContext } from "./types";

export function buildContext(chart: Chart): RuleContext {
  const lordOf = (bhava: number): GrahaId =>
    RASHIS[chart.bhavaRashi[bhava - 1]].lord;

  const owns = (graha: GrahaId): number[] => {
    const out: number[] = [];
    for (let b = 1; b <= 12; b++) if (lordOf(b) === graha) out.push(b);
    return out;
  };

  return {
    chart,
    states: allStates(chart.grahas),
    lordOf,
    owns,
    bhavaOf: (graha) => chart.bhava[graha],
    fromChandra: (graha) =>
      ((chart.grahas[graha].rashi - chart.grahas.chandra.rashi + 12) % 12) + 1,
    occupants: (bhava) =>
      (Object.keys(chart.grahas) as GrahaId[]).filter(
        (id) => chart.bhava[id] === bhava,
      ),
  };
}

/** every rule that fires for this chart. */
export function evaluate(chart: Chart, rules: Rule[] = RULES): FiredRule[] {
  const ctx = buildContext(chart);
  const fired: FiredRule[] = [];

  for (const rule of rules) {
    const result = rule.test(ctx);
    if (!result) continue;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { test, ...rest } = rule;
    fired.push({ ...rest, result });
  }

  return fired;
}

export function byDomain(fired: FiredRule[]): Map<Domain, FiredRule[]> {
  const map = new Map<Domain, FiredRule[]>();
  for (const rule of fired) {
    for (const d of rule.domains) {
      const list = map.get(d) ?? [];
      list.push(rule);
      map.set(d, list);
    }
  }
  return map;
}

// ── timing ────────────────────────────────────────────────────────────────────

export type Activation = {
  period: DashaPeriod;
  /**
   * "full" when the mahadasha and antardasha lords are both part of the yoga, which
   * is when the tradition expects it to actually show. "partial" when only the
   * mahadasha lord is involved.
   */
  strength: "full" | "partial";
  lords: GrahaId[];
};

/**
 * when a fired rule is expected to speak.
 *
 * parashari timing: a yoga gives its result during the dasha and antardasha of the
 * grahas that form it. that is the whole mechanism by which this system makes a dated
 * statement rather than a static description, so it is worth being precise: a rule
 * involving two grahas is strongest when one runs the mahadasha and the other the
 * antardasha inside it.
 */
export function activations(
  rule: FiredRule,
  tree: DashaPeriod[],
): Activation[] {
  return activationsFor(rule.result.grahas, tree);
}

/**
 * the same timing over a bare set of grahas, for bhava readings, which have a
 * significator and a bhava lord rather than a yoga.
 */
export function activationsFor(
  grahas: GrahaId[],
  tree: DashaPeriod[],
): Activation[] {
  const involved = new Set(grahas);
  const out: Activation[] = [];

  for (const maha of tree) {
    const inner = (maha.children ?? []).filter((a) => involved.has(a.lord));

    if (!involved.has(maha.lord)) {
      // the mahadasha lord is unrelated to this matter, but an antardasha of one of
      // its own grahas still brings it forward. skipping these was leaving whole
      // decades blank: a chart running an unrelated mahadasha for eighteen years
      // looked as though the matter simply never came up, which is not what the
      // tradition says and reads as a broken tool.
      for (const antar of inner) {
        out.push({ period: antar, strength: "partial", lords: [antar.lord] });
      }
      continue;
    }

    // a single graha rule cannot pair with itself, so its mahadasha is the full signal
    const canPair = involved.size > 1;

    if (canPair && inner.length) {
      for (const antar of inner) {
        if (antar.lord === maha.lord) continue;
        out.push({
          period: antar,
          strength: "full",
          lords: [maha.lord, antar.lord],
        });
      }
    }

    out.push({
      period: maha,
      strength: canPair ? "partial" : "full",
      lords: [maha.lord],
    });
  }

  return out.sort(
    (a, b) => a.period.start.getTime() - b.period.start.getTime(),
  );
}

/** activations that have already happened, for reading a chart against a life. */
export function pastActivations(
  rule: FiredRule,
  tree: DashaPeriod[],
  now: Date = new Date(),
): Activation[] {
  return activations(rule, tree).filter((a) => a.period.start <= now);
}

export function upcomingActivations(
  rule: FiredRule,
  tree: DashaPeriod[],
  now: Date = new Date(),
): Activation[] {
  return activations(rule, tree).filter((a) => a.period.end > now);
}
