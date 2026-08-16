// what the grahas and bhavas actually signify.
//
// this is the vocabulary the interpretation layer was missing. "the 10th lord Surya
// sits in the 10th" is a true statement that means nothing to a reader; it becomes
// meaningful only once you know that Surya stands for authority and administration
// and that the 10th is the arena of work and public standing.
//
// karakatva is standard and well attested. the lists are deliberately short: a graha
// signifies dozens of things, and dumping all of them produces horoscope soup. these
// are the ones a Karnataka astrologer would actually reach for first.
import type { GrahaId } from "./types";

export type Karakatva = {
  /** one line on what this graha is, in plain words */
  nature: string;
  /** work and fields it points to */
  vocations: string[];
  /** what it lends to whatever it touches */
  qualities: string[];
  /** how its dasha tends to run, as lived rather than as doctrine */
  dasha: string;
};

export const KARAKATVA: Record<GrahaId, Karakatva> = {
  surya: {
    nature: "authority, the self, and whatever is done in plain view",
    vocations: [
      "government",
      "administration",
      "medicine",
      "positions of command",
    ],
    qualities: ["dignity", "visibility", "self-assertion"],
    dasha:
      "dealings with superiors and institutions come forward, and standing is either won or tested in public",
  },
  chandra: {
    nature: "the mind, the mother, and the public",
    vocations: [
      "work with people at scale",
      "hospitality",
      "nursing",
      "travel",
    ],
    qualities: ["adaptability", "feeling", "changeability"],
    dasha:
      "life is led by mood and by home; things move often, and the mind matters more than the plan",
  },
  kuja: {
    nature: "drive, conflict, land, and anything done with force",
    vocations: [
      "engineering",
      "surgery",
      "defence and police",
      "property",
      "machines",
    ],
    qualities: ["initiative", "competitiveness", "friction"],
    dasha:
      "things get pushed through by effort, with disputes and property matters close behind",
  },
  budha: {
    nature: "intellect, speech, and exchange",
    vocations: [
      "trade",
      "writing and teaching",
      "accounts and analysis",
      "software",
    ],
    qualities: ["analysis", "versatility", "quickness"],
    dasha:
      "many threads at once: study, paperwork, negotiation and short journeys",
  },
  guru: {
    nature: "wisdom, counsel, and growth",
    vocations: ["teaching", "law", "finance", "advisory work", "priesthood"],
    qualities: ["judgement", "ethics", "expansion"],
    dasha:
      "matters widen out: learning, children, money and the guidance of others",
  },
  shukra: {
    nature: "pleasure, refinement, and partnership",
    vocations: ["art and music", "design", "luxury goods", "vehicles", "media"],
    qualities: ["refinement", "diplomacy", "attraction"],
    dasha:
      "the comfortable years, when relationships, art and material ease come to the front",
  },
  shani: {
    nature: "labour, limitation, and whatever endures",
    vocations: [
      "service and long employment",
      "labour and the trades",
      "mining and oil",
      "agriculture",
    ],
    qualities: ["endurance", "delay", "responsibility"],
    dasha:
      "slow, effortful and heavy with duty; what is gained arrives late and tends to stay",
  },
  rahu: {
    nature: "hunger, foreignness, and the unconventional route",
    vocations: [
      "technology",
      "foreign dealings",
      "mass media",
      "anything newly invented",
    ],
    qualities: ["amplification", "ambition", "restlessness"],
    dasha:
      "sudden movement and unorthodox openings, strong but unsettled, and rarely by the expected path",
  },
  ketu: {
    nature: "detachment, and depth without interest in reward",
    vocations: ["research", "healing", "occult and spiritual work"],
    qualities: ["penetration", "withdrawal", "indifference"],
    dasha:
      "worldly aims lose their grip; attention turns inward, often after a loss of interest rather than a loss",
  },
};

export type BhavaSignification = {
  /** the arena, phrased to slot into "comes through ..." */
  arena: string;
  /** what the bhava covers */
  covers: string[];
};

export const BHAVA_SIGNIFIES: Record<number, BhavaSignification> = {
  1: {
    arena: "your own person and constitution",
    covers: ["body", "health", "how you come across"],
  },
  2: {
    arena: "family, savings and speech",
    covers: ["accumulated wealth", "family", "speech", "food"],
  },
  3: {
    arena: "your own effort and initiative",
    covers: ["siblings", "courage", "short travel", "communication"],
  },
  4: {
    arena: "home, land and schooling",
    covers: ["mother", "property", "vehicles", "peace of mind"],
  },
  5: {
    arena: "intelligence and creation",
    covers: ["children", "learning", "creativity", "past merit"],
  },
  6: {
    arena: "service, illness and competition",
    covers: ["disease", "debts", "enemies", "employment"],
  },
  7: {
    arena: "partnership and dealings with the public",
    covers: ["spouse", "business partners", "trade"],
  },
  8: {
    arena: "crisis, depth and what is hidden",
    covers: ["longevity", "inheritance", "research", "sudden turns"],
  },
  9: {
    arena: "fortune, dharma and higher learning",
    covers: ["father", "teachers", "long travel", "belief"],
  },
  10: {
    arena: "work and public standing",
    covers: ["profession", "status", "action in the world"],
  },
  11: {
    arena: "income, networks and gains",
    covers: ["earnings", "elder siblings", "circles you belong to"],
  },
  12: {
    arena: "expenditure, foreign places and solitude",
    covers: ["loss", "seclusion", "foreign residence", "moksha"],
  },
};

/** a short readable list: "a, b and c" */
export function joinWords(items: string[], max = 3): string {
  const list = items.slice(0, max);
  if (list.length <= 1) return list[0] ?? "";
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}
