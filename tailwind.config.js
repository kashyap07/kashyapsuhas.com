const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");
const { trueGray } = require("tailwindcss/colors");

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
        "9/16": "56.25%",
      },
      width: {
        "fit-content": "fit-content",
        "home-card": "800px",
      },
      minHeight: {
        minusHeader: "calc(100vh - 120px)",
      },
      maxWidth: {
        wrapper: "64rem",
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
        primary: "#0080ff",
        secondary: "#ff0080",
        tertiary: "#7928ca",
        // grays based on hsl(220, 12%, 93%)
        gray: {
          50: "#f1f2f4",
          75: "#ebecef",
          100: "#e0e3eb",
          200: "#e3e4e8",
          300: "#d5d7dd",
          400: "#c6c9d2",
          500: "#aaaebb",
          600: "#9ca1b0",
          700: "#808699",
          800: "#666c7f",
          900: "#4f5463",
        },
        // gray: trueGray,
        background: "#fff",
        code: {
          green: "#b5f4a5",
          yellow: "#ffe484",
          purple: "#d9a9ff",
          red: "#ff8383",
          blue: "#93ddfd",
          white: "#fff",
        },
        logo: {
          start: "#7928ca",
          end: "#ff0080",
        },
        hero: {
          splash: "#f3f4f5",
        },
        special: {
          teal: "#00dfd8",
        },
        zIndex: {
          60: "60",
          70: "70",
        },
      },
      dropShadow: {
        "wave-seperator": "2px 12px 6px rgba(0,0,0,0.25)",
        "-wave-seperator": "10px -12px 6px rgba(0,0,0,0.15)",
      },
      outline: {
        container: "",
      },
    },
  },
  variants: {
    typography: ["dark"],
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
