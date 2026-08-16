// the rule corpus.
//
// every entry states its source and, where lineages differ, says so in `contested`
// rather than quietly picking one. `says` is the traditional claim, phrased as the
// claim: "the texts give ...", not "you will ...".
import { GRAHA_NAMES, RASHIS } from "../constants";
import type { GrahaId } from "../types";
import { DUSTHANA, KENDRA, type Rule, TRIKONA } from "./types";

const BPHS = (chapter: string, note?: string) => ({
  text: "Brihat Parashara Hora Shastra",
  short: "BPHS",
  chapter,
  note,
});

const g = (id: GrahaId) => GRAHA_NAMES[id].name;
const r = (i: number) => RASHIS[i].name;

/** grahas that count as occupants for the chandra yogas: not surya, not the nodes. */
const CHANDRA_YOGA_BODIES: GrahaId[] = [
  "kuja",
  "budha",
  "guru",
  "shukra",
  "shani",
];

// ── pancha mahapurusha ────────────────────────────────────────────────────────
// a graha in its own rashi or exalted, standing in a kendra from the lagna.

const MAHAPURUSHA: {
  id: string;
  graha: Exclude<GrahaId, "surya" | "chandra" | "rahu" | "ketu">;
  name: string;
  says: string;
}[] = [
  {
    id: "ruchaka",
    graha: "kuja",
    name: "Ruchaka Yoga",
    says: "commanding presence, physical courage, capacity to lead and to fight for a position.",
  },
  {
    id: "bhadra",
    graha: "budha",
    name: "Bhadra Yoga",
    says: "sharp intelligence, learning, eloquence, a scholarly bearing.",
  },
  {
    id: "hamsa",
    graha: "guru",
    name: "Hamsa Yoga",
    says: "righteous conduct, respect from good people, devotion to dharma.",
  },
  {
    id: "malavya",
    graha: "shukra",
    name: "Malavya Yoga",
    says: "beauty, refinement, comfort, vehicles, happiness through the spouse.",
  },
  {
    id: "sasa",
    graha: "shani",
    name: "Sasa Yoga",
    says: "authority over others and endurance, with a hard and sometimes severe edge.",
  },
];

const mahapurushaRules: Rule[] = MAHAPURUSHA.map(
  ({ id, graha, name, says }) => ({
    id: `mahapurusha-${id}`,
    name,
    kind: "yoga",
    domains: ["swabhava", "vyavasaya"],
    source: BPHS("chapter on the Pancha Mahapurusha yogas"),
    says,
    test: (ctx) => {
      const state = ctx.states[graha];
      const bhava = ctx.bhavaOf(graha);
      const strong =
        state.dignity === "uccha" ||
        state.dignity === "swakshetra" ||
        state.dignity === "moolatrikona";
      if (!strong || !KENDRA.includes(bhava)) return null;
      return {
        factors: [
          {
            label: `${g(graha)} is ${state.dignity === "uccha" ? "exalted" : "in its own rashi"}`,
            detail: `${g(graha)} in ${r(ctx.chart.grahas[graha].rashi)}`,
          },
          {
            label: `standing in a kendra`,
            detail: `bhava ${bhava} from the lagna`,
          },
        ],
        grahas: [graha],
        polarity: "benefic",
      };
    },
  }),
);

// ── chandra yogas ─────────────────────────────────────────────────────────────

