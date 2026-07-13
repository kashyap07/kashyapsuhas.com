import type { PlayableNote } from "./audio";
import { SA_HZ, SVARAS, SvaraId, svaraFreq } from "./pitches";

export type Melakarta = {
  n: number; // 1 to 72
  slug: string;
  name: string;
  kannada: string;
  chakra: number; // 1 to 12
  scale: SvaraId[]; // s r g m p d n
};

export const CHAKRAS: { name: string; kannada: string }[] = [
  { name: "Indu", kannada: "ಇಂದು" },
  { name: "Netra", kannada: "ನೇತ್ರ" },
  { name: "Agni", kannada: "ಅಗ್ನಿ" },
  { name: "Veda", kannada: "ವೇದ" },
  { name: "Bana", kannada: "ಬಾಣ" },
  { name: "Rutu", kannada: "ಋತು" },
  { name: "Rishi", kannada: "ಋಷಿ" },
  { name: "Vasu", kannada: "ವಸು" },
  { name: "Brahma", kannada: "ಬ್ರಹ್ಮ" },
  { name: "Disi", kannada: "ದಿಶಿ" },
  { name: "Rudra", kannada: "ರುದ್ರ" },
  { name: "Aditya", kannada: "ಆದಿತ್ಯ" },
];

const NAMES: [string, string][] = [
  ["Kanakangi", "ಕನಕಾಂಗಿ"],
  ["Ratnangi", "ರತ್ನಾಂಗಿ"],
  ["Ganamurti", "ಗಾನಮೂರ್ತಿ"],
  ["Vanaspati", "ವನಸ್ಪತಿ"],
  ["Manavati", "ಮಾನವತಿ"],
  ["Tanarupi", "ತಾನರೂಪಿ"],
  ["Senavati", "ಸೇನಾವತಿ"],
  ["Hanumatodi", "ಹನುಮತೋಡಿ"],
  ["Dhenuka", "ಧೇನುಕ"],
  ["Natakapriya", "ನಾಟಕಪ್ರಿಯ"],
  ["Kokilapriya", "ಕೋಕಿಲಪ್ರಿಯ"],
  ["Rupavati", "ರೂಪವತಿ"],
  ["Gayakapriya", "ಗಾಯಕಪ್ರಿಯ"],
  ["Vakulabharana", "ವಕುಳಾಭರಣ"],
  ["Mayamalavagowla", "ಮಾಯಾಮಾಳವಗೌಳ"],
  ["Chakravaka", "ಚಕ್ರವಾಕ"],
  ["Suryakanta", "ಸೂರ್ಯಕಾಂತ"],
  ["Hatakambari", "ಹಾಟಕಾಂಬರಿ"],
  ["Jhankaradhwani", "ಝಂಕಾರಧ್ವನಿ"],
  ["Natabhairavi", "ನಟಭೈರವಿ"],
  ["Keeravani", "ಕೀರವಾಣಿ"],
  ["Kharaharapriya", "ಖರಹರಪ್ರಿಯ"],
  ["Gourimanohari", "ಗೌರಿಮನೋಹರಿ"],
  ["Varunapriya", "ವರುಣಪ್ರಿಯ"],
  ["Mararanjani", "ಮಾರರಂಜನಿ"],
  ["Charukesi", "ಚಾರುಕೇಶಿ"],
  ["Sarasangi", "ಸಾರಸಾಂಗಿ"],
  ["Harikambhoji", "ಹರಿಕಾಂಭೋಜಿ"],
  ["Dheerashankarabharana", "ಧೀರಶಂಕರಾಭರಣ"],
  ["Naganandini", "ನಾಗನಂದಿನಿ"],
  ["Yagapriya", "ಯಾಗಪ್ರಿಯ"],
  ["Ragavardhini", "ರಾಗವರ್ಧಿನಿ"],
  ["Gangeyabhushani", "ಗಾಂಗೇಯಭೂಷಣಿ"],
  ["Vagadheeswari", "ವಾಗಧೀಶ್ವರಿ"],
  ["Shulini", "ಶೂಲಿನಿ"],
  ["Chalanata", "ಚಲನಾಟ"],
  ["Salaga", "ಸಾಲಗ"],
  ["Jalarnava", "ಜಲಾರ್ಣವ"],
  ["Jhalavarali", "ಝಾಲವರಾಳಿ"],
  ["Navaneeta", "ನವನೀತ"],
  ["Pavani", "ಪಾವನಿ"],
  ["Raghupriya", "ರಘುಪ್ರಿಯ"],
  ["Gavambodhi", "ಗವಾಂಬೋಧಿ"],
  ["Bhavapriya", "ಭವಪ್ರಿಯ"],
  ["Shubhapantuvarali", "ಶುಭಪಂತುವರಾಳಿ"],
  ["Shadvidamargini", "ಷಡ್ವಿಧಮಾರ್ಗಿಣಿ"],
  ["Suvarnangi", "ಸುವರ್ಣಾಂಗಿ"],
  ["Divyamani", "ದಿವ್ಯಮಣಿ"],
  ["Dhavalambari", "ಧವಳಾಂಬರಿ"],
  ["Namanarayani", "ನಾಮನಾರಾಯಣಿ"],
  ["Kamavardhini", "ಕಾಮವರ್ಧಿನಿ"],
  ["Ramapriya", "ರಾಮಪ್ರಿಯ"],
  ["Gamanashrama", "ಗಮನಾಶ್ರಮ"],
  ["Vishwambari", "ವಿಶ್ವಂಭರಿ"],
  ["Shamalangi", "ಶ್ಯಾಮಲಾಂಗಿ"],
  ["Shanmukhapriya", "ಷಣ್ಮುಖಪ್ರಿಯ"],
  ["Simhendramadhyama", "ಸಿಂಹೇಂದ್ರಮಧ್ಯಮ"],
  ["Hemavati", "ಹೇಮವತಿ"],
  ["Dharmavati", "ಧರ್ಮವತಿ"],
  ["Neetimati", "ನೀತಿಮತಿ"],
  ["Kantamani", "ಕಾಂತಾಮಣಿ"],
  ["Rishabhapriya", "ಋಷಭಪ್ರಿಯ"],
  ["Latangi", "ಲತಾಂಗಿ"],
  ["Vachaspati", "ವಾಚಸ್ಪತಿ"],
  ["Mechakalyani", "ಮೇಚಕಲ್ಯಾಣಿ"],
  ["Chitrambari", "ಚಿತ್ರಾಂಬರಿ"],
  ["Sucharitra", "ಸುಚರಿತ್ರ"],
  ["Jyotiswarupini", "ಜ್ಯೋತಿಸ್ವರೂಪಿಣಿ"],
  ["Dhatuvardhini", "ಧಾತುವರ್ಧಿನಿ"],
  ["Nasikabhushani", "ನಾಸಿಕಾಭೂಷಣಿ"],
  ["Kosala", "ಕೋಸಲ"],
  ["Rasikapriya", "ರಸಿಕಪ್ರಿಯ"],
];

