export type Goodie = {
  name: string;
  description: string;
  href: string;
};

const goodies: Array<Goodie> = [
  {
    name: "Raagle",
    description: "a daily Mēḷakartā raaga guessing game",
    href: "goodies/raagle",
  },
  {
    name: "Dreamify",
    description: "dreamy wedding-photo look, meesho photoshop",
    href: "goodies/dreamify",
  },
  {
    name: "Image Compressor",
    description: "reduce image size by percentage",
    href: "goodies/image-compressor",
  },
  {
    name: "Image Converter",
    description: "convert image heic ↔ jpeg",
    href: "goodies/image-converter",
  },
  {
    name: "Background Remover",
    description: "remove image background entirely on your browser",
    href: "goodies/background-remover",
  },
  {
    name: "Panchanga",
    description: "sankalpa mantra elements",
    href: "goodies/panchanga",
  },
  {
    name: "Jaataka",
    description: "south indian birth chart, grahas, bhavas, vimshottari dasha",
    href: "goodies/jaataka",
  },
  {
    name: "Melakarta Ragas",
    description: "all 72 melakarta raagas: filter by swara, hear them",
    href: "goodies/melakarta-ragas",
  },
  {
    name: "Raga Radar",
    description: "[experimental] sing to detect raaga",
    href: "goodies/raga-radar",
  },
];

export default goodies;
