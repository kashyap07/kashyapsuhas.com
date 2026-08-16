// reading a life area.
//
// yogas describe the person. a life event is read from its bhava, and the classical
// procedure is the same every time:
//
//   1. the bhava itself, and who stands in it
//   2. the bhava lord: where it went, and in what condition
//   3. what aspects the bhava
//   4. the karaka, the natural significator of that matter
//
// each of those produces an observation with its own polarity, and the observations
// are shown rather than collapsed into a verdict. a tally is offered at the end, but
// it is a count of what is displayed, not shadbala and not a classical measure.
import { GRAHA_NAMES, RASHIS } from "../constants";
import type { DashaPeriod } from "../dasha";
import { DIGNITY_PHRASE, DIGNITY_RANK } from "../dignity";
import { aspectsOnRashi } from "../drishti";
import { BHAVA_SIGNIFIES, KARAKATVA, joinWords } from "../karakatva";
import type { GrahaId } from "../types";
import { type Activation, activationsFor } from "./engine";
import {
  type Citation,
  DUSTHANA,
  type Domain,
  KENDRA,
  NAISARGIKA_PAPA,
  NAISARGIKA_SHUBHA,
  type Polarity,
  type RuleContext,
  TRIKONA,
} from "./types";

const g = (id: GrahaId) => GRAHA_NAMES[id].name;
const r = (i: number) => RASHIS[i].name;