// the melakarta scheme is a formula: chakra position fixes ri and ga,
// position within the chakra fixes da and ni, first half ma1, second ma2
const RG: [SvaraId, SvaraId][] = [
  ["R1", "G1"],
  ["R1", "G2"],
  ["R1", "G3"],
  ["R2", "G2"],
  ["R2", "G3"],
  ["R3", "G3"],
];
const DN: [SvaraId, SvaraId][] = [
  ["D1", "N1"],
  ["D1", "N2"],
  ["D1", "N3"],
  ["D2", "N2"],
  ["D2", "N3"],
  ["D3", "N3"],
];

export const MELAKARTAS: Melakarta[] = NAMES.map(([name, kannada], idx) => {
  const h = idx % 36;
  const [r, g] = RG[Math.floor(h / 6)];
  const [d, n] = DN[h % 6];
  return {
    n: idx + 1,
    slug: name.toLowerCase(),
    name,
    kannada,
    chakra: Math.floor(idx / 6) + 1,
    scale: ["S", r, g, idx < 36 ? "M1" : "M2", "P", d, n],
  };
});

export type SeqNote = { id: SvaraId; octave: number };

// s r g m p d n ṡ up, then back down
export function arohaAvaroha(m: Melakarta): SeqNote[] {
  const up: SeqNote[] = [
    ...m.scale.map((id) => ({ id, octave: 0 })),
    { id: "S", octave: 1 },
  ];
  return [...up, ...[...up].reverse()];
}

export function arohaAvarohaPlayable(
  m: Melakarta,
  saHz = SA_HZ,
): PlayableNote[] {
  const seq = arohaAvaroha(m);
  const half = seq.length / 2;
  return seq.map((s, i) => ({
    freq: svaraFreq(s.id, s.octave, saHz),
    // linger on the top sa, settle long on the final sa
    beats: i === half - 1 ? 1.5 : i === seq.length - 1 ? 3 : 1,
    restBefore: i === half ? 0.5 : 0,
    idx: i,
  }));
}

// pitch positions a raga occupies, for reverse lookup
export function melaSemitones(m: Melakarta): number[] {
  return m.scale.map((id) => SVARAS[id].semitone);
}
