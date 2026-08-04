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

// Teintes EXACTES des exports Figma (strokes échantillonnés sur les SVG).
export const V2 = {
  foreground: '#292524',
  muted: '#78716c',
  border: '#e7e5e3',
  accent: '#f8f7f5',
  secondary: '#eeece6',
  secondaryText: '#44403c',
  folder: '#065f46',
  pj: '#1e40af',
  pjMini: '#1e3a8a',
  ai: '#581c87',
  aiIcon: '#7e22ce',
  aiSubtle: '#ebe3f2',
  indigo: '#3b5bdb',
  indigoSubtle: '#e3e6f2',
  indigoText: '#2143cc',
  successSubtle: '#e3f2ee',
  successText: '#064e3b',
  destructive: '#991b1b',
  destructiveSubtle: '#f2e3e3',
  destructiveText: '#7f1d1d',
  warning: '#bd6c1a',
  warningSubtle: '#f2ebe3',
  warningText: '#855b31',
  hoverFade: '#f7f6f3',
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
export function Badge({ tone = 'secondary', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[12px] leading-4 font-medium whitespace-nowrap flex-shrink-0 ${className}`}
      style={BADGE_TONES[tone]}
    >
      {children}
    </span>
  );
}

// LE bouton 26px des rangées et chapeaux (h-26, px-8, py-5, rounded-4,
// icône 14, texte 12 medium) - toutes les variantes de la planche.
const BTN_VARIANTS = {
  primary: { backgroundColor: V2.foreground, color: '#ffffff', boxShadow: '0 1px 1px rgba(26,26,26,0.05)' },
  secondary: { backgroundColor: V2.secondary, color: V2.secondaryText },
  outline: { backgroundColor: '#ffffff', color: V2.foreground, border: `1px solid ${V2.border}`, boxShadow: '0 1px 1px rgba(26,26,26,0.05)' },
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
