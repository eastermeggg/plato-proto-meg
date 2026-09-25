// Jetons Norma (Plato) - copiés depuis tailwind.config.js / src/design-system/tokens.js
// du prototype (surfaces Accueil + Mes conversations, lab /ui-kit/assistant).
export const INK = '#292524'; // stone/800 - texte primaire
export const INK2 = '#44403c'; // stone/700
export const MUTE = '#78716c'; // stone/500 - texte secondaire
export const FAINT = '#a8a29e'; // stone/400
export const LINE = '#e7e5e3'; // bordures douces
export const LINE_SOFT = '#f0eeeb';
export const PAPER = '#f8f7f5'; // cream/50 - fond de page
export const CANVAS = '#fafaf9';
export const CREAM = '#eeece6'; // cream/100
export const WHITE = '#ffffff';

// Accents marque (assistant) - halo du composer, eyebrow « Bonjour », liens.
export const BRAND = '#f47a2c'; // brand.DEFAULT - glow du composer
export const BRAND_DARK = '#b8560f'; // brand.darker - eyebrow, liens
export const FOCUS = '#c7ccdb'; // feedback.info.border - anneau de focus

// Surfaces du shell / tables produit.
export const NAV_BG = '#f8f7f5'; // rail
export const BORDER = '#dfdcd9'; // semantic.border (rangées, cartes produit)
export const BORDER_STRONG = '#cbc7c4';
export const TERTIARY_FG = '#44403c';

export const MONO = "'IBM Plex Mono', monospace";
export const SERIF = "'RL Para Trial Central', 'Albra', Georgia, serif";

export const cardChrome = {
  border: `1px solid ${LINE}`,
  borderRadius: 12,
  background: WHITE,
} as const;

export const softShadow =
  '0px 1px 2px 0px rgba(26,26,26,0.05), 0px 1px 1px 0px rgba(26,26,26,0.05)';
