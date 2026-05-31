export type Tool = {
  name: string;
  description: string;
  href: string;
};

const tools: Array<Tool> = [
  {
    name: "Image Compressor",
    description: "reduce image size by percentage",
    href: "tools/image-compressor",
  },
  {
    name: "Image Converter",
    description: "convert image heic ↔ jpeg",
    href: "tools/image-converter",
  },
  {
    name: "Background Remover",
    description: "remove image background entirely on your browser",
    href: "tools/background-remover",
  },
  {
    name: "Panchanga",
    description: "sankalpa mantra elements",
    href: "tools/panchanga",
  },
];

export default tools;
