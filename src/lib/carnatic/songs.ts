// varnam excerpts the game sings in the mystery raga. every excerpt must
// voice ri ga ma da ni at least once, or a slot becomes unguessable by ear
// (the coverage test enforces it). notation drafted from shivkumar.org
// transcriptions; octave placement is best-effort and awaits kashyap's ear.

export type Song = {
  slug: string;
  title: string;
  kannada: string;
  homeMela: number; // where the varnam actually lives, revealed at the end
  homeRaga: string;
  detail: string; // "ata tala varnam by ..."
  notation: string;
  sahitya: string; // display only, not synced to notes
};

export const SONGS: Song[] = [
  {
    slug: "vanajakshi",
    title: "Vanajakshi",
    kannada: "ವನಜಾಕ್ಷಿ",
    homeMela: 65,
    homeRaga: "Kalyani",
    detail: "ata tala varnam by Pallavi Gopala Iyer",
    notation: `
      S , n d | n S R G | P , M , | G , , R | R , , , |
      G M P G | R S n d | R S S , | R d G R | G P M R | , , , ||
    `,
    sahitya: "vanajakshi ninne kori yunnadira",
  },
  {
    slug: "chalamela",
    title: "Chalamela",
    kannada: "ಚಲಮೇಲ",
    homeMela: 29,
    homeRaga: "Shankarabharana",
    detail: "ata tala varnam by Swati Tirunal",
    notation: `
      S' , N , | P , , M | G , R , | S , , , |
      , , d R | , , , R | S R G R | R G R S | , , , ||
    `,
    sahitya: "chalamela jesevura sarasaku rara sami",
  },
];
