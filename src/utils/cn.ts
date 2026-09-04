import { ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// the named font sizes from tailwind.config.ts. they have to be declared here
// or tailwind-merge cannot tell `text-label-sm` (a size) from `text-muted` (a
// colour): it files both under text-colour, decides they conflict, and keeps
// whichever came last. the symptom is a silently dropped font size, e.g.
// cn("text-label-sm", isActive ? "text-foreground" : "text-muted") rendering
// at the inherited size with no warning anywhere.
//
// keep this list in sync with theme.extend.fontSize.
const FONT_SIZES = [
  "display",
  "heading-xl",
  "heading-lg",
  "heading-md",
  "heading-sm",
  "body-lg",
  "label",
  "label-sm",
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: FONT_SIZES }],
    },
  },
});

export default function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
