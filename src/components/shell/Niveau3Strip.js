import React from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { colors, typeStyle } from '../../design-system/tokens';

// ── Strip objet niveau 3 (behaviour map §1.4) ──────────────────────────────
// Pixel-perfect sur Figma « Navigation / Context bar » (Plato---System
// 37447:5922). L'objet (poste, acte, liste d'actes, pièces, JP) EST l'en-tête
// de page : bande fond background, filet bas, padding 16, posée sous les
// onglets du dossier. Cinq kinds dans le nœud - tous composés des mêmes
// briques :
//
//   Post       retour nommé ↵ CodeBadge + StripTitle | StripAmount ─ action
//   ActLevel   StripTitle | action primaire (une ligne)
//   Act        retour nommé ↵ StripTitle | tabs + actions
//   Documents  recherche | actions (une ligne)
//   JP         StripTitle | action primaire (une ligne)
//
//   Niveau3Strip      la bande - deux lignes quand `back` est fourni (retour
//                     au-dessus, contenu en dessous, gap 10px), une ligne
//                     centrée sinon. `justify="between"` ou `"start"`.
//   BreadcrumbReturn  le retour NOMMÉ - flèche 12 + libellé 12 medium
//                     muted-foreground (hover foreground). Unique retour du cran.
//   StripTitle        titre serif 20, tracking -0.6, leading 28.
//   StripAmount       montant serif 16, tracking -0.5 (droite du kind Post).
//   SiblingNav        précédent / suivant parmi les frères + « n / N » mono 11.
//   CodeBadge         badge code fond muted, 12 medium secondary-foreground, r-6.
//   StripDivider      filet vertical 1x16 (Default) / 1x18 (tall, avant
//                     l'action primaire), couleur border.

export function Niveau3Strip({ justify = 'between', back = null, children }) {
  if (back) {
    return (
      <div className="flex-shrink-0 bg-background border-b border-border p-4">
        {back}
        <div className={`mt-2.5 flex items-center gap-3 ${justify === 'between' ? 'justify-between' : ''}`}>
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex-shrink-0 bg-background border-b border-border p-4">
      <div className={`flex items-center gap-3 ${justify === 'between' ? 'justify-between' : ''}`}>
        {children}
      </div>
    </div>
  );
}

// Retour nommé (Figma « Retour ») : flèche 12 + libellé 12 medium
// muted-foreground - tout le groupe est la cible, hover → foreground.
export function BreadcrumbReturn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 flex-shrink-0"
      title={label}
      aria-label={label}
    >
      <ArrowLeft className="w-3 h-3 text-foreground-secondary group-hover:text-foreground transition-colors" strokeWidth={1.75} />
      <span className="text-[12px] leading-4 font-medium text-foreground-secondary group-hover:text-foreground transition-colors whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

// Titre serif de l'objet (token typo « display-sm » : serif 20/28, -0.6).
export function StripTitle({ children, className = '' }) {
  return (
    <span className={`text-foreground truncate ${className}`} style={typeStyle('display-sm')}>
      {children}
    </span>
  );
}

// Montant serif (token typo « display-xs » : serif 16/20, -0.5) - la valeur à
// droite du kind Post.
export function StripAmount({ children, className = '' }) {
  return (
    <span className={`text-foreground flex-shrink-0 ${className}`} style={typeStyle('display-xs')}>
      {children}
    </span>
  );
}

export function SiblingNav({ index, total, onPrev, onNext }) {
  return (
    <div className="flex items-center gap-0.5 flex-shrink-0" role="group" aria-label="Naviguer entre les objets">
      <button
        onClick={index > 0 ? onPrev : undefined}
        disabled={index <= 0}
        aria-label="Précédent"
        className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${index <= 0 ? 'text-border-strong cursor-default' : 'text-foreground-secondary hover:bg-background-subtle hover:text-foreground'}`}
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
      </button>
      <span className="tabular-nums px-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.semantic.mutedForeground }}>
        {index + 1} / {total}
      </span>
      <button
        onClick={index < total - 1 ? onNext : undefined}
        disabled={index >= total - 1}
        aria-label="Suivant"
        className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${index >= total - 1 ? 'text-border-strong cursor-default' : 'text-foreground-secondary hover:bg-background-subtle hover:text-foreground'}`}
      >
        <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}

// Badge code (Figma Badge du kind Post) : fond muted, px-8 py-2, radius 6,
// 12 medium secondary-foreground.
export function CodeBadge({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[12px] leading-4 font-medium rounded-[6px] flex-shrink-0" style={{ backgroundColor: colors.semantic.muted, color: colors.semantic.secondaryForeground }}>
      {children}
    </span>
  );
}

// Filet vertical de séparation dans le strip (Figma « Context bar / Divider ») :
// 1x16 (Default) ou 1x18 (Tall, avant l'action primaire), couleur border.
export function StripDivider({ tall = false }) {
  return <span className={`w-px ${tall ? 'h-[18px]' : 'h-4'} bg-border flex-shrink-0`} aria-hidden="true" />;
}
