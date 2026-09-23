// Norma design system — single source of truth for tokens.
//
// Re-synced against Figma "Plato — System" (file 0eKtlRkT1Hbjh8Nqd47Woy):
//   • Colors        node 37373:4712  (Plato Theme documentation, 255 tokens)
//   • Typescale     node 35720:35541 (Typescale)
//   • Non-color     node 37383:2     (Plato Token documentation)
//
// Structure mirrors Figma's own layering so design->code maps 1:1:
//   primitives      raw scales (font size/weight/line-height/icon/radius + color ramps)
//   colors.semantic app-surface tokens (background, foreground, border, primary…)
//   colors.feedback destructive / success / warning / info / ai families
//   colors.accents  indigo / violet / emerald / sand / slate / stone + chart
//   colors.brand    brand orange set
//   colors.badge…   component-level maps kept for existing consumers
//
// Where the app had drifted from Figma, values below now follow Figma.

// ─────────────────────────────────────────────────────────────────────────
// PRIMITIVES — Plato "Token documentation" (node 37383:2)
// ─────────────────────────────────────────────────────────────────────────
export const primitives = {
  fontSize: {
    xs:   12, sm:  14, base: 16, lg:  18, xl:  20,
    '2xl':24, '3xl':30, '4xl':36, '5xl':48, '6xl':60,
    '7xl':72, '8xl':96, '9xl':128,
  },
  fontWeight: {
    thin: 100, extralight: 200, light: 300, normal: 400, medium: 500,
    semibold: 600, bold: 700, extrabold: 800, black: 900,
  },
  // Figma "leading-N" line-height scale (px)
  lineHeight: {
    3: 12, 4: 16, 5: 20, 6: 24, 7: 24, 8: 28, 9: 32, 10: 36, 11: 40,
  },
  iconSize: { xs: 12, sm: 14, md: 16, lg: 20, xl: 24 },
};

