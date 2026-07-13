/** @type {import('tailwindcss').Config} */
// Named color tokens mirror src/design-system/tokens.js (the single source of
// truth). Values are kept identical to the hex literals they replace so that
// migrating `text-[#292524]` -> `text-foreground` is a pure, visual-noop rename.
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic foreground (tokens.semantic.foreground*)
        foreground: {
          DEFAULT: '#292524',
          secondary: '#78716c',
          muted: '#a8a29e',
          tertiary: '#44403c',
          quaternary: '#57534e',
          strong: '#1c1917',
        },
        // Borders / dividers (tokens.semantic.border*)
        border: {
          DEFAULT: '#e7e5e3',
          alt: '#e7e5e4',
          strong: '#d6d3d1',
          subtle: '#f0efed',
        },
        // Surfaces (tokens.semantic.background*)
        background: {
          DEFAULT: '#fafaf9',
          canvas: '#f8f7f5',
          subtle: '#f5f5f4',
        },
        cream: '#eeece6',
        // Accents / links
        link: '#1e3a8a',
        info: {
          DEFAULT: '#2563eb',
          subtle: '#dfe8f5',
          bg: '#eef3fa',
        },
        danger: {
          DEFAULT: '#991b1b',
          subtle: '#fef2f2',
          border: '#fecaca',
        },
        brand: '#b9703f',
      },
    },
  },
  plugins: [],
}
