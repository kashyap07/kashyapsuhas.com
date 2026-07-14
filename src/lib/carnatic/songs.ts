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
    detail: "adi tala varna by Ramanathapuram Srinivasa Iyengar",
    notation: `
      S' S' , S' | N D R' S' | N N D D | P M G M |
      P D N D | , R' S' N | D P M G | M P D N |
      S' R' G' R' | S' N S' R' | S' N R' S' | N D N D |
      N , , , | , , S' N | D P M G | M P D N |
      P , M G | N D , M | D P , M | G R S n |
      S R G M | , , G M | P G , M | N D N P |
      D N S' R' | , S' R' G' | S' R' G' R' | S' N D N |
      D G' R' S' | N D P N | D P M G | M P D N | , , ||
    `,
    sahitya: "vanajakshiro ee viraha morvane vasudevuni todi deve",
  },
  {
    slug: "chalamela",
    title: "Chalamela",
    kannada: "ಚಲಮೇಲ",
    homeMela: 29,
    homeRaga: "Shankarabharana",
    detail: "ata tala varna by Swati Tirunal",
    notation: `
      S' , N , | P , , M | G , R , | S , , , |
      , , d R | , , , R | S R G R | R G R S | , , , |
      n , , S | R G S , | S R G M | P D N S' |
      N , S' D | N P D N | R' N S' D | , , , ||
    `,
    sahitya: "chalamela jesevura sarasaku rara sami",
  },
];
