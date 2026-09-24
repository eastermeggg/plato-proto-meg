// Atomes partagés de l'import V2, calés AU PIXEL sur les planches Figma
// 3278-36997 (« Import / Inbox / * » + « Import / Bordereau / * »).
// POURQUOI LOCAL (ds-promote 24/09/2026) : pas d'équivalent DS - V2 est la
// palette theme-aware des planches, HoverReveal un pattern de rangée (voile
// dégradé), MetaDot un micro-atome. Les badges d'état utilisent ui/Badge
// (l'ex-Badge locale, doublon de la primitive, a été résorbée).
// - une COULEUR par nature (folder vert · mail muet · PJ bleu · découpe violette)
// - HoverReveal : le voile dégradé qui pose le bouton au survol d'une rangée.
// L'ex-SmallBtn (bouton 26px des rangées) est résorbé dans ui/Button size=sm
// (variants destructive-subtle / ai-subtle ajoutés, steward 24/09/2026).

import React from 'react';
import { FileText, FolderOpen, Mail, Paperclip } from 'lucide-react';

// Teintes calées sur les planches Figma, mais exprimées en var() theme-aware
// (fallback = teinte light d'origine). En dark, les --semantic-* / --feedback-* /
// --accents-* basculent → tout le bordereau suit sans toucher chaque style.
export const V2 = {
  foreground: 'var(--semantic-foreground, #292524)',
  muted: 'var(--semantic-mutedForeground, #78716c)',
  accent: 'var(--semantic-background, #f8f7f5)',
  secondary: 'var(--semantic-secondary, #eeece6)',
  secondaryText: 'var(--semantic-secondaryForeground, #44403c)',
  // Folder VERT : Figma #065f46 (planches Inbox/Folder) = token icon.success.
  // ARBITRAGE 24/09 (délégué, board /ui-kit/arbitrages) : le master bordereau
  // peint le dossier du header collapsible en BLEU (fill blue/500) - REFUSÉ.
  // Écart Figma assumé : une couleur par nature (dossier vert · mail encre ·
  // PJ bleu · découpe violette) ; un dossier bleu entrerait en collision avec
  // le bleu PJ des mêmes rangées, et blue/500 n'a aucune famille de tokens.
  // Conflit interne au Figma (l'inbox du même fichier dit vert) : le code fait foi.
  folder: 'var(--icon-success, #065f46)',
  // PJ / trombone : Figma #1e3a8a (Body PJs + méta des threads) = feedback.info.text.
  pj: 'var(--feedback-info-text, #1e3a8a)',
  pjMini: 'var(--feedback-info-text, #1e3a8a)',
  ai: 'var(--feedback-ai-text, #581c87)',
  aiIcon: 'var(--feedback-ai-base, #7e22ce)',
  aiSubtle: 'var(--feedback-ai-subtle, #ebe3f2)',
  indigo: 'var(--accents-indigo-base, #3b5bdb)',
  destructiveSubtle: 'var(--feedback-destructive-subtle, #f2e3e3)',
  destructiveText: 'var(--feedback-destructive-text, #7f1d1d)',
  warning: 'var(--feedback-warning-base, #bd6c1a)',
  warningText: 'var(--feedback-warning-text, #855b31)',
  hoverFade: 'var(--semantic-background, #f7f6f3)',
  // Carte (rangées) : « white » theme-aware → carte sombre en dark.
  card: 'var(--semantic-card, #ffffff)',
  primaryForeground: 'var(--semantic-primaryForeground, #ffffff)',
  // Planche « Import / Bordereau / Flat Objects » (3336:35060) : l'icône mail
  // des corps est AMBRE (#d97706 = banner.warning.accent) et le document PDF
  // est ROUGE identité doc (Figma #ef4444, mappé sur le token doc.pdf le plus
  // proche). Références var() theme-aware, fallback light.
  mailBody: 'var(--banner-warning-accent, #d97706)',
  docRed: 'var(--doc-pdf, #dc2626)',
};

export const kindIcon = (kind) =>
  kind === 'folder' ? FolderOpen
    : (kind === 'thread' || kind === 'body') ? Mail
      : kind === 'pj' ? Paperclip
        : FileText;

// Dossier = vert émeraude · échange/corps = encre muette · PJ/fichier = bleu.
export const KIND_COLORS = {
  folder: V2.folder,
  thread: V2.muted,
  body: V2.muted,
  pj: V2.pj,
  file: V2.pj,
};
export const kindColor = (kind) => KIND_COLORS[kind] || V2.muted;

// Voile de survol (planche Threads/Folder « Hover ») : dégradé transparent →
// #f7f6f3 posé au bord droit, le bouton flotte dessus - la rangée garde toute
// sa largeur pour son contenu.
export function HoverReveal({ children, className = '' }) {
  return (
    <div
      className={`absolute inset-y-px right-px flex items-center justify-end pr-3 pl-16 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus-within:opacity-100 focus-within:pointer-events-auto transition-opacity ${className}`}
      style={{ background: `linear-gradient(to right, rgba(247,246,243,0) 0%, ${V2.hoverFade} 38%)` }}
    >
      {children}
    </div>
  );
}

// Le point séparateur des lignes méta (carré 3px tourné à 45°, opacité 50).
export function MetaDot() {
  return (
    <span className="flex items-center justify-center flex-shrink-0" style={{ width: 4.24, height: 4.24 }} aria-hidden>
      <span className="rotate-45 block" style={{ width: 3, height: 3, backgroundColor: V2.muted, opacity: 0.5 }} />
    </span>
  );
}
