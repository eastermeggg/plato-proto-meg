// Jetons Norma (Plato) - copiés depuis tailwind.config.js et
// src/components/ui-kit/import/atoms.js du prototype (lab /ui-kit/import-dossier).
export const INK = '#292524';
export const INK2 = '#44403c';
export const MUTE = '#78716c';
export const FAINT = '#a8a29e';
export const LINE = '#e7e5e3';
export const LINE_SOFT = '#f0eeeb';
export const PAPER = '#f8f7f5';
export const CANVAS = '#fafaf9';
export const CREAM = '#eeece6';
export const WHITE = '#ffffff';

// Accents du lab import/sync - mêmes couleurs, mêmes emplacements partout.
export const SUIVI = '#4a9168'; // pastille « Suivi »
export const SUIVI_BG = '#e4efe8'; // pill verte (Sera découpé, Déjà suivi)
export const SUIVI_TXT = '#3d7a57';
export const NOUVEAU_BG = '#dfe8f5'; // badge « Nouveau » + compteurs
export const NOUVEAU_TXT = '#1e3a8a';
export const MAILBLUE = '#1e3a8a'; // icône email / dossier Outlook
export const DOCRED = '#b4483c'; // icône document
export const WARN_BG = '#fdf6ea';
export const WARN_TXT = '#855b31';

export const MONO = "'IBM Plex Mono', monospace";
export const SERIF = "'Albra', Georgia, serif";

export const cardChrome = {
  border: `1px solid ${LINE}`,
  borderRadius: 12,
  background: WHITE,
} as const;

export const softShadow =
  '0px 1px 2px 0px rgba(26,26,26,0.05), 0px 1px 1px 0px rgba(26,26,26,0.05)';
