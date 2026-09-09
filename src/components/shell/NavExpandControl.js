import React from 'react';
import PanelToggleIcon from './PanelToggleIcon';

// Contrôle « Menu » (frame 09fvZrDgcY83Js7y864E4v 3757:30888) - visible
// UNIQUEMENT quand la nav est masquée. Le logo Plato garde une ancre de
// marque à l'extrême gauche, suivi du glyphe panel (miroir du masquage,
// barre qui glisse au survol) + libellé « Menu ».
// Survol → peek immédiat (onPeekEnter/onPeekLeave) ; clic → réouverture.
// `absolute` : pose ancrée en haut à gauche sur les surfaces sans barre.
// Le parent décide de l'afficher (navHidden) - le composant est purement
// présentationnel.
export default function NavExpandControl({ onExpand, onPeekEnter, onPeekLeave, absolute = false }) {
  return (
    <div
      className={`${absolute ? 'absolute left-3 top-3 z-40' : ''} flex items-center gap-1.5 flex-shrink-0`}
      onMouseEnter={onPeekEnter}
      onMouseLeave={onPeekLeave}
    >
      <img src="/logo-plato.png" alt="Plato" className="w-6 h-6 flex-shrink-0" />
      <button
        onClick={onExpand}
        className="group flex items-center gap-1.5 pl-1.5 pr-2 py-1.5 rounded-md hover:bg-cream/60 transition-colors flex-shrink-0"
        title="Afficher la navigation (⌘\)"
        aria-label="Afficher la navigation"
      >
        <PanelToggleIcon dir="expand" className="w-4 h-4 text-foreground-secondary" />
        <span className="text-[14px] text-foreground-secondary leading-none">Menu</span>
      </button>
    </div>
  );
}