// ─────────────────────────────────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────────────────────────────────
const light = {
  // Semantic surface tokens — Figma "Plato Theme documentation" (light mode).
  // NOTE: `background` is now Figma cream/50 (#f8f7f5), not the old #fafaf9.
  semantic: {
    // Figma-named canonical tokens
    background:          '#f8f7f5', // cream/50 — default page background
    foreground:          '#292524', // stone/800 — primary text
    muted:               '#eeece6', // cream/100 — muted background
    mutedForeground:     '#78716c', // stone/500 — muted text
    card:                '#ffffff',
    cardForeground:      '#292524',
    popover:             '#ffffff',
    popoverForeground:   '#292524',
    border:              '#dfdcd9', // stone/200 assombri d'un demi-cran (contraste nav)
    borderStrong:        '#cbc7c4', // stone/300 assombri d'un demi-cran
    borderHover:         '#a8a29e', // stone/400
    input:               '#dfdcd9',
    ring:                '#292524',
    primary:             '#292524',
    primaryForeground:   '#ffffff',
    secondary:           '#eeece6', // cream/100
    secondaryForeground: '#44403c', // stone/700
    accent:              '#f8f7f5', // cream/50 — hover/focus accent
    accentForeground:    '#292524',
    white:               '#ffffff',

    // Legacy aliases kept so existing consumers keep resolving.
    foregroundSecondary:  '#78716c',
    foregroundMuted:      '#a8a29e',
    foregroundTertiary:   '#44403c',
    foregroundQuaternary: '#57534e',
    borderAlt:            '#dfdcda',
    backgroundCanvas:     '#f8f7f5',
    backgroundHover:      '#f8f7f5',
    backgroundSubtle:     '#f5f5f4',
    cream:                '#eeece6',
    // Ajoutés pour que tailwind.config référence des tokens (theme-aware en dark).
    foregroundStrong:     '#1c1917', // stone/900 — texte fort
    borderSubtle:         '#f0efed', // divider très léger
  },

  // Feedback families — each: base / foreground / subtle / border / text.
  // Values from Figma DESTRUCTIVE / SUCCESS / WARNING / INFO / AI sections.
  feedback: {
    destructive: { base: '#991b1b', foreground: '#ffffff', subtle: '#f2e3e3', border: '#dbc7c7', text: '#7f1d1d' },
    success:     { base: '#059669', foreground: '#ffffff', subtle: '#e3f2ee', border: '#c7dbd6', text: '#064e3b' },
    warning:     { base: '#bd6c1a', foreground: '#ffffff', subtle: '#f2ebe3', border: '#dbd1c7', text: '#855b31' },
    info:        { base: '#5593ea', foreground: '#ffffff', subtle: '#e3e7f2', border: '#c7ccdb', text: '#1e3a8a', bg: '#eef3fa' },
    ai:          { base: '#9333ea', foreground: '#ffffff', subtle: '#ebe3f2', border: '#d2c7db', text: '#581c87' },
  },

  // Accent families — Figma INDIGO / VIOLET / EMERALD / SAND / SLATE / STONE.
  // Same shape as feedback (base / foreground / subtle / border / text).
  accents: {
    indigo:  { base: '#3b5bdb', foreground: '#ffffff', subtle: '#e3e6f2', border: '#c7cbdb', text: '#2143cc' },
    violet:  { base: '#6d46c8', foreground: '#ffffff', subtle: '#e8e3f2', border: '#cdc7db', text: '#5931b4' },
    emerald: { base: '#3f7350', foreground: '#ffffff', subtle: '#e3f2e8', border: '#c7dbce', text: '#346344' },
    sand:    { base: '#7a6244', foreground: '#ffffff', subtle: '#f2ebe3', border: '#dbd2c7', text: '#695339' },
    slate:   { base: '#52657d', foreground: '#ffffff', subtle: '#e3eaf2', border: '#c7d0db', text: '#45566b' },
    stone:   { base: '#78716c', foreground: '#ffffff', subtle: '#edeae9', border: '#d5d0cd', text: '#66605c' },
    // ochre / meadow : promus depuis des valeurs récurrentes hors palette (mission hex→0,
    // §6 DECISIONS-HEX, validées steward le 22/09/2026). Valeur unique, multi-propriété
    // (color / bg / border). Pas de ramp subtle/border/text inventée : une seule teinte réelle.
    ochre:   '#b9703f', // surtitres/accents chauds — ex-#b9703f ×61 (JP, App)
    meadow:  '#4a9168', // vert marketing connecteurs — ex-#4a9168 ×23
  },

  // Cream ramp (crans relevés hors semantic.cream #eeece6 = cream/100) —
  // promus le 23/09/2026 sur validation steward (« do what's recommended ») :
  // cream/200 + cream/900 (palette CREAM d'IVAvatar, set 36533:7967),
  // cream/400 (filet du bloc « Apport » de JPListing, nœud 2219:19197).
  cream: {
    200: '#dbd7cd',
    400: '#ac9e8b',
    900: '#50443e',
  },

  // Identités de documents — l'icône « fichier PDF » rouge des rangées de
  // tables (ActRow, RowDocuments, RowPostTP, DocIcon partagé…). Promu le
  // 23/09/2026 : la valeur servait via banner.error.accent (sémantiquement
  // étirée). Une identité de format, pas un feedback destructif.
  doc: {
    pdf: '#dc2626',
  },

  // Chart series — Figma CHART (blue ramp).
  chart: ['#8fc6ff', '#297eff', '#155dfc', '#1447e6', '#193cb8'],

  // Brand — « Vif atténué » #f47a2c. Orange de DÉTAIL (surtitres, glow, liseré
  // actif, icônes) - jamais un aplat plein. Deux familles : full + darker
  // (liens / texte, contraste AA sur blanc).
  brand: {
    DEFAULT:          '#f47a2c',
    foreground:       '#ffffff',
    subtle:           '#fff1e6',
    subtleForeground: '#b8560f',
    border:           '#f9c79b',
    mutedForeground:  '#b8560f',   // alias hérité → darker
    darker: {
      DEFAULT:          '#b8560f',
      foreground:       '#ffffff',
      subtle:           '#fbeadd',
      subtleForeground: '#8f430c',
      border:           '#e7b184',
    },
  },

  // Badge variants — subtle tints re-aligned to Figma feedback families.
  badge: {
    default:           { bg: '#292524', fg: '#ffffff' },
    secondary:         { bg: '#eeece6', fg: '#44403c' },
    outline:           { bg: 'transparent', border: '#dfdcd9', fg: '#292524' },
    destructive:       { bg: '#991b1b', fg: '#ffffff' },
    destructiveSubtle: { bg: '#f2e3e3', fg: '#7f1d1d' },
    ai:                { bg: '#ebe3f2', fg: '#581c87' },
    success:           { bg: '#e3f2ee', fg: '#064e3b' },
    info:              { bg: '#e3e7f2', fg: '#1e3a8a' },
    warning:           { bg: '#f2ebe3', fg: '#855b31' },
  },

  // Banner accents — app-specific gradients (not defined in the Figma color doc).
  banner: {
    ai:      { accent: '#9333ea', accentHover: '#7e22ce', bgFrom: '#faf5ff', border: '#e9d5ff' },
    info:    { accent: '#2563eb', accentHover: '#1d4ed8', bgFrom: '#eff6ff', border: '#bfdbfe' },
    success: { accent: '#059669', accentHover: '#047857', bgFrom: '#ecfdf5', border: '#a7f3d0' },
    warning: { accent: '#d97706', accentHover: '#b45309', bgFrom: '#fffbeb', border: '#fde68a' },
    error:   { accent: '#dc2626', accentHover: '#b91c1c', bgFrom: '#fef2f2', border: '#fecaca' },
    neutral: { accent: '#57534e', accentHover: '#44403c', bgFrom: '#fafaf9', border: '#dfdcda' },
  },

  // Reasoning step colors — sourced from src/components/ReasoningStepper.js
  step: {
    default:   { icon: '#a8a29e', bg: 'transparent', text: '#78716c' },
    green:     { icon: '#059669', bg: '#cce6d9',     text: '#064e3b' },
    orange:    { icon: '#bd6c1a', bg: '#f9ecd6',     text: '#855b31' },
    red:       { icon: '#991b1b', bg: '#fef2f2',     text: '#7f1d1d' },
    muted:     '#a8a29e',
    primary:   '#44403c',
    secondary: '#78716c',
  },

  // Piece type tags — sourced from src/App.js PIECE_TYPE_COLORS
  piece: {
    expertise:      { bg: '#dfe8f5', fg: '#1e3a8a' },
    decision:       { bg: '#ede9fe', fg: '#5b21b6' },
    revenus:        { bg: '#dcfce7', fg: '#166534' },
    factures:       { bg: '#f9ecd6', fg: '#855b31' },
    medical:        { bg: '#dbeafe', fg: '#1e40af' },
    correspondance: { bg: '#eeece6', fg: '#44403c' },
    administratif:  { bg: '#f1f5f9', fg: '#475569' },
  },

  // Avatar palette — sourced from src/App.js VI_AVATAR_PALETTE.
  // `purple` (index 6) ajouté le 23/09/2026 : la paire purple/100 - ai-text du
  // set IVAvatar Figma (36533:7967), qui n'avait pas d'équivalent exact
  // (ai.subtle #ebe3f2 en était l'approximation). Ajout en FIN de liste :
  // les index existants ne bougent pas.
  avatar: [
    { name: 'green',  bg: '#cce6d9', fill: '#064E3B' },
    { name: 'blue',   bg: '#dbeafe', fill: '#1e3a8a' },
    { name: 'plum',   bg: '#ece0eb', fill: '#581c87' },
    { name: 'orange', bg: '#efdec4', fill: '#78350f' },
    { name: 'rose',   bg: '#ffe4e6', fill: '#881337' },
    { name: 'cream',  bg: '#eeece6', fill: '#44403c' },
    { name: 'purple', bg: '#f3e8ff', fill: '#581c87' },
  ],

  // AlertDialog icon colors — sourced from src/components/AlertDialog.js ICON_COLORS
  icon: {
    default:     '#44403c',
    destructive: '#7f1d1d',
    warning:     '#855b31',
    success:     '#065f46',
    info:        '#1e3a8a',
  },

  // Diff/action colors — sourced from src/App.js ROW_DIFF_COLORS
  diff: {
    add:    '#059669',
    edit:   '#bd6c1a',
    delete: '#991b1b',
  },

  // Composer « Chat Input » — Figma node 1081:50926. Fonds teintés du bandeau
  // système qui ENVELOPPE la carte blanche (analyse / limite quota / quota
  // atteint) + cream/500 pour l'en-tête mono « USER ASK ».
  composer: {
    processingBg: '#e5e3da',
    warningBg:    '#ecdbc9',
    blockedBg:    '#e5d4d2',
    askHeader:    '#9c8973', // cream/500
  },

  // DropZone (« Drop Doc ») — Figma node 35747:41445 (Plato---System).
  // Teintes bleu pâle de l'état extraction ; l'alpha (bordure 50%, dégradé
  // 60%) est appliqué en code via color-mix.
  dropzone: {
    extractionBorder: '#aabcd5',
    extractionTint:   '#dfe8f5',
  },
};

