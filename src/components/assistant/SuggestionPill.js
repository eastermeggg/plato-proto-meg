import React from 'react';

// Pill de démarrage du composer (home, sous le composer hero) - un extrait
// des mêmes idées que l'ampoule du toolbar. Cliquer remplit le composer
// (l'utilisateur complète puis envoie).
// Anatomie : h-8, rounded-lg (dé-« pilulée »), bord border, fond blanc,
// icône de tête 14px foreground-tertiary, libellé 13px foreground-secondary.
// Hover : texte foreground, bord border-strong, fond cream/40.
export default function SuggestionPill({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-8 pl-2.5 pr-3 rounded-lg border border-border bg-white text-[13px] text-foreground-secondary hover:text-foreground hover:border-border-strong hover:bg-cream/40 transition-colors"
    >
      {Icon && <Icon className="w-3.5 h-3.5 text-foreground-tertiary flex-shrink-0" strokeWidth={1.75} />}
      {label}
    </button>
  );
}
