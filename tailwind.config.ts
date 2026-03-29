import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

// ─────────────────────────────────────────────────────────────────────────────
// design tokens
//
// COLORS
//   primitives  → background, foreground, columbiaYellow (css vars)
//   accent      → text-accent, bg-accent, border-accent (yellow, all interactions)
//   surfaces    → bg-surface, bg-surface-subtle, bg-surface-hover
//   text tiers  → text-foreground (black), text-secondary, text-muted, text-subtle
//   feedback    → text-danger / bg-danger, text-success / bg-success
//   borders     → border-line (standard), border-line-subtle (faint)
//   note: category badge colors (blue-100, teal-100 etc.) are intentional
//         data-driven colors, not ui chrome — leave them as-is
//
// TYPOGRAPHY (responsive pattern: text-{step} mobile → md:text-{step} desktop)
//   page titles:     text-heading-lg  → md:text-display
//   section titles:  text-heading-md  → md:text-heading-xl
//   subheadings:     text-heading-sm  → md:text-heading-md
//   list item titles:text-body-lg     → md:text-heading-sm
//   body:            text-base (tailwind default, ~16px)
//   metadata/tags:   text-label (14px) / text-label-sm (12px)
//
// SPACING (section-level rhythm)
//   gap-section-sm  → 48px — between related items within a section
//   gap-section-md  → 80px — between major page sections
//   pb-page-bottom  → standard page bottom padding (mb-12 md:mb-20 pattern)
//
// SHADOWS
//   shadow-macos  → the layered drop shadow on images/containers
//
// BORDER RADIUS  (3 values — keep it tight)
//   rounded      → 4px  default elements (buttons, inputs, badges)
//   rounded-lg   → 8px  cards, dialogs, containers
//   rounded-full → pill shapes, avatars
//
// OPACITY  (standardized 4 steps)
//   opacity-0   → invisible
//   opacity-50  → dimmed (disabled, overlays)
//   opacity-75  → subtle (hover states, secondary)
//   opacity-100 → full
//
// TRANSITIONS  (2 durations)
//   duration-100  → fast (button press feedback)
//   duration-200  → standard (hover color, opacity, transform)
// ─────────────────────────────────────────────────────────────────────────────

const config: Config = {
  darkMode: "selector",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // ── colors ─────────────────────────────────────────────────────────────
      colors: {
        // primitives — css var driven
        background: "var(--background)",
        foreground: "var(--foreground)",
        columbiaYellow: "var(--columbiaYellow)",

        // accent — all interactive elements, highlights, ctas
        accent: "var(--columbiaYellow)",

        // surfaces — backgrounds
        surface: {
          DEFAULT: "var(--background)",         // bg-surface
          subtle: "#f9fafb",                    // bg-surface-subtle (gray-50)
          hover: "rgb(249 250 251 / 0.5)",      // bg-surface-hover (gray-50/50, row hovers)
        },

        // text hierarchy — use these instead of raw gray-{n}
        secondary: "#4b5563",                   // text-secondary (gray-600)
        muted: "#6b7280",                       // text-muted (gray-500)
        subtle: "#9ca3af",                      // text-subtle (gray-400, placeholders)

        // feedback states
        danger: "#dc2626",                      // text-danger, bg-danger (red-600)
        success: "#16a34a",                     // text-success, bg-success (green-600)

        // borders
        line: "#e5e7eb",                        // border-line (gray-200, standard divider)
        "line-subtle": "#f3f4f6",               // border-line-subtle (gray-100, faint)
      },

      // ── typography ─────────────────────────────────────────────────────────
      fontSize: {
        display: ["5rem", { lineHeight: "1", fontWeight: "500" }],              // 80px
        "heading-xl": ["3.75rem", { lineHeight: "1", fontWeight: "500" }],     // 60px
        "heading-lg": ["3rem", { lineHeight: "1.1", fontWeight: "500" }],      // 48px
        "heading-md": ["2.25rem", { lineHeight: "1.2", fontWeight: "500" }],   // 36px
        "heading-sm": ["1.875rem", { lineHeight: "1.3", fontWeight: "500" }],  // 30px
        "body-lg": ["1.3rem", { lineHeight: "1.4" }],                          // 21px — list item titles (mobile)
        label: ["0.875rem", { lineHeight: "1.5" }],                            // 14px
        "label-sm": ["0.75rem", { lineHeight: "1.5" }],                        // 12px
      },

      // ── spacing ────────────────────────────────────────────────────────────
      spacing: {
        "section-sm": "3rem",     // 48px — between related items (mb-12 equivalent)
        "section-md": "5rem",     // 80px — between page sections (mb-20 equivalent)
        "page-bottom": "5rem",    // standard page bottom padding
      },

      // ── shadows ────────────────────────────────────────────────────────────
      boxShadow: {
        macos: "0px 10px 30px rgba(0, 0, 0, 0.2), 0px 4px 6px rgba(0, 0, 0, 0.1)",
      },

      // ── transitions ────────────────────────────────────────────────────────
      // duration-100 = fast press feedback
      // duration-200 = standard hover/color transition (default)

      dropShadow: {},
      screens: {
        xs: "320px",
      },
    },
  },
  plugins: [
    typography,
    plugin(function ({ addVariant }) {
      addVariant("children-iterative", "& *");
      addVariant("children", "& > *");
      addVariant("optional", "&:optional");
      addVariant("hocus", ["&:hover", "&:focus"]);
      addVariant("supports-grid", "@supports (display: grid)");
    }),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "text-shadow": (value) => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") },
      );
    }),
    require("tailwindcss-motion"),
  ],
};
export default config;
