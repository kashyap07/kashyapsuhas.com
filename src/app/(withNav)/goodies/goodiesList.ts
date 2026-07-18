export type Goodie = {
  name: string;
  description: string;
  href: string;
};

const goodies: Array<Goodie> = [
  {
    name: "Dreamify",
    description: "dreamy wedding-photo look: brushed defocus + highlight bloom",
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
    name: "Melakarta Ragas",
    description: "all 72 melakarta ragas: filter by swara, hear them",
    href: "goodies/melakarta-ragas",
  },
  {
    name: "Raagle",
    description:
      "guess the myster melakarta raga hiding in a familiar tune, daily",
    href: "goodies/raagle",
  },
];

export default goodies;
