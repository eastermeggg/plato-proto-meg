import React from 'react';
import { ChevronLeft } from 'lucide-react';

// Bande de tête du dossier - h-48 (alignée sur le header de la nav : les deux
// filets bas se rejoignent d'un bord à l'autre), px-8. Porte la SORTIE du
// dossier : contrôle « Menu » (nav masquée) | hairline verticale | retour
// nommé « ‹ Mes dossiers ». Jamais en ligne avec le nom du dossier (décision
// 09/09 : un cran par barre).
//   leading  slot - NavExpandControl quand la nav est masquée ; sa présence
//            déclenche la hairline de séparation
export default function BreadcrumbBand({ leading = null, backLabel, onBack, title }) {
  return (
    <div className="w-full px-8 h-12 border-b border-border flex items-center gap-2 min-w-0">
      {leading && (
        <>
          {leading}
          {/* Hairline vertical entre le contrôle Menu et le fil de retour */}
          <span aria-hidden className="w-px h-4 bg-border-strong flex-shrink-0 mx-1" />
        </>
      )}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-[13px] text-foreground-tertiary hover:text-foreground transition-colors flex-shrink-0"
        title={title ?? backLabel}
      >
        <ChevronLeft className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
        {backLabel}
      </button>
    </div>
  );
}