const chandraRules: Rule[] = [
  {
    id: "gaja-kesari",
    name: "Gaja Kesari Yoga",
    kannada: "ಗಜ ಕೇಸರಿ ಯೋಗ",
    kind: "yoga",
    domains: ["swabhava", "dhana", "vidya"],
    source: BPHS("chapter on the Chandra yogas"),
    says: "intelligence, lasting reputation, and support from people in authority.",
    test: (ctx) => {
      const pos = ctx.fromChandra("guru");
      if (!KENDRA.includes(pos)) return null;
      return {
        factors: [
          {
            label: "Guru stands in a kendra from Chandra",
            detail: `Guru in ${r(ctx.chart.grahas.guru.rashi)}, ${pos === 1 ? "with" : `${pos}th from`} Chandra in ${r(ctx.chart.grahas.chandra.rashi)}`,
          },
        ],
        grahas: ["guru", "chandra"],
        polarity: "benefic",
      };
    },
  },
  {
    id: "sunapha",
    name: "Sunapha Yoga",
    kind: "yoga",
    domains: ["dhana", "swabhava"],
    source: BPHS("chapter on the Chandra yogas"),
    says: "wealth built by one's own effort rather than inherited.",
    test: (ctx) => {
      const occ = CHANDRA_YOGA_BODIES.filter((x) => ctx.fromChandra(x) === 2);
      if (!occ.length) return null;
      return {
        factors: [
          {
            label: "the 2nd from Chandra is occupied",
            detail: occ.map(g).join(", "),
          },
        ],
        grahas: ["chandra", ...occ],
        polarity: "benefic",
      };
    },
  },
  {
    id: "anapha",
    name: "Anapha Yoga",
    kind: "yoga",
    domains: ["arogya", "swabhava"],
    source: BPHS("chapter on the Chandra yogas"),
    says: "health, reputation, and a well-spoken and agreeable nature.",
    test: (ctx) => {
      const occ = CHANDRA_YOGA_BODIES.filter((x) => ctx.fromChandra(x) === 12);
      if (!occ.length) return null;
      return {
        factors: [
          {
            label: "the 12th from Chandra is occupied",
            detail: occ.map(g).join(", "),
          },
        ],
        grahas: ["chandra", ...occ],
        polarity: "benefic",
      };
    },
  },
  {
    id: "durudhara",
    name: "Durudhara Yoga",
    kind: "yoga",
    domains: ["dhana", "swabhava"],
    source: BPHS("chapter on the Chandra yogas"),
    says: "support on both sides of the mind: comforts, generosity, and means.",
    test: (ctx) => {
      const before = CHANDRA_YOGA_BODIES.filter(
        (x) => ctx.fromChandra(x) === 12,
      );
      const after = CHANDRA_YOGA_BODIES.filter((x) => ctx.fromChandra(x) === 2);
      if (!before.length || !after.length) return null;
      return {
        factors: [
          {
            label: "the 12th from Chandra is occupied",
            detail: before.map(g).join(", "),
          },
          {
            label: "the 2nd from Chandra is occupied",
            detail: after.map(g).join(", "),
          },
        ],
        grahas: ["chandra", ...before, ...after],
        polarity: "benefic",
      };
    },
  },
  {
    id: "kemadruma",
    name: "Kemadruma Yoga",
    kind: "dosha",
    domains: ["swabhava", "dhana"],
    source: BPHS("chapter on the Chandra yogas"),
    says: "the mind stands unsupported: instability of means and a tendency to isolation.",
    contested:
      "widely held to be cancelled when a graha sits in a kendra from the lagna or from Chandra, or when Chandra itself is strong. treat a bare Kemadruma as a prompt to look further, not a verdict.",
    test: (ctx) => {
      const around = CHANDRA_YOGA_BODIES.filter((x) => {
        const p = ctx.fromChandra(x);
        return p === 2 || p === 12 || p === 1;
      });
      if (around.length) return null;
      return {
        factors: [
          {
            label: "nothing occupies the 2nd, 12th or the rashi of Chandra",
            detail: `Chandra alone in ${r(ctx.chart.grahas.chandra.rashi)}`,
          },
        ],
        grahas: ["chandra"],
        polarity: "malefic",
      };
    },
  },
  {
    id: "chandra-mangala",
    name: "Chandra Mangala Yoga",
    kind: "yoga",
    domains: ["dhana"],
    source: BPHS("chapter on the Dhana yogas"),
    says: "earning capacity and enterprise, sometimes through means the native keeps quiet about.",
    test: (ctx) => {
      if (ctx.chart.grahas.chandra.rashi !== ctx.chart.grahas.kuja.rashi)
        return null;
      return {
        factors: [
          {
            label: "Chandra and Kuja occupy the same rashi",
            detail: r(ctx.chart.grahas.chandra.rashi),
          },
        ],
        grahas: ["chandra", "kuja"],
        polarity: "mixed",
      };
    },
  },
];

// ── conjunction and lordship yogas ────────────────────────────────────────────