// ─────────────────────────────────────────────────────────────────────────
// DARK MODE — dérivé du thème light (warm stone), contraste AA vérifié sur les
// paires texte/fond critiques (voir docs/dark-mode.md). Seuls les tokens qui
// changent sont listés ; le reste hérite du light via deepMerge. Ce set est
// une DÉRIVATION cohérente, pas un relevé Figma (le dark n'est pas documenté
// dans les Variables Figma accessibles — cf. docs/figma-theme-releve.md §2).
// ─────────────────────────────────────────────────────────────────────────
const darkOverrides = {
  semantic: {
    background:          '#1a1917', // warm near-black
    foreground:          '#f2f0ee', // warm near-white — 15.8:1 sur background
    muted:               '#262320',
    mutedForeground:     '#a8a29e', // 6.1:1 sur background
    card:                '#211f1d',
    cardForeground:      '#f2f0ee',
    popover:             '#262320',
    popoverForeground:   '#f2f0ee',
    border:              '#383430',
    borderStrong:        '#4a453f',
    borderHover:         '#605a52',
    input:               '#383430',
    ring:                '#e7e5e3',
    primary:             '#f2f0ee', // en dark, primaire = clair (boutons clairs)
    primaryForeground:   '#1a1917',
    secondary:           '#2d2a26',
    secondaryForeground: '#e7e5e3',
    accent:              '#2d2a26',
    accentForeground:    '#f2f0ee',
    white:               '#211f1d', // « white » = surface → carte sombre en dark
    foregroundSecondary:  '#a8a29e',
    foregroundMuted:      '#78716c',
    foregroundTertiary:   '#d6d3d1',
    foregroundQuaternary: '#c3bfba',
    foregroundStrong:     '#ffffff',
    borderAlt:            '#383430',
    borderSubtle:         '#262320',
    backgroundCanvas:     '#1a1917',
    backgroundHover:      '#242120',
    backgroundSubtle:     '#211f1d',
    cream:                '#262320',
  },
  feedback: {
    destructive: { base: '#dc2626', subtle: '#2a1a1a', border: '#5c3434', text: '#f8b4b4' },
    success:     { base: '#10b981', subtle: '#16241f', border: '#2f5347', text: '#86efac' },
    warning:     { base: '#e08640', subtle: '#2a2016', border: '#574a34', text: '#f0c088' },
    info:        {                  subtle: '#1a2030', border: '#35415c', text: '#a9c4f5', bg: '#161d2b' },
    ai:          { base: '#a855f7', subtle: '#241a2e', border: '#4a3a5c', text: '#d8b4fe' },
  },
  accents: {
    indigo:  { subtle: '#1c2030', border: '#39406b', text: '#a9b6f5' },
    violet:  { subtle: '#241d33', border: '#4a3d6b', text: '#c9b6f0' },
    emerald: { subtle: '#16241d', border: '#2f5340', text: '#8fd0a5' },
    sand:    { subtle: '#241f18', border: '#544a38', text: '#d3bd9a' },
    slate:   { subtle: '#1a2028', border: '#3a4658', text: '#aebccd' },
    stone:   { subtle: '#26231f', border: '#4a453f', text: '#c3bcb5' },
    // ochre/meadow : valeur unique, gardée (assez lisible sur fond sombre)
  },
  brand: {
    subtle:           '#2a1c10',
    subtleForeground: '#f4a06a',
    border:           '#5c3a1c',
    darker: { subtle: '#241a10', subtleForeground: '#e7b184', border: '#5c4020' },
  },
  badge: {
    default:           { bg: '#f2f0ee', fg: '#1a1917' },
    secondary:         { bg: '#2d2a26', fg: '#e7e5e3' },
    outline:           { border: '#383430', fg: '#f2f0ee' },
    destructiveSubtle: { bg: '#2a1a1a', fg: '#f8b4b4' },
    ai:                { bg: '#241a2e', fg: '#d8b4fe' },
    success:           { bg: '#16241f', fg: '#86efac' },
    info:              { bg: '#161d2b', fg: '#a9c4f5' },
    warning:           { bg: '#2a2016', fg: '#f0c088' },
  },
  step: {
    default:   { icon: '#78716c', text: '#a8a29e' },
    green:     { bg: '#16241f', text: '#86efac' },
    orange:    { bg: '#2a2016', text: '#f0c088' },
    red:       { bg: '#2a1a1a', text: '#f8b4b4' },
    primary:   '#e7e5e3',
    secondary: '#a8a29e',
  },
  icon: {
    default: '#d6d3d1', destructive: '#f8b4b4', warning: '#f0c088', success: '#86efac', info: '#a9c4f5',
  },
  composer: {
    processingBg: '#26231f',
    warningBg:    '#2a2016',
    blockedBg:    '#2a1a1a',
    askHeader:    '#9c8973',
  },
  dropzone: {
    extractionBorder: '#35415c',
    extractionTint:   '#161d2b',
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Machinerie theme-aware. `colors` (l'API consommée partout) renvoie des
// références `var(--token, #fallbackLight)` : les styles inline ET les classes
// Tailwind (qui référencent les mêmes vars) basculent sous `.dark` sans qu'on
// touche aux fichiers consommateurs. Le hex reste ici (palette/paletteDark),
// lu par ds-doctor et injecté en CSS par src/design-system/theme.js.
// ─────────────────────────────────────────────────────────────────────────
const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;
const deepMerge = (base, over) => {
  if (over === undefined) return base;
  if (Array.isArray(base)) return base.map((v, i) => deepMerge(v, over[i]));
  if (base && typeof base === 'object') {
    const out = { ...base };
    for (const k of Object.keys(over)) out[k] = deepMerge(base[k], over[k]);
    return out;
  }
  return over;
};
const varName = (path) => '--' + path.join('-');
const flatten = (obj, path = [], out = {}) => {
  if (Array.isArray(obj)) obj.forEach((v, i) => flatten(v, [...path, i], out));
  else if (obj && typeof obj === 'object') Object.keys(obj).forEach((k) => flatten(obj[k], [...path, k], out));
  else if (typeof obj === 'string' && HEX_RE.test(obj)) out[varName(path)] = obj;
  return out;
};
const toVars = (obj, path = []) => {
  if (Array.isArray(obj)) return obj.map((v, i) => toVars(v, [...path, i]));
  if (obj && typeof obj === 'object') {
    const o = {};
    for (const k of Object.keys(obj)) o[k] = toVars(obj[k], [...path, k]);
    return o;
  }
  if (typeof obj === 'string' && HEX_RE.test(obj)) return `var(${varName(path)}, ${obj})`;
  return obj;
};

// Raw hex trees — source de vérité (doctor + seed CSS). NE PAS consommer
// directement dans l'UI : passer par `colors` (theme-aware).
export const palette = light;
export const paletteDark = deepMerge(light, darkOverrides);
export const cssVarsLight = flatten(light);
export const cssVarsDark = flatten(paletteDark);

// API publique inchangée : `colors.semantic.foreground` → 'var(--semantic-foreground, #292524)'.
export const colors = toVars(light);

// ─────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY — Figma "Typescale" (node 35720:35541)
// ─────────────────────────────────────────────────────────────────────────
export const typography = {
  fontFamily: {
    sans:  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    serif: "'RL Para Trial Central', 'Albra', Georgia, serif",
    mono:  "'IBM Plex Mono', monospace",
  },
  scale: {
    // family: serif = RL Para Trial Central, sans = Inter, mono = IBM Plex Mono
    'display-lg':         { family: 'serif', size: 30, lineHeight: 28, letterSpacing: -0.6, weight: 400 },
    // display-sm / display-xs : re-relevés le 23/09 sur les nœuds validés
    // (Niveau3Strip 37447:5922, PanelHeader 37375:8738, TopBar 37443:5796) -
    // display-sm = titre d'objet serif 20/28, display-xs = titre/valeur serif 16/20.
    'display-sm':         { family: 'serif', size: 20, lineHeight: 28, letterSpacing: -0.6, weight: 500 },
    'display-xs':         { family: 'serif', size: 16, lineHeight: 20, letterSpacing: -0.5, weight: 500 },
    'heading-xl':         { family: 'sans',  size: 24, lineHeight: 28, letterSpacing: -0.6, weight: 600 },
    'heading-xl-medium':  { family: 'sans',  size: 24, lineHeight: 32, letterSpacing: -0.6, weight: 500 },
    'heading-lg':         { family: 'sans',  size: 20, lineHeight: 28, letterSpacing: -0.6, weight: 600 },
    'heading-lg-medium':  { family: 'sans',  size: 20, lineHeight: 28, letterSpacing: -0.6, weight: 500 },
    'heading-md':         { family: 'sans',  size: 18, lineHeight: 28, letterSpacing: 0,    weight: 600 },
    'heading-md-medium':  { family: 'sans',  size: 18, lineHeight: 28, letterSpacing: 0,    weight: 500 },
    'heading-sm':         { family: 'sans',  size: 16, lineHeight: 24, letterSpacing: 0,    weight: 600 },
    'heading-sm-medium':  { family: 'sans',  size: 16, lineHeight: 24, letterSpacing: 0,    weight: 500 },
    'body':               { family: 'sans',  size: 14, lineHeight: 20, letterSpacing: 0,    weight: 400 },
    'body-medium':        { family: 'sans',  size: 14, lineHeight: 20, letterSpacing: 0,    weight: 500 },
    // caption/normal in Figma carries letterSpacing 1; kept at 0.12 pending a
    // visual check across the app (see re-sync notes). caption/medium = 0.
    'caption':            { family: 'sans',  size: 12, lineHeight: 16, letterSpacing: 0.12, weight: 400 },
    'caption-medium':     { family: 'sans',  size: 12, lineHeight: 16, letterSpacing: 0,    weight: 500 },
    // detail: Inter Medium 12/18 — tertiary text, tooltips, help text.
    'detail':             { family: 'sans',  size: 12, lineHeight: 18, letterSpacing: 0,    weight: 500 },
    'counter':            { family: 'sans',  size: 10, lineHeight: 'normal', letterSpacing: 0, weight: 500 },
    // header-cols: IBM Plex Mono Medium 11 — table/column header labels.
    'caption-header-cols':{ family: 'mono',  size: 11, lineHeight: 'normal', letterSpacing: 0, weight: 500 },
  },
};

// Style CSS prêt à poser depuis une entrée de l'échelle — LA façon de rendre
// un style typographique nommé (jamais de fontSize/letterSpacing recopiés à la
// main : « typeStyle('display-sm') » au lieu de « serif 20 -0.6 » inline).
export function typeStyle(name) {
  const s = typography.scale[name];
  if (!s) return {};
  return {
    fontFamily: typography.fontFamily[s.family],
    fontSize: s.size,
    lineHeight: s.lineHeight === 'normal' ? 'normal' : `${s.lineHeight}px`,
    letterSpacing: s.letterSpacing ? `${s.letterSpacing}px` : undefined,
    fontWeight: s.weight,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// SPACING — observed values across src/index.css and inline styles.
// ─────────────────────────────────────────────────────────────────────────
export const spacing = {
  '0.5': '2px',
  '1':   '4px',
  '1.25':'5px',
  '1.5': '6px',
  '1.75':'7px',
  '2':   '8px',
  '2.5': '10px',
  '3':   '12px',
  '3.5': '14px',
  '4':   '16px',
  '5':   '20px',
};

// ─────────────────────────────────────────────────────────────────────────
// BORDER RADIUS — Figma base --radius = 12; rounded-full = 9999.
// ─────────────────────────────────────────────────────────────────────────
export const radius = {
  sm:   '4px',    // is-highlighted
  xs:   '5px',    // is-zone-highlighted
  md:   '6px',    // badge label, banner-minimal button
  lg:   '8px',    // banner button primary
  xl:   '12px',   // banner / card (Figma --radius)
  full: '9999px', // badge number / icon-only (pill)
};

// ─────────────────────────────────────────────────────────────────────────
// SHADOWS — src/index.css banner button + glow pulse; `xs` matches Figma.
// ─────────────────────────────────────────────────────────────────────────
export const shadows = {
  // ── Échelle Figma (shadows/2xs → 3xl) — LA source des élévations. Exposée
  // en classes Tailwind (tailwind.config.js boxShadow) : shadow-2xs … shadow-3xl.
  // Jamais de chaîne box-shadow inline : token (style) ou classe (className).
  '2xs':             '0px 1px 1px rgba(26,26,26,0.05)',
  xs:                '0 1px 2px rgba(26,26,26,0.05)',
  sm:                '0px 1px 4px -1px rgba(26,26,26,0.05), 0px 1px 2px -1px rgba(26,26,26,0.05)',
  // shadows/xl (2 couches) — l'élévation de la carte du composer.
  xl:                '0px 8px 10px -1px rgba(26,26,26,0.05), 0px 4px 6px -4px rgba(26,26,26,0.05)',
  // shadows/3xl (relevé Previewer 37375:8866) — drawers / panneaux détachés.
  '3xl':             '0px 8px 17px rgba(0,0,0,0.03), 0px 30px 30px rgba(0,0,0,0.03), 0px 68px 41px rgba(0,0,0,0.02)',
  bannerButton:      '0 1px 2px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05), inset 0 -1px 2px rgba(0,0,0,0.04)',
  bannerButtonHover: '0 2px 6px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06), inset 0 -1px 2px rgba(0,0,0,0.04)',
  glowPulseStart:    '0 0 8px rgba(99, 102, 241, 0.3)',
  glowPulseEnd:      '0 0 20px rgba(99, 102, 241, 0.5)',
};

// ─────────────────────────────────────────────────────────────────────────
// MOTION — durations + named animations from src/index.css
// ─────────────────────────────────────────────────────────────────────────
export const motion = {
  duration: {
    instant: '100ms',
    fast:    '150ms',
    base:    '250ms',
    slow:    '350ms',
    slower:  '600ms',
    pulse:   '2000ms',
    spinSlow:'2500ms',
    gradient:'3000ms',
  },
  easing: {
    standard: 'ease',
    out:      'ease-out',
    inOut:    'ease-in-out',
    bounce:   'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    linear:   'linear',
  },
  animation: {
    shimmer:               { duration: '1.5s',  easing: 'ease-in-out' },
    bounceIn:              { duration: '0.4s',  easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
    fadeSlideUp:           { duration: '0.35s', easing: 'ease-out' },
    spinSlow:              { duration: '2.5s',  easing: 'linear' },
    fadeIn:                { duration: '0.2s',  easing: 'ease-out' },
    gradientShift:         { duration: '3s',    easing: 'ease' },
    pulseScale:            { duration: '2s',    easing: 'ease-in-out' },
    glowPulse:             { duration: '2s',    easing: 'ease-in-out' },
    slideInRight:          { duration: '0.25s', easing: 'ease-out' },
    highlightFade:         { duration: '3s',    easing: 'ease-out' },
    diffAccepted:          { duration: '0.6s',  easing: 'ease-out' },
    diffRejected:          { duration: '0.6s',  easing: 'ease-out' },
    stepSlideIn:           { duration: '0.25s', easing: 'ease-out' },
    reasoningChildExpand:  { duration: '0.2s',  easing: 'ease-out' },
  },
};

const tokens = { primitives, colors, typography, spacing, radius, shadows, motion };
export default tokens;
