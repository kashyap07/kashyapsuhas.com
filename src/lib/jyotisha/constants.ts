// traditional lookup tables. kannada/sanskrit naming throughout: kuja not mars,
// guru not jupiter, raja yoga not raj yoga.
import type { Bhava, GrahaId, Nakshatra, Rashi } from "./types";

export const RASHI_SPAN = 30; // degrees
export const NAKSHATRA_SPAN = 360 / 27; // 13 deg 20 min
export const PADA_SPAN = NAKSHATRA_SPAN / 4; // 3 deg 20 min

/**
 * `short` is for chart cells, where there is room for two or three letters.
 *
 * these are set explicitly rather than sliced from `name`, because Shukra and Shani
 * both start "Sh": slicing puts an identical label in two different rashis and the
 * chart silently stops being readable.
 */
export const GRAHA_NAMES: Record<
  GrahaId,
  { name: string; kannada: string; short: string }
> = {
  surya: { name: "Surya", kannada: "ಸೂರ್ಯ", short: "Su" },
  chandra: { name: "Chandra", kannada: "ಚಂದ್ರ", short: "Ch" },
  kuja: { name: "Kuja", kannada: "ಕುಜ", short: "Ku" },
  budha: { name: "Budha", kannada: "ಬುಧ", short: "Bu" },
  guru: { name: "Guru", kannada: "ಗುರು", short: "Gu" },
  shukra: { name: "Shukra", kannada: "ಶುಕ್ರ", short: "Sk" },
  shani: { name: "Shani", kannada: "ಶನಿ", short: "Sa" },
  rahu: { name: "Rahu", kannada: "ರಾಹು", short: "Ra" },
  ketu: { name: "Ketu", kannada: "ಕೇತು", short: "Ke" },
};

export const RASHIS: Rashi[] = [
  {
    index: 0,
    name: "Mesha",
    kannada: "ಮೇಷ",
    lord: "kuja",
    tattva: "agni",
    swabhava: "chara",
  },
  {
    index: 1,
    name: "Vrishabha",
    kannada: "ವೃಷಭ",
    lord: "shukra",
    tattva: "prithvi",
    swabhava: "sthira",
  },
  {
    index: 2,
    name: "Mithuna",
    kannada: "ಮಿಥುನ",
    lord: "budha",
    tattva: "vayu",
    swabhava: "dvisvabhava",
  },
  {
    index: 3,
    name: "Kataka",
    kannada: "ಕಟಕ",
    lord: "chandra",
    tattva: "jala",
    swabhava: "chara",
  },
  {
    index: 4,
    name: "Simha",
    kannada: "ಸಿಂಹ",
    lord: "surya",
    tattva: "agni",
    swabhava: "sthira",
  },
  {
    index: 5,
    name: "Kanya",
    kannada: "ಕನ್ಯಾ",
    lord: "budha",
    tattva: "prithvi",
    swabhava: "dvisvabhava",
  },
  {
    index: 6,
    name: "Tula",
    kannada: "ತುಲಾ",
    lord: "shukra",
    tattva: "vayu",
    swabhava: "chara",
  },
  {
    index: 7,
    name: "Vrishchika",
    kannada: "ವೃಶ್ಚಿಕ",
    lord: "kuja",
    tattva: "jala",
    swabhava: "sthira",
  },
  {
    index: 8,
    name: "Dhanu",
    kannada: "ಧನು",
    lord: "guru",
    tattva: "agni",
    swabhava: "dvisvabhava",
  },
  {
    index: 9,
    name: "Makara",
    kannada: "ಮಕರ",
    lord: "shani",
    tattva: "prithvi",
    swabhava: "chara",
  },
  {
    index: 10,
    name: "Kumbha",
    kannada: "ಕುಂಭ",
    lord: "shani",
    tattva: "vayu",
    swabhava: "sthira",
  },
  {
    index: 11,
    name: "Meena",
    kannada: "ಮೀನ",
    lord: "guru",
    tattva: "jala",
    swabhava: "dvisvabhava",
  },
];

