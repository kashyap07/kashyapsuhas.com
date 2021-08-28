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
        primary: "#2ba5d4",
        secondary: "#d42ba5",
        tertiary: "#a5d42b",
        gray: {
          50: "hsl(220, 12%, 93%)",
          75: "hsl(220, 12%, 95%)",
          100: "hsl(220, 12%, 90%)",
          200: "hsl(220, 12%, 80%)",
          300: "hsl(220, 12%, 70%)",
          400: "hsl(220, 12%, 60%)",
          500: "hsl(220, 12%, 50%)",
          600: "hsl(220, 12%, 40%)",
          700: "hsl(220, 12%, 30%)",
          800: "hsl(220, 12%, 20%)",
          900: "hsl(220, 12%, 12%)",
        },
        background: "#fff",
        hero: {
          splash: "#f3f4f5",
        },
        special: {
          teal: "#00dfd8",
          logo: {
            start: "theme('colors.secondary')",
            end: "theme('colors.primary')",
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
    },
  },
  variants: {
    typography: ["dark"],
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