const structuralRules: Rule[] = [
  {
    id: "budha-aditya",
    name: "Budha Aditya Yoga",
    kind: "yoga",
    domains: ["vidya", "vyavasaya"],
    source: BPHS("chapter on the effects of graha conjunctions"),
    says: "intelligence, administrative skill and clarity of expression.",
    contested:
      "many hold the yoga weakened when Budha is astangata (combust), which is common given how close Budha stays to Surya. this chart's combustion state is shown below.",
    test: (ctx) => {
      if (ctx.chart.grahas.budha.rashi !== ctx.chart.grahas.surya.rashi)
        return null;
      const combust = ctx.states.budha.astangata;
      return {
        factors: [
          {
            label: "Budha and Surya occupy the same rashi",
            detail: r(ctx.chart.grahas.surya.rashi),
          },
          {
            label: combust
              ? "Budha is astangata (combust)"
              : "Budha is not combust",
            detail: `${ctx.states.budha.fromSurya.toFixed(1)} degrees from Surya`,
          },
        ],
        grahas: ["budha", "surya"],
        polarity: combust ? "mixed" : "benefic",
      };
    },
  },
  {
    id: "yogakaraka",
    name: "Yogakaraka",
    kind: "yoga",
    domains: ["vyavasaya", "dhana", "swabhava"],
    source: BPHS("chapter on the Raja yogas"),
    says: "a single graha owning both a kendra and a trikona carries the whole weight of a Raja yoga by itself, and its dasha tends to be the making of the chart.",
    test: (ctx) => {
      for (const id of Object.keys(ctx.chart.grahas) as GrahaId[]) {
        const owned = ctx.owns(id);
        const k = owned.filter((b) => KENDRA.includes(b) && b !== 1);
        const t = owned.filter((b) => TRIKONA.includes(b) && b !== 1);
        if (k.length && t.length) {
          return {
            factors: [
              {
                label: `${g(id)} owns both a kendra and a trikona`,
                detail: `bhava ${k.join(", ")} and bhava ${t.join(", ")}`,
              },
              {
                label: `it sits in bhava ${ctx.bhavaOf(id)}`,
                detail: `${r(ctx.chart.grahas[id].rashi)}, ${ctx.states[id].dignity}`,
              },
            ],
            grahas: [id],
            polarity: "benefic",
          };
        }
      }
      return null;
    },
  },
  {
    id: "raja-yoga",
    name: "Raja Yoga",
    kannada: "ರಾಜ ಯೋಗ",
    kind: "yoga",
    domains: ["vyavasaya", "dhana"],
    source: BPHS("chapter on the Raja yogas"),
    says: "rise in standing, authority, and recognition beyond the family's starting position.",
    contested:
      "this implementation fires only on conjunction of a kendra lord with a trikona lord. the texts also allow mutual aspect and exchange of rashis, which are not yet checked here.",
    test: (ctx) => {
      const kendraLords = new Set(KENDRA.map((b) => ctx.lordOf(b)));
      const trikonaLords = new Set(TRIKONA.map((b) => ctx.lordOf(b)));
      for (const a of kendraLords) {
        for (const b of trikonaLords) {
          if (a === b) continue;
          if (ctx.chart.grahas[a].rashi !== ctx.chart.grahas[b].rashi) continue;
          return {
            factors: [
              {
                label: `${g(a)} rules a kendra and ${g(b)} rules a trikona`,
                detail: `${g(a)}: bhava ${ctx
                  .owns(a)
                  .filter((x) => KENDRA.includes(x))
                  .join(", ")} · ${g(b)}: bhava ${ctx
                  .owns(b)
                  .filter((x) => TRIKONA.includes(x))
                  .join(", ")}`,
              },
              {
                label: "they occupy the same rashi",
                detail: `${r(ctx.chart.grahas[a].rashi)}, bhava ${ctx.bhavaOf(a)}`,
              },
            ],
            grahas: [a, b],
            polarity: "benefic",
          };
        }
      }
      return null;
    },
  },
  {
    id: "dhana-yoga",
    name: "Dhana Yoga",
    kind: "yoga",
    domains: ["dhana"],
    source: BPHS("chapter on the Dhana yogas"),
    says: "accumulation of wealth, and gain that arrives rather than being chased.",
    test: (ctx) => {
      const l2 = ctx.lordOf(2);
      const l11 = ctx.lordOf(11);
      const together =
        ctx.chart.grahas[l2].rashi === ctx.chart.grahas[l11].rashi;
      const l2in11 = ctx.bhavaOf(l2) === 11;
      const l11in2 = ctx.bhavaOf(l11) === 2;
      if (!together && !l2in11 && !l11in2) return null;
      const detail = together
        ? `both in ${r(ctx.chart.grahas[l2].rashi)}`
        : l2in11
          ? `${g(l2)} sits in the 11th`
          : `${g(l11)} sits in the 2nd`;
      return {
        factors: [
          {
            label: `the 2nd lord (${g(l2)}) and the 11th lord (${g(l11)}) are connected`,
            detail,
          },
        ],
        grahas: l2 === l11 ? [l2] : [l2, l11],
        polarity: "benefic",
      };
    },
  },
  {
    id: "vipareeta-raja-yoga",
    name: "Vipareeta Raja Yoga",
    kind: "yoga",
    domains: ["vyavasaya", "dhana", "ayu"],
    source: BPHS("chapter on the Vipareeta Raja yoga"),
    says: "advantage arriving through difficulty: the native gains where others would lose.",
    test: (ctx) => {
      const hits: { lord: GrahaId; from: number; to: number }[] = [];
      for (const b of DUSTHANA) {
        const lord = ctx.lordOf(b);
        const sits = ctx.bhavaOf(lord);
        if (DUSTHANA.includes(sits)) hits.push({ lord, from: b, to: sits });
      }
      if (!hits.length) return null;
      return {
        factors: hits.map((h) => ({
          label: `the ${h.from}th lord (${g(h.lord)}) sits in the ${h.to}th`,
          detail: `${r(ctx.chart.grahas[h.lord].rashi)}, ${ctx.states[h.lord].dignity}`,
        })),
        grahas: [...new Set(hits.map((h) => h.lord))],
        polarity: "mixed",
      };
    },
  },
  {
    id: "neecha-bhanga",
    name: "Neecha Bhanga",
    kind: "yoga",
    domains: ["swabhava"],
    source: BPHS("chapter on the cancellation of debilitation"),
    says: "the debilitation is lifted, and what looked like a weakness can become the source of the rise.",
    contested:
      "the texts give several cancellation conditions and lineages weight them differently. only the dispositor-in-kendra condition is checked here.",
    test: (ctx) => {
      const found: { graha: GrahaId; dispositor: GrahaId }[] = [];
      for (const id of Object.keys(ctx.chart.grahas) as GrahaId[]) {
        const st = ctx.states[id];
        if (st.dignity !== "neecha") continue;
        const dispositorBhava = ctx.bhavaOf(st.dispositor);
        if (KENDRA.includes(dispositorBhava)) {
          found.push({ graha: id, dispositor: st.dispositor });
        }
      }
      if (!found.length) return null;
      return {
        factors: found.map((f) => ({
          label: `${g(f.graha)} is debilitated but its dispositor ${g(f.dispositor)} sits in a kendra`,
          detail: `${g(f.graha)} in ${r(ctx.chart.grahas[f.graha].rashi)}, ${g(f.dispositor)} in bhava ${ctx.bhavaOf(f.dispositor)}`,
        })),
        grahas: found.flatMap((f) => [f.graha, f.dispositor]),
        polarity: "benefic",
      };
    },
  },
];

