import React from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

// ── Strip objet niveau 3 (behaviour map §1.4, frame Figma 3752:44432) ──
// L'objet (poste, poste-IV, acte) EST l'en-tête de page : bande à filet bas
// (~54px, px-8) posée sous les onglets du dossier. Quatre briques :
//
//   Niveau3Strip      la bande elle-même - filet bas, min-h 54, py-3, gap-3.
//                     `justify="between"` (poste : groupe gauche / groupe
//                     droite) ou `"start"` (acte : gauche flex-1 + outils
//                     inline). Le contenu est composé par l'appelant.
//   BreadcrumbReturn  le retour NOMMÉ - unique retour du cran. Carré 28px
//                     (fond cream/60 au survol seulement) + flèche + libellé
//                     estompé ; tout le groupe est la cible.
//   SiblingNav        précédent / suivant parmi les frères + compteur
//                     « n / N » mono 11. Extrémités désactivées (pas de
//                     boucle).
//   CodeBadge         badge code fond secondaire #eeece6 / #44403c r-6
//                     (remplace l'ancien pill blanc bordé).

export function Niveau3Strip({ justify = 'between', children }) {
  return (
    <div className="flex-shrink-0 border-b border-border px-8">
      <div className={`min-h-[54px] py-3 flex items-center gap-3 ${justify === 'between' ? 'justify-between' : ''}`}>
        {children}
      </div>
    </div>
  );
}

export function BreadcrumbReturn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 flex-shrink-0 group -ml-1"
      title={label}
      aria-label={label}
    >
      <span className="flex items-center justify-center w-7 h-7 rounded-md text-foreground-muted group-hover:text-foreground group-hover:bg-cream/60 transition-colors">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
      </span>
      <span className="text-[13px] text-foreground-tertiary group-hover:text-foreground-secondary transition-colors whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

export function SiblingNav({ index, total, onPrev, onNext }) {
  return (
    <div className="flex items-center gap-0.5 flex-shrink-0" role="group" aria-label="Naviguer entre les objets">
      <button
        onClick={index > 0 ? onPrev : undefined}
        disabled={index <= 0}
        aria-label="Précédent"
        className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${index <= 0 ? 'text-border-strong cursor-default' : 'text-foreground-secondary hover:bg-cream/60 hover:text-foreground'}`}
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
      </button>
      <span className="tabular-nums px-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#78716c' }}>
        {index + 1} / {total}
      </span>
      <button
        onClick={index < total - 1 ? onNext : undefined}
        disabled={index >= total - 1}
        aria-label="Suivant"
        className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${index >= total - 1 ? 'text-border-strong cursor-default' : 'text-foreground-secondary hover:bg-cream/60 hover:text-foreground'}`}
      >
        <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}

export function CodeBadge({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-1 text-[12px] font-medium rounded-[6px] flex-shrink-0" style={{ backgroundColor: '#eeece6', color: '#44403c' }}>
      {children}
    </span>
  );
}

// Filet vertical de séparation dans le strip (entre retour et badge, avant
// l'action primaire).
export function StripDivider({ tall = false }) {
  return <span className={`w-px ${tall ? 'h-[18px]' : 'h-4'} bg-border flex-shrink-0`} aria-hidden="true" />;
}
