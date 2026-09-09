/** @type {import('tailwindcss').Config} */
// Named color tokens mirror src/design-system/tokens.js (the single source of
// truth), which is itself re-synced against Figma "Plato — System".
// Utility name -> hex maps 1:1 to the Figma theme so `text-foreground`,
// `bg-info-subtle`, `border-emerald-border`, etc. all resolve to Plato values.
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic foreground (tokens.semantic.foreground*)
        foreground: {
          DEFAULT: '#292524',   // stone/800
          secondary: '#78716c', // stone/500
          muted: '#a8a29e',     // stone/400
          tertiary: '#44403c',  // stone/700
          quaternary: '#57534e',
          strong: '#1c1917',
        },
        // Borders / dividers (tokens.semantic.border*)
        border: {
          DEFAULT: '#e7e5e3',   // stone/200
          alt: '#e7e5e4',
          strong: '#d6d3d1',    // stone/300
          hover: '#a8a29e',     // stone/400
          subtle: '#f0efed',
        },
        // Surfaces (tokens.semantic.background*) — Figma background = cream/50
        background: {
          DEFAULT: '#f8f7f5',   // cream/50 (was #fafaf9)
          canvas: '#f8f7f5',
          subtle: '#f5f5f4',
        },
        cream: '#eeece6',       // cream/100 — Figma "muted"/"secondary" surface
        // Primary / secondary / accent
        primary: {
          DEFAULT: '#292524',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#eeece6',
          foreground: '#44403c',
        },
        // Accents / links
        link: '#1e3a8a',

        // ── Feedback families (base / subtle / border / text) ──
        info: {
          DEFAULT: '#5593ea',   // Figma info (was #2563eb)
          subtle: '#e3e7f2',
          border: '#c7ccdb',
          text: '#1e3a8a',
          bg: '#eef3fa',
        },
        danger: {
          DEFAULT: '#991b1b',   // Figma destructive (red/800)
          subtle: '#f2e3e3',
          border: '#dbc7c7',
          text: '#7f1d1d',
        },
        success: {
          DEFAULT: '#059669',
          subtle: '#e3f2ee',
          border: '#c7dbd6',
          text: '#064e3b',
        },
        warning: {
          DEFAULT: '#bd6c1a',
          subtle: '#f2ebe3',
          border: '#dbd1c7',
          text: '#855b31',
        },
        ai: {
          DEFAULT: '#9333ea',   // purple/600
          subtle: '#ebe3f2',
          border: '#d2c7db',
          text: '#581c87',
        },

        // ── Brand (« Vif atténué » #f47a2c) ──
        // Orange réservé aux DÉTAILS : surtitres, points à glow, liseré actif,
        // icônes. Jamais un aplat plein de grande surface (effet « warning »).
        // Deux familles : full (accents) + darker (liens / texte, AA sur blanc).
        brand: {
          DEFAULT: '#f47a2c',
          foreground: '#ffffff',
          subtle: '#fff1e6',
          'subtle-foreground': '#b8560f',
          border: '#f9c79b',
          muted: '#b8560f',            // alias hérité → darker (text-brand-muted)
          darker: {
            DEFAULT: '#b8560f',
            foreground: '#ffffff',
            subtle: '#fbeadd',
            'subtle-foreground': '#8f430c',
            border: '#e7b184',
          },
        },

        // ── Accent families (base / subtle / border / text) ──
        indigo: {
          DEFAULT: '#3b5bdb', subtle: '#e3e6f2', border: '#c7cbdb', text: '#2143cc',
        },
        violet: {
          DEFAULT: '#6d46c8', subtle: '#e8e3f2', border: '#cdc7db', text: '#5931b4',
        },
        emerald: {
          DEFAULT: '#3f7350', subtle: '#e3f2e8', border: '#c7dbce', text: '#346344',
        },
        sand: {
          DEFAULT: '#7a6244', subtle: '#f2ebe3', border: '#dbd2c7', text: '#695339',
        },
        slate: {
          DEFAULT: '#52657d', subtle: '#e3eaf2', border: '#c7d0db', text: '#45566b',
        },
        stone: {
          DEFAULT: '#78716c', subtle: '#edeae9', border: '#d5d0cd', text: '#66605c',
        },

        // ── Chart series (blue ramp) ──
        chart: {
          1: '#8fc6ff', 2: '#297eff', 3: '#155dfc', 4: '#1447e6', 5: '#193cb8',
        },
      },
    },
  },
  plugins: [],
}
