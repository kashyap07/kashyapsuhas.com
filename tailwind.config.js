const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");
const { trueGray, blueGray } = require("tailwindcss/colors");

module.exports = {
  mode: "jit",
  purge: [
    "./pages/**/*.js",
    "./components/**/*.js",
    "./layouts/**/*.js",
    "./lib/**/*.js",
  ],
  darkMode: "class",
  theme: {
    extend: {
      height: {
        112: "28rem",
        "hamburger-menu": "calc(100vh - 64px)",
      },
      inset: {
        "1p": "2%",
        "2p": "4%",
        "35vh": "35vh",
        "side-title": "calc(50% - (10 * theme('screens.xl')/19))",
      },
      padding: {
        "1p": "2%",
      },
      flex: {
        body: "1 0 auto",
      },
      spacing: {
        72: "18rem",
        84: "21rem",
        96: "24rem",
        "9/16": "56.25%",
        "fit-content": "fit-content",
      },
      width: {
        "home-card": "800px",
      },
      minHeight: {
        minusHeader: "calc(100vh - 64px)",
      },
      maxHeight: {
        igImagePreview: "48rem",
      },
      maxWidth: {
        wrapper: "68rem",
        prose: "680px",
        "1/4": "25%",
        "1/2": "50%",
        "3/4": "75%",
      },
      scale: {
        200: "2",
        250: "2.5",
      },
      lineHeight: {
        11: "2.75rem",
        12: "3rem",
        13: "3.25rem",
        14: "3.5rem",
      },
      fontFamily: {
        sans: ["Montserrat", ...defaultTheme.fontFamily.sans],
        fancy: ["Gochi Hand", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // triadic colors from https://www.canva.com/colors/color-wheel/
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        tertiary: "var(--color-tertiary)",
        gray: {
          50: "hsl(220, 20%, 93%)",
          75: "hsl(220, 20%, 95%)",
          100: "hsl(220, 20%, 90%)",
          200: "hsl(220, 20%, 80%)",
          300: "hsl(220, 20%, 70%)",
          400: "hsl(220, 20%, 60%)",
          500: "hsl(220, 20%, 50%)",
          600: "hsl(220, 20%, 40%)",
          700: "hsl(220, 20%, 30%)",
          800: "hsl(220, 20%, 20%)",
          900: "hsl(220, 20%, 8%)",
        },
        background: "#fff",
        hero: {
          splash: "#f3f4f5",
        },
        special: {
          teal: "#00dfd8",
          logo: {
            start: "#2ba5d4",
            end: "#FD5B61",
          },
        },
      },
      dropShadow: {
        "wave-seperator": "2px 12px 6px rgba(0,0,0,0.25)",
        "-wave-seperator": "10px -12px 6px rgba(0,0,0,0.15)",
      },
      outline: {
        container: "",
      },
      zIndex: {
        "-10": "-10",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            h1: { color: theme("colors.tertiary") },
            h2: { color: theme("colors.tertiary") },
            h3: { color: theme("colors.tertiary") },
            h4: { color: theme("colors.tertiary") },
            p: { fontWeight: 500 },
            iframe: { width: "100%" },
            a: { color: theme("colors.primary"), fontWeight: 700 },
          },
        },
        dark: {
          css: {
            color: theme("colors.gray.100"),
            hr: { borderColor: theme("colors.gray.800") },
            blockquote: {
              color: theme("colors.gray.300"),
              borderLeftColor: theme("colors.gray.800"),
            },
          },
        },
      }),
    },
  },
  variants: {
    extend: { typography: ["dark"] },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
