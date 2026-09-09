import React from 'react';

// Icône de bascule du panneau (nav) - glyphe custom du DS
// (Plato---System 37425:19556) : rect arrondi 18×18 rx3 + barre verticale.
// Géométrie EXACTE des deux états ; la seule différence est la position x de
// la barre : déplié = DROITE (x 16.62), replié = GAUCHE (x 7.35, delta 9.27).
// L'animation « très spécifique » = la barre GLISSE horizontalement entre les
// deux (300ms, courbe de la nav). dir="collapse" : repos à droite, survol →
// glisse à gauche (aperçu du repli). dir="expand" : l'inverse. Le bouton parent
// doit porter `group`.
const PanelToggleIcon = ({ dir = 'collapse', className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    <line
      x1="16.62" y1="5.961" x2="16.62" y2="17.615"
      stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"
      className={
        dir === 'collapse'
          ? 'transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-x-[9.27px]'
          : 'transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] -translate-x-[9.27px] group-hover:translate-x-0'
      }
    />
  </svg>
);

export default PanelToggleIcon;