/** 1st, 2nd, 3rd, 4th. "the 2th lord" is not a thing. */
export function ord(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

const BPHS_BHAVA: Citation = {
  text: "Brihat Parashara Hora Shastra",
  short: "BPHS",
  chapter: "chapters on the judgement of the bhavas",
};

const BPHS_KARAKA: Citation = {
  text: "Brihat Parashara Hora Shastra",
  short: "BPHS",
  chapter: "chapter on the naisargika karakas",
};

const BPHS_DRISHTI: Citation = {
  text: "Brihat Parashara Hora Shastra",
  short: "BPHS",
  chapter: "chapter on graha drishti",
};

export type DomainDef = {
  domain: Domain;
  label: string;
  /** primary bhava first; the rest are supporting */
  bhavas: number[];
  /** natural significators for this matter */
  karakas: GrahaId[];
  /** what the bhavas signify here, for display */
  reads: string;
  note?: string;
  /**
   * when this domain names an actual datable event. absent means the domain is a
   * standing condition rather than something that happens on a date.
   */
  event?: {
    /** how to phrase the event itself */
    phrasing: string;
    /** the age band outside which the prediction is not worth making */
    minAge: number;
    maxAge: number;
  };
};

export const DOMAINS: DomainDef[] = [
  {
    domain: "vidya",
    event: {
      phrasing:
        "a decisive turn in study: a degree, a qualification, or the training that sets the direction",
      minAge: 15,
      maxAge: 32,
    },
    label: "Education",
    bhavas: [4, 5, 9],
    karakas: ["budha", "guru"],
    reads:
      "the 4th for schooling and the formal course of study, the 5th for intelligence and what is grasped easily, the 9th for higher and deeper learning. Budha carries the intellect, Guru the wisdom.",
  },
  {
    domain: "vivaha",
    event: {
      phrasing: "marriage, or a partnership that settles",
      minAge: 20,
      maxAge: 42,
    },
    label: "Marriage",
    bhavas: [7, 2, 11],
    karakas: ["shukra"],
    reads:
      "the 7th for the spouse and the union itself, the 2nd for the family it creates, the 11th for its gains. Shukra is the karaka.",
    note: "for a woman's chart the tradition adds Guru as karaka of the husband. this reading uses Shukra only, so read it with that in mind.",
  },
  {
    domain: "arogya",
    event: {
      phrasing:
        "a stretch where health needs watching rather than a specific illness",
      minAge: 0,
      maxAge: 100,
    },
    label: "Health",
    bhavas: [1, 6, 8],
    karakas: ["surya", "shani"],
    reads:
      "the 1st for the constitution, the 6th for illness and its treatment, the 8th for chronic and sudden matters. Surya carries vitality, Shani the long slow complaints.",
  },
  {
    domain: "vyavasaya",
    event: {
      phrasing:
        "a change of work: a new position, a rise in standing, or a move that resets the career",
      minAge: 20,
      maxAge: 62,
    },
    label: "Career",
    bhavas: [10, 6, 7],
    karakas: ["surya", "shani", "budha"],
    reads:
      "the 10th for the work itself and standing, the 6th for service and employment, the 7th for trade and partnership.",
  },
  {
    domain: "dhana",
    event: {
      phrasing: "a marked gain: property, a windfall, or a step up in income",
      minAge: 22,
      maxAge: 70,
    },
    label: "Wealth",
    bhavas: [2, 11],
    karakas: ["guru", "shukra"],
    reads: "the 2nd for accumulated wealth, the 11th for income and gains.",
  },
  {
    domain: "santana",
    event: { phrasing: "the birth of children", minAge: 22, maxAge: 45 },
    label: "Children",
    bhavas: [5],
    karakas: ["guru"],
    reads: "the 5th, with Guru as karaka.",
  },
  {
    domain: "ayu",
    label: "Life course",
    bhavas: [8, 1, 3],
    karakas: ["shani"],
    reads:
      "the 8th for longevity, the 1st for the body that carries it, the 3rd as the 8th from the 8th. Shani is the karaka of ayush.",
  },
];

export type Observation = {
  /** the technical statement, for someone reading the chart */
  label: string;
  detail: string;
  /** what it actually means, for someone who is not */
  means?: string;
  polarity: Polarity;
  source: Citation;
  contested?: string;
};

export type DomainReading = {
  def: DomainDef;
  /** bhava number, the rashi standing there, its lord, and who occupies it */
  houses: {
    bhava: number;
    rashi: number;
    lord: GrahaId;
    occupants: GrahaId[];
  }[];
  observations: Observation[];
  /** plain-language reading, assembled from the same observations */
  summary: string[];
  /** grahas whose dashas bring this matter forward */
  grahas: GrahaId[];
  supporting: number;
  afflicting: number;
};

const isKendraOrTrikona = (b: number) =>
  KENDRA.includes(b) || TRIKONA.includes(b);

/** what a graha's condition means for its ability to deliver. */
function dignityMeaning(graha: GrahaId, rank: number): string {
  if (rank >= 5)
    return `${g(graha)} is at full strength here, so what it promises it can actually deliver`;
  if (rank === 4)
    return `${g(graha)} is comfortable here and works without obstruction`;
  if (rank === 3)
    return `${g(graha)} is supported, and gives its results without much struggle`;
  if (rank === 2)
    return `${g(graha)} is neither helped nor hindered, so results follow effort`;
  if (rank === 1)
    return `${g(graha)} is working against the grain here and gives its results grudgingly`;
  return `${g(graha)} is at its weakest, so this matter tends to demand conscious work rather than arriving on its own`;
}

function lordObservations(
  ctx: RuleContext,
  bhava: number,
  primary: boolean,
): Observation[] {
  const lord = ctx.lordOf(bhava);
  const sits = ctx.bhavaOf(lord);
  const state = ctx.states[lord];
  const out: Observation[] = [];

  // where the lord went
  let polarity: Polarity = "mixed";
  let verdict = "a neutral bhava";
  if (DUSTHANA.includes(sits)) {
    polarity = "malefic";
    verdict = "a dusthana, which the texts read as strain on the matter";
  } else if (isKendraOrTrikona(sits)) {
    polarity = "benefic";
    verdict = "a kendra or trikona, which supports the matter";
  }

  out.push({
    label: `the ${ord(bhava)} lord ${g(lord)} sits in the ${ord(sits)}`,
    detail: `${r(ctx.chart.grahas[lord].rashi)}, ${verdict}`,
    means: `matters of ${joinWords(BHAVA_SIGNIFIES[bhava].covers, 2)} play out through ${BHAVA_SIGNIFIES[sits].arena}, in the manner of ${g(lord)}: ${joinWords(KARAKATVA[lord].vocations)}`,
    polarity,
    source: BPHS_BHAVA,
  });

  // the condition it is in
  const rank = DIGNITY_RANK[state.dignity];
  out.push({
    label: `${g(lord)} ${DIGNITY_PHRASE[state.dignity]}`,
    detail: state.astangata
      ? `and astangata, ${state.fromSurya.toFixed(1)} degrees from Surya`
      : `in ${r(ctx.chart.grahas[lord].rashi)}`,
    means: dignityMeaning(lord, rank),
    polarity: rank >= 4 ? "benefic" : rank <= 1 ? "malefic" : "mixed",
    source: BPHS_BHAVA,
  });

  if (state.astangata && primary) {
    out.push({
      label: `${g(lord)} is combust`,
      detail:
        "a graha too close to Surya is held to lose its power to give results",
      means: `${g(lord)} runs this matter but is swallowed by Surya's glare, so results tend to be there on paper without being felt`,
      polarity: "malefic",
      source: BPHS_BHAVA,
    });
  }

  return out;
}

function occupantObservations(ctx: RuleContext, bhava: number): Observation[] {
  const occ = ctx.occupants(bhava);
  if (!occ.length) return [];

  const shubha = occ.filter((x) => NAISARGIKA_SHUBHA.includes(x));
  const papa = occ.filter((x) => NAISARGIKA_PAPA.includes(x));
  const out: Observation[] = [];

  if (shubha.length) {
    out.push({
      label: `${shubha.map(g).join(" and ")} stand${shubha.length > 1 ? "" : "s"} in the ${ord(bhava)}`,
      detail: "natural benefics in a bhava are held to protect it",
      means: `${joinWords(
        shubha.map(
          (x) => `${g(x)} lends ${joinWords(KARAKATVA[x].qualities, 2)}`,
        ),
        2,
      )} to ${BHAVA_SIGNIFIES[bhava].arena}`,
      polarity: "benefic",
      source: BPHS_BHAVA,
    });
  }
  if (papa.length) {
    out.push({
      label: `${papa.map(g).join(" and ")} stand${papa.length > 1 ? "" : "s"} in the ${ord(bhava)}`,
      detail: "natural malefics in a bhava are held to trouble it",
      means: `${joinWords(
        papa.map(
          (x) => `${g(x)} brings ${joinWords(KARAKATVA[x].qualities, 2)}`,
        ),
        2,
      )} into ${BHAVA_SIGNIFIES[bhava].arena}, which the texts read as pressure rather than ease`,
      polarity: "malefic",
      source: BPHS_BHAVA,
    });
  }
  return out;
}

function aspectObservations(ctx: RuleContext, bhava: number): Observation[] {
  const rashi = ctx.chart.bhavaRashi[bhava - 1];
  const rashiOf = {} as Record<GrahaId, number>;
  for (const id of Object.keys(ctx.chart.grahas) as GrahaId[]) {
    rashiOf[id] = ctx.chart.grahas[id].rashi;
  }

  const incoming = aspectsOnRashi(rashi, rashiOf);
  if (!incoming.length) return [];

  const out: Observation[] = [];
  const shubha = incoming.filter((a) => NAISARGIKA_SHUBHA.includes(a.graha));
  const papa = incoming.filter((a) => NAISARGIKA_PAPA.includes(a.graha));

  if (shubha.length) {
    out.push({
      label: `${shubha.map((a) => g(a.graha)).join(" and ")} aspect${shubha.length > 1 ? "" : "s"} the ${ord(bhava)}`,
      detail: shubha
        .map(
          (a) =>
            `${g(a.graha)} by its ${ord(a.distance)}${a.special ? " special" : ""} drishti`,
        )
        .join(", "),
      means: `${joinWords(
        shubha.map((a) => g(a.graha)),
        2,
      )} watching this bhava steadies it, lending ${joinWords(
        shubha.flatMap((a) => KARAKATVA[a.graha].qualities),
        2,
      )}`,
      polarity: "benefic",
      source: BPHS_DRISHTI,
    });
  }
  if (papa.length) {
    out.push({
      label: `${papa.map((a) => g(a.graha)).join(" and ")} aspect${papa.length > 1 ? "" : "s"} the ${ord(bhava)}`,
      detail: papa
        .map(
          (a) =>
            `${g(a.graha)} by its ${ord(a.distance)}${a.special ? " special" : ""} drishti`,
        )
        .join(", "),
      means: `${joinWords(
        papa.map((a) => g(a.graha)),
        2,
      )} pressing on this bhava keeps it unsettled, adding ${joinWords(
        papa.flatMap((a) => KARAKATVA[a.graha].qualities),
        2,
      )}`,
      polarity: "malefic",
      source: BPHS_DRISHTI,
    });
  }
  return out;
}

function karakaObservations(ctx: RuleContext, def: DomainDef): Observation[] {
  const out: Observation[] = [];
  const primary = def.bhavas[0];

  for (const karaka of def.karakas) {
    const state = ctx.states[karaka];
    const sits = ctx.bhavaOf(karaka);
    const rank = DIGNITY_RANK[state.dignity];

    out.push({
      label: `${g(karaka)}, karaka of this matter, ${DIGNITY_PHRASE[state.dignity]} in the ${ord(sits)}`,
      detail: `${r(ctx.chart.grahas[karaka].rashi)}${state.astangata ? ", and combust" : ""}`,
      means: `${g(karaka)} is the natural significator here, standing for ${KARAKATVA[karaka].nature}. ${dignityMeaning(karaka, rank)}, and it operates through ${BHAVA_SIGNIFIES[sits].arena}`,
      polarity: rank >= 4 ? "benefic" : rank <= 1 ? "malefic" : "mixed",
      source: BPHS_KARAKA,
    });

    // karako bhava nashaya: the significator standing in its own bhava is held to
    // spoil it. genuinely disputed, so it is flagged rather than tallied as harm.
    if (sits === primary) {
      out.push({
        label: `${g(karaka)} stands in the very bhava it signifies`,
        detail: "karako bhava nashaya, the karaka spoils the bhava it occupies",
        polarity: "mixed",
        source: BPHS_KARAKA,
        contested:
          "this maxim is far from universally accepted. many lineages reject it outright, and others apply it only to Guru in the 5th and Shukra in the 7th. it is shown but not counted in the tally.",
      });
    }
  }

  return out;
}

/**
 * the plain-language reading.
 *
 * assembled from exactly the same observations shown below it, so nothing here is
 * asserted that the reasoning does not already contain. the wording is chosen from
 * fixed phrasing rather than generated, which is why it can be trusted not to
 * invent: the only things that vary are the graha and bhava names and which branch
 * the tally falls into.
 */
function summarise(
  ctx: RuleContext,
  def: DomainDef,
  supporting: number,
  afflicting: number,
): string[] {
  const out: string[] = [];
  const primary = def.bhavas[0];
  const lord = ctx.lordOf(primary);
  const lordSits = ctx.bhavaOf(lord);
  const lordRank = DIGNITY_RANK[ctx.states[lord].dignity];

  // 1. the shape of the matter: who runs it and where it happens
  out.push(
    `${def.label} here is run by ${g(lord)}, lord of the ${ord(primary)}, working through ${BHAVA_SIGNIFIES[lordSits].arena}. Expect this area to take the colour of ${joinWords(KARAKATVA[lord].vocations)}.`,
  );

  // 2. how well placed it is to deliver
  if (lordRank >= 4) {
    out.push(
      `That lord is strongly placed, so this is an area where things tend to come together without being forced.`,
    );
  } else if (lordRank <= 1) {
    out.push(
      `That lord is weakly placed, so this is an area that asks for deliberate effort rather than one that runs itself.`,
    );
  } else {
    out.push(
      `That lord is moderately placed, so results here follow roughly in proportion to what is put in.`,
    );
  }

  // 3. the karaka, which colours the matter independently of the bhava lord
  const karaka = def.karakas[0];
  const karakaRank = DIGNITY_RANK[ctx.states[karaka].dignity];
  if (karakaRank <= 1) {
    out.push(
      `${g(karaka)}, the natural significator, is itself under strain, which the tradition reads as the matter needing to be earned rather than given.`,
    );
  } else if (karakaRank >= 4) {
    out.push(
      `${g(karaka)}, the natural significator, is in good condition, which supports the matter independently of the bhava lord.`,
    );
  }

  // 4. the balance, stated as a balance and not as a verdict
  if (afflicting > supporting) {
    out.push(
      `On balance the classical factors weigh against this area more than for it (${afflicting} against, ${supporting} for), which the texts treat as friction to work through rather than a closed door.`,
    );
  } else if (supporting > afflicting) {
    out.push(
      `On balance the classical factors favour this area (${supporting} for, ${afflicting} against).`,
    );
  } else {
    out.push(
      `The classical factors are evenly divided here (${supporting} for, ${afflicting} against), which usually reads as an area of mixed and changeable results.`,
    );
  }

  return out;
}

/** read one life area. */
export function readDomain(ctx: RuleContext, def: DomainDef): DomainReading {
  const houses = def.bhavas.map((bhava) => ({
    bhava,
    rashi: ctx.chart.bhavaRashi[bhava - 1],
    lord: ctx.lordOf(bhava),
    occupants: ctx.occupants(bhava),
  }));

  const observations: Observation[] = [];
  def.bhavas.forEach((bhava, i) => {
    const primary = i === 0;
    observations.push(...lordObservations(ctx, bhava, primary));
    observations.push(...occupantObservations(ctx, bhava));
    // aspects only on the primary bhava, or the card turns into noise
    if (primary) observations.push(...aspectObservations(ctx, bhava));
  });
  observations.push(...karakaObservations(ctx, def));

  // the same graha often rules two of a domain's bhavas (kuja owns both mesha and
  // vrishchika, so for a vrishchika lagna he is lord of the 1st and the 6th). his
  // dignity is then stated twice identically, which reads as padding. keep the
  // distinct placement lines, collapse the exact repeats.
  const seen = new Set<string>();
  const deduped = observations.filter((o) => {
    const key = `${o.label}|${o.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const counted = deduped.filter((o) => !o.contested);
  const grahas = [...new Set([...houses.map((h) => h.lord), ...def.karakas])];
  const supporting = counted.filter((o) => o.polarity === "benefic").length;
  const afflicting = counted.filter((o) => o.polarity === "malefic").length;

  return {
    def,
    houses,
    observations: deduped,
    summary: summarise(ctx, def, supporting, afflicting),
    grahas,
    supporting,
    afflicting,
  };
}

export function readAllDomains(ctx: RuleContext): DomainReading[] {
  return DOMAINS.map((def) => readDomain(ctx, def));
}

/** when this life area is expected to be active. */
export function domainTiming(
  reading: DomainReading,
  tree: DashaPeriod[],
): Activation[] {
  return activationsFor(reading.grahas, tree);
}

/**
 * a dasha period in words rather than in graha names.
 *
 * the mahadasha sets the character of the stretch and the antardasha colours it, so
 * a pair reads as the first modified by the second.
 */
export function describeDasha(lords: GrahaId[]): string {
  if (!lords.length) return "";
  const main = KARAKATVA[lords[0]].dasha;
  if (lords.length === 1) return main;
  return `${main}, with ${g(lords[1])} bringing ${joinWords(KARAKATVA[lords[1]].qualities, 2)} to the front`;
}

// ── dated event windows ───────────────────────────────────────────────────────

export type EventWindow = {
  from: Date;
  to: Date;
  lords: GrahaId[];
  /** 0 to 1, how much of the domain's machinery is running at once */
  score: number;
  /** the reasoning, in plain words */
  because: string;
  /** stretches inside the window when Guru touches the primary bhava */
  triggers: { from: Date; to: Date }[];
  ageFrom: number;
  ageTo: number;
};

const YEAR_MS = 365.25 * 86400000;
const ageAt = (d: Date, birth: Date) =>
  (d.getTime() - birth.getTime()) / YEAR_MS;

/**
 * when the matter is most likely to actually come due.
 *
 * the method is the ordinary parashari one, made explicit:
 *
 *   1. an event belongs to the dasha of the grahas that carry it, meaning the lord of
 *      its bhava, the karaka, and whoever sits in that bhava
 *   2. a window where two of those run together (mahadasha and antardasha) is far
 *      stronger than one where only the mahadasha lord is involved
 *   3. a window outside the plausible age for the event is not a prediction, it is
 *      arithmetic, so it is dropped
 *   4. Guru arriving on the bhava during the window is the classical trigger, and is
 *      what narrows five years down to one
 *
 * this cannot say an event will happen. it says which years the tradition would point
 * at, and why, which is the honest version of the same question.
 */
export function eventWindows(
  ctx: RuleContext,
  reading: DomainReading,
  tree: DashaPeriod[],
  birth: Date,
  guruWindows: { from: Date; to: Date }[] = [],
  limit = 4,
): EventWindow[] {
  const def = reading.def;
  if (!def.event) return [];

  const primary = def.bhavas[0];
  const key = new Set<GrahaId>([
    ctx.lordOf(primary),
    ...def.karakas,
    ...ctx.occupants(primary),
  ]);

  const out: EventWindow[] = [];

  for (const maha of tree) {
    for (const antar of maha.children ?? []) {
      const hits = [maha.lord, antar.lord].filter((l) => key.has(l));
      if (!hits.length) continue;

      const ageFrom = ageAt(antar.start, birth);
      const ageTo = ageAt(antar.end, birth);
      // the window has to touch the plausible age band at all
      if (ageTo < def.event.minAge || ageFrom > def.event.maxAge) continue;

      const distinct = new Set(hits).size;
      let score = distinct >= 2 ? 1 : 0.5;

      const triggers = guruWindows
        .map((w) => intersectWindow({ from: antar.start, to: antar.end }, w))
        .filter((w): w is { from: Date; to: Date } => w !== null);

      // Guru's arrival on the bhava is the classical confirmation
      if (triggers.length) score = Math.min(1, score + 0.25);

      const who =
        distinct >= 2
          ? `${g(maha.lord)} and ${g(antar.lord)} both carry this matter, and they run together here`
          : `${g(hits[0])} carries this matter and runs through this stretch`;

      out.push({
        from: antar.start,
        to: antar.end,
        lords: [maha.lord, antar.lord],
        score,
        because: triggers.length
          ? `${who}. Guru also crosses the ${ord(primary)} during it, which the texts treat as the trigger.`
          : `${who}.`,
        triggers,
        ageFrom,
        ageTo,
      });
    }
  }

  return out
    .sort((a, b) => b.score - a.score || a.from.getTime() - b.from.getTime())
    .slice(0, limit)
    .sort((a, b) => a.from.getTime() - b.from.getTime());
}

/** local copy so this module stays free of the ephemeris import */
function intersectWindow(
  a: { from: Date; to: Date },
  b: { from: Date; to: Date },
): { from: Date; to: Date } | null {
  if (!(a.from < b.to && b.from < a.to)) return null;
  return {
    from: new Date(Math.max(a.from.getTime(), b.from.getTime())),
    to: new Date(Math.min(a.to.getTime(), b.to.getTime())),
  };
}