// vimshottari lord order repeats every 9 nakshatras: ketu, shukra, surya, chandra,
// kuja, rahu, guru, shani, budha.
const NAKSHATRA_LORD_CYCLE: GrahaId[] = [
  "ketu",
  "shukra",
  "surya",
  "chandra",
  "kuja",
  "rahu",
  "guru",
  "shani",
  "budha",
];

const NAKSHATRA_NAMES: [string, string][] = [
  ["Ashwini", "ಅಶ್ವಿನಿ"],
  ["Bharani", "ಭರಣಿ"],
  ["Krittika", "ಕೃತ್ತಿಕಾ"],
  ["Rohini", "ರೋಹಿಣಿ"],
  ["Mrigashira", "ಮೃಗಶಿರ"],
  ["Ardra", "ಆರ್ದ್ರಾ"],
  ["Punarvasu", "ಪುನರ್ವಸು"],
  ["Pushya", "ಪುಷ್ಯ"],
  ["Ashlesha", "ಆಶ್ಲೇಷ"],
  ["Magha", "ಮಘಾ"],
  ["Purva Phalguni", "ಪೂರ್ವ ಫಾಲ್ಗುಣಿ"],
  ["Uttara Phalguni", "ಉತ್ತರ ಫಾಲ್ಗುಣಿ"],
  ["Hasta", "ಹಸ್ತ"],
  ["Chitra", "ಚಿತ್ರಾ"],
  ["Swati", "ಸ್ವಾತಿ"],
  ["Vishakha", "ವಿಶಾಖಾ"],
  ["Anuradha", "ಅನುರಾಧಾ"],
  ["Jyeshtha", "ಜ್ಯೇಷ್ಠಾ"],
  ["Moola", "ಮೂಲಾ"],
  ["Purvashadha", "ಪೂರ್ವಾಷಾಢಾ"],
  ["Uttarashadha", "ಉತ್ತರಾಷಾಢಾ"],
  ["Shravana", "ಶ್ರವಣ"],
  ["Dhanishta", "ಧನಿಷ್ಠಾ"],
  ["Shatabhisha", "ಶತಭಿಷಾ"],
  ["Purva Bhadrapada", "ಪೂರ್ವ ಭಾದ್ರಪದ"],
  ["Uttara Bhadrapada", "ಉತ್ತರ ಭಾದ್ರಪದ"],
  ["Revati", "ರೇವತಿ"],
];

export const NAKSHATRAS: Nakshatra[] = NAKSHATRA_NAMES.map(
  ([name, kannada], i) => ({
    index: i,
    name,
    kannada,
    lord: NAKSHATRA_LORD_CYCLE[i % 9],
  }),
);

export const BHAVAS: Bhava[] = [
  { index: 0, name: "Tanu", kannada: "ತನು" },
  { index: 1, name: "Dhana", kannada: "ಧನ" },
  { index: 2, name: "Sahaja", kannada: "ಸಹಜ" },
  { index: 3, name: "Bandhu", kannada: "ಬಂಧು" },
  { index: 4, name: "Putra", kannada: "ಪುತ್ರ" },
  { index: 5, name: "Ari", kannada: "ಅರಿ" },
  { index: 6, name: "Kalatra", kannada: "ಕಳತ್ರ" },
  { index: 7, name: "Ayu", kannada: "ಆಯು" },
  { index: 8, name: "Bhagya", kannada: "ಭಾಗ್ಯ" },
  { index: 9, name: "Karma", kannada: "ಕರ್ಮ" },
  { index: 10, name: "Labha", kannada: "ಲಾಭ" },
  { index: 11, name: "Vyaya", kannada: "ವ್ಯಯ" },
];

/** vimshottari mahadasha lengths in years. sums to 120. */
export const VIMSHOTTARI_YEARS: Record<GrahaId, number> = {
  ketu: 7,
  shukra: 20,
  surya: 6,
  chandra: 10,
  kuja: 7,
  rahu: 18,
  guru: 16,
  shani: 19,
  budha: 17,
};

/** the cycle order, starting from ketu. */
export const VIMSHOTTARI_ORDER: GrahaId[] = NAKSHATRA_LORD_CYCLE;
