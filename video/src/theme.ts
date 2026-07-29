// Jetons Norma (Plato) - copiés depuis tailwind.config.js et
// src/components/social/CotisationsSection.js du prototype.
export const INK = '#292524';
export const INK2 = '#44403c';
export const MUTE = '#78716c';
export const FAINT = '#a8a29e';
export const LINE = '#e7e5e3';
export const PAPER = '#f8f7f5';
export const SUBTLE = '#fafaf9';
export const CANVAS = '#fafaf9';
export const CREAM = '#eeece6';
export const BRAND = '#b9703f';
export const RULE_RAIL = '#d6d3d1';
export const RESULT_TABLEAU_BG = '#eaf1ff';

export const ACCENT_NET = '#4a7256';
export const ACCENT_EMP = '#7A6244';
export const ACCENT_BG = '#F3EEE4';
export const ACCENT_BORDER = '#e3d8c2';

export const BADGE_TOKENS: Record<
  string,
  {bg: string; color: string; border?: string; dashed?: string}
> = {
  PIECE: {bg: '#EDF2FE', color: '#3B5BDB', border: '#cdd9f5'},
  TEXTE: {bg: '#EFEBFE', color: '#6D46C8', border: '#ddd3f6'},
  DECISION: {bg: '#E8F2EA', color: '#3F7350', border: '#c8dccd'},
  REFERENCE: {bg: '#F3EEE4', color: '#7A6244', border: '#ded1ba'},
  VALEUR: {bg: '#EEF1F5', color: '#52657D', border: '#d6dde5'},
  WEB: {bg: 'transparent', color: '#78716C', dashed: '#C9C4BE'},
};

export const MONO = "'IBM Plex Mono', monospace";
export const SERIF = "'Albra', Georgia, serif";

export const fmtEUR = (n: number) => `${n.toLocaleString('fr-FR')} €`;
