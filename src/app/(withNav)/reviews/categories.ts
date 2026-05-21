import {
  Book,
  Camera,
  Car,
  Compass,
  Cpu,
  Film,
  Gamepad2,
  type LucideIcon,
  MoreHorizontal,
  Utensils,
  Wrench,
} from "lucide-react";

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Media: Film,
  Tech: Cpu,
  Vehicles: Car,
  Games: Gamepad2,
  Restaurants: Utensils,
  Services: Wrench,
  Travel: Compass,
  Photo: Camera,
  Book: Book,
  Others: MoreHorizontal,
};

// palette avoids red/rose (clashes with "would not recommend" X)
// and green/emerald (clashes with "would recommend" check).
// each category gets a distinct hue.
export const CATEGORY_TEXT_COLOR_MAP: Record<string, string> = {
  Media: "text-indigo-700",
  Tech: "text-cyan-700",
  Vehicles: "text-slate-700",
  Games: "text-amber-700",
  Restaurants: "text-orange-700",
  Services: "text-violet-700",
  Travel: "text-sky-700",
  Photo: "text-teal-700",
  Book: "text-yellow-700",
  Others: "text-stone-700",
};

// very light category bg, for hero card tint on review detail page
export const CATEGORY_BG_COLOR_MAP: Record<string, string> = {
  Media: "bg-indigo-50",
  Tech: "bg-cyan-50",
  Vehicles: "bg-slate-50",
  Games: "bg-amber-50",
  Restaurants: "bg-orange-50",
  Services: "bg-violet-50",
  Travel: "bg-sky-50",
  Photo: "bg-teal-50",
  Book: "bg-yellow-50",
  Others: "bg-stone-50",
};

// saturated category bg, used for filled chips (filter buttons)
export const CATEGORY_FILL_BG_COLOR_MAP: Record<string, string> = {
  Media: "bg-indigo-700",
  Tech: "bg-cyan-700",
  Vehicles: "bg-slate-700",
  Games: "bg-amber-700",
  Restaurants: "bg-orange-700",
  Services: "bg-violet-700",
  Travel: "bg-sky-700",
  Photo: "bg-teal-700",
  Book: "bg-yellow-700",
  Others: "bg-stone-700",
};

export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICON_MAP[category] ?? MoreHorizontal;
}

export function getCategoryTextColor(category: string): string {
  return CATEGORY_TEXT_COLOR_MAP[category] ?? "text-stone-700";
}

export function getCategoryBgColor(category: string): string {
  return CATEGORY_BG_COLOR_MAP[category] ?? "bg-stone-50";
}
