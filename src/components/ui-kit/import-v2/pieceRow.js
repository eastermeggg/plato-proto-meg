// Primitives partagées de l'import V2, calées AU PIXEL sur les planches Figma
// 3278-36997 (« Import / Inbox / * » + « Import / Bordereau / * ») :
// - une COULEUR par nature (folder vert · mail muet · PJ bleu · découpe violette)
// - Badge (états : Ajouté vert · Nouveau indigo · partiel/inclus secondaire ·
//   Erreur destructive · Doublon warning)
// - SmallBtn : LE bouton 26px des rangées (primaire sombre · secondaire crème ·
//   outline blanc · destructif subtil · ai subtil)
// - HoverReveal : le voile dégradé qui pose le bouton au survol d'une rangée.

import React from 'react';
import { FileText, FolderOpen, Mail, Paperclip } from 'lucide-react';

// Teintes calées sur les planches Figma, mais exprimées en var() theme-aware
// (fallback = teinte light d'origine). En dark, les --semantic-* / --feedback-* /
// --accents-* basculent → tout le bordereau suit sans toucher chaque style.
export const V2 = {
  foreground: 'var(--semantic-foreground, #292524)',
  muted: 'var(--semantic-mutedForeground, #78716c)',
  border: 'var(--semantic-border, #dfdcd9)',
  accent: 'var(--semantic-background, #f8f7f5)',
  secondary: 'var(--semantic-secondary, #eeece6)',
  secondaryText: 'var(--semantic-secondaryForeground, #44403c)',
  folder: 'var(--accents-emerald-text, #065f46)',
  pj: 'var(--accents-indigo-text, #1e40af)',
  pjMini: 'var(--accents-indigo-text, #1e3a8a)',
  ai: 'var(--feedback-ai-text, #581c87)',
  aiIcon: 'var(--feedback-ai-base, #7e22ce)',
  aiSubtle: 'var(--feedback-ai-subtle, #ebe3f2)',
  indigo: 'var(--accents-indigo-base, #3b5bdb)',
  indigoSubtle: 'var(--accents-indigo-subtle, #e3e6f2)',
  indigoText: 'var(--accents-indigo-text, #2143cc)',
  successSubtle: 'var(--feedback-success-subtle, #e3f2ee)',
  successText: 'var(--feedback-success-text, #064e3b)',
  destructive: 'var(--feedback-destructive-base, #991b1b)',
  destructiveSubtle: 'var(--feedback-destructive-subtle, #f2e3e3)',
  destructiveText: 'var(--feedback-destructive-text, #7f1d1d)',
  warning: 'var(--feedback-warning-base, #bd6c1a)',
  warningSubtle: 'var(--feedback-warning-subtle, #f2ebe3)',
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

// Badge d'état (planche « Badge » shadcn) : px-6 py-2, rounded-6, texte 12 medium.
const BADGE_TONES = {
  success: { backgroundColor: V2.successSubtle, color: V2.successText },
  indigo: { backgroundColor: V2.indigoSubtle, color: V2.indigoText },
  secondary: { backgroundColor: V2.secondary, color: V2.secondaryText },
  destructive: { backgroundColor: V2.destructive, color: '#ffffff' },
  warning: { backgroundColor: V2.warningSubtle, color: V2.warningText },
  ai: { backgroundColor: V2.aiSubtle, color: V2.ai },
};
// `wide` : les badges Erreur / Doublon de la planche Flat Objects sont à px-8
// (vs px-6 pour les badges d'état courants).
export function Badge({ tone = 'secondary', wide = false, children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center ${wide ? 'px-2' : 'px-1.5'} py-0.5 rounded-md text-[12px] leading-4 font-medium whitespace-nowrap flex-shrink-0 ${className}`}
      style={BADGE_TONES[tone]}
    >
      {children}
    </span>
  );
}

// LE bouton 26px des rangées et chapeaux (h-26, px-8, py-5, rounded-4,
// icône 14, texte 12 medium) - toutes les variantes de la planche.
const BTN_VARIANTS = {
  primary: { backgroundColor: V2.foreground, color: V2.primaryForeground, boxShadow: '0 1px 1px rgba(26,26,26,0.05)' },
  secondary: { backgroundColor: V2.secondary, color: V2.secondaryText },
  outline: { backgroundColor: V2.card, color: V2.foreground, border: `1px solid ${V2.border}`, boxShadow: '0 1px 1px rgba(26,26,26,0.05)' },
  'destructive-subtle': { backgroundColor: V2.destructiveSubtle, color: V2.destructiveText },
  'ai-subtle': { backgroundColor: V2.aiSubtle, color: V2.ai },
};
export function SmallBtn({ variant = 'secondary', icon: Icon, children, onClick, title, className = '' }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className={`inline-flex items-center justify-center gap-1.5 h-[26px] px-2 rounded text-[12px] leading-4 font-medium transition-opacity hover:opacity-90 flex-shrink-0 ${className}`}
      style={BTN_VARIANTS[variant]}
      title={title}
    >
      {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2} />}
      {children}
    </button>
  );
}

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