// ── doshas ────────────────────────────────────────────────────────────────────

const doshaRules: Rule[] = [
  {
    id: "kuja-dosha",
    name: "Kuja Dosha",
    kannada: "ಕುಜ ದೋಷ",
    kind: "dosha",
    domains: ["vivaha"],
    source: {
      text: "regional smarta and South Indian matching practice",
      short: "practice",
      chapter: "marriage matching",
      note: "this is not stated in this form in BPHS. it comes from later texts and from regional custom, and the bhava list itself varies by region.",
    },
    says: "friction in marriage. the customary remedy is matching against a chart carrying the same dosha.",
    contested:
      "Karnataka practice commonly counts the 1st, 2nd, 4th, 7th, 8th and 12th from the lagna. some lineages drop the 2nd, and many also check the same bhavas from Chandra and from Shukra. both extra reckonings are shown here rather than silently folded in.",
    test: (ctx) => {
      const HOUSES = [1, 2, 4, 7, 8, 12];
      const fromLagna = ctx.bhavaOf("kuja");
      if (!HOUSES.includes(fromLagna)) return null;
      const fromChandra = ctx.fromChandra("kuja");
      const shukraRashi = ctx.chart.grahas.shukra.rashi;
      const fromShukra =
        ((ctx.chart.grahas.kuja.rashi - shukraRashi + 12) % 12) + 1;
      return {
        factors: [
          {
            label: `Kuja occupies the ${fromLagna}th from the lagna`,
            detail: r(ctx.chart.grahas.kuja.rashi),
          },
          {
            label: `from Chandra it is the ${fromChandra}th`,
            detail: HOUSES.includes(fromChandra)
              ? "also a dosha bhava under the Chandra reckoning"
              : "not a dosha bhava under the Chandra reckoning",
          },
          {
            label: `from Shukra it is the ${fromShukra}th`,
            detail: HOUSES.includes(fromShukra)
              ? "also a dosha bhava under the Shukra reckoning"
              : "not a dosha bhava under the Shukra reckoning",
          },
        ],
        grahas: ["kuja"],
        polarity: "malefic",
      };
    },
  },
];

export const RULES: Rule[] = [
  ...mahapurushaRules,
  ...chandraRules,
  ...structuralRules,
  ...doshaRules,
];
