import React from 'react';
import PanelToggleIcon from './PanelToggleIcon';

// Contrôle « Menu » (Figma « Navigation / Sidebar / Toggle », Plato---System
// 37443:5724) - visible UNIQUEMENT quand la nav est masquée. Le logo Plato
// (28px) garde une ancre de marque à l'extrême gauche, suivi du bouton
// « Menu » (h-32, px-12, radius 8 : glyphe panel 16 dont la barre glisse au
// survol + libellé 14 medium muted-foreground).
// Survol → peek immédiat (onPeekEnter/onPeekLeave) ; clic → réouverture.
// `absolute` : pose ancrée en haut à gauche sur les surfaces sans barre.
// Le parent décide de l'afficher (navHidden) - le composant est purement
// présentationnel.
export default function NavExpandControl({ onExpand, onPeekEnter, onPeekLeave, onHome, absolute = false }) {
  return (
    <div
      className={`${absolute ? 'absolute left-3 top-3 z-40' : ''} flex items-center gap-1.5 flex-shrink-0`}
      onMouseEnter={onPeekEnter}
      onMouseLeave={onPeekLeave}
    >
      {/* Le logo ramène TOUJOURS à l'accueil (même ancre de marque que le
          header de la nav ouverte) - le peek reste géré par le survol du bloc. */}
      <button
        onClick={onHome}
        className="flex-shrink-0 rounded-md hover:opacity-80 transition-opacity"
        title="Accueil"
        aria-label="Accueil"
      >
        <img src="/logo-plato.svg" alt="Plato" className="w-7 h-7 block" />
      </button>
      <button
        onClick={onExpand}
        className="group flex items-center justify-center gap-2 h-8 px-3 rounded-lg hover:bg-background-subtle transition-colors flex-shrink-0"
        title="Afficher la navigation"
        aria-label="Afficher la navigation"
      >
        <PanelToggleIcon dir="expand" className="w-4 h-4 text-foreground-secondary" />
        <span className="text-[14px] font-medium text-foreground-secondary leading-5">Menu</span>
      </button>
    </div>
  );
}
