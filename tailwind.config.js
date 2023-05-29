/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pageComponents/**/*.{js,ts,jsx,tsx}',
    './layouts/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      height: {
        112: '28rem',
        'hamburger-menu': 'calc(100vh - 64px)',
      },
      inset: {
        '1p': '2%',
        '2p': '4%',
        '35vh': '35vh',
        'side-title': "calc(50% - (10 * theme('screens.xl')/19))",
      },
      padding: {
        '1p': '2%',
      },
      flex: {
        body: '1 0 auto',
      },
      spacing: {
        72: '18rem',
        84: '21rem',
        96: '24rem',
        '9/16': '56.25%',
        'fit-content': 'fit-content',
      },
      width: {
        'home-card': '800px',
      },
      minHeight: {
        minusHeader: 'calc(100vh - 64px)',
      },
      maxHeight: {
        igImagePreview: '48rem',
      },
      maxWidth: {
        wrapper: '72rem',
        prose: '680px',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
      },
      scale: {
        200: '2',
        250: '2.5',
      },
      lineHeight: {
        11: '2.75rem',
        12: '3rem',
        13: '3.25rem',
        14: '3.5rem',
      },
      fontFamily: {
        sans: ['Rubik', 'Montserrat', ...defaultTheme.fontFamily.sans],
        serif: ['Roboto Mono', 'Arvo', 'charter', ...defaultTheme.fontFamily.serif],
        fancy: ['Gochi Hand', ...defaultTheme.fontFamily.serif],
      },
      colors: {
        select: 'rgba(254,71,135,1)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        tertiary: 'var(--color-tertiary)',
        background: '#fff',
        hero: {
          splash: '#f3f4f5',
        },
        special: {
          teal: '#00dfd8',
          logo: {
            start: "theme('colors.secondary')",
            end: "theme('colors.primary')",
          },
        },
      },
      dropShadow: {
        'wave-seperator': '2px 12px 6px rgba(0,0,0,0.25)',
        '-wave-seperator': '10px -12px 6px rgba(0,0,0,0.15)',
      },
      outline: {
        container: '',
      },
      zIndex: {
        '-10': '-10',
      },
      typography: theme => ({
        DEFAULT: {
          css: {
            // h1: { color: theme("colors.primary") },
            // h2: { color: theme("colors.primary") },
            // h3: { color: theme("colors.primary") },
            // h4: { color: theme("colors.primary") },
            p: { fontWeight: 400 },
            iframe: { width: '100%' },
            a: {
              color: theme('colors.primary'),
              fontWeight: 700,
              textDecoration: 'none',
            },
            strong: {
              color: theme('colors.secondary'),
              fontWeight: 700,
              marginRight: '2px',
            },
          },
        },
      }),
    },
  },

  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),

    plugin(function ({ addComponents }) {
      const miscUtils = {
        '.position-unset': {
          position: 'unset',
        },
      };
      addComponents(miscUtils);
    }),

    plugin(function ({ addVariant }) {
      addVariant('children-iterative', '& *');
      addVariant('children', '& > *');
      addVariant('optional', '&:optional');
      addVariant('hocus', ['&:hover', '&:focus']);
      addVariant('supports-grid', '@supports (display: grid)');
    }),
  ],
  mode: 'jit',
};
