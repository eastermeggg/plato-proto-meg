import React from 'react';
import NavExpandControl from './NavExpandControl';

// TopBar — LE chrome de barre de tête canonique de Plato (nav dossier V2).
// Pixel-perfect sur Figma « Navigation / Top bar » (Plato---System 37443:5796)
// + shell/NAV-BEHAVIOR.md §0. Une seule bande fixe :
//   h-48 · fond background · filet bas border · items centrés · gap 10px
//   padding horizontal 12px (nav ouverte) / 16px (nav masquée)
// Quand la nav est masquée (`navCollapsed`), la bande porte ELLE-MÊME le
// contrôle « Menu » (NavExpandControl, Figma 37443:5724) suivi d'une hairline
// border-strong - les surfaces n'ont plus à composer ce cluster à la main.
// On compose CECI partout (dossier, conversation, settings) - jamais une bande
// h-12 bordée inline. Le « Page Header » (titre + actions dans le contenu) est
// un composant distinct : ui/PageHeader.
//
// Slots :
//   left     breadcrumb + nom serif + onglets (cluster items-stretch : le
//            soulignement d'onglet actif tombe sur le filet bas de la bande)
//   right    outils de droite (⋮, PlatoAssistantButton…) - gap 12px
//   leading  échappatoire : élément(s) custom en tête du cluster gauche
//            (préférer `navCollapsed`, qui rend le contrôle canonique)
// Nav masquée :
//   navCollapsed + onNavExpand / onNavHome / onNavPeekEnter / onNavPeekLeave
//            → NavExpandControl + hairline rendus par la bande elle-même.

// Hairline verticale du chrome (Figma « Hairline » 1x16, border-strong) —
// sépare breadcrumb / nom du dossier / onglets.
export function TopBarHairline() {
  return <span aria-hidden className="w-px h-4 bg-border-strong flex-shrink-0 self-center" />;
}

export default function TopBar({
  navCollapsed = false,
  onNavExpand,
  onNavHome,
  onNavPeekEnter,
  onNavPeekLeave,
  leading,
  left,
  right,
  className = '',
  style,
}) {
  return (
    <div className="w-full flex-shrink-0">
      <div
        className={`w-full h-12 ${navCollapsed ? 'px-4' : 'px-3'} flex items-stretch justify-between gap-2.5 bg-background border-b border-border flex-shrink-0 ${className}`}
        style={style}
      >
        <div className="flex items-stretch gap-2.5 min-w-0 flex-1">
          {navCollapsed && (
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <NavExpandControl
                onExpand={onNavExpand}
                onHome={onNavHome}
                onPeekEnter={onNavPeekEnter}
                onPeekLeave={onNavPeekLeave}
              />
              <TopBarHairline />
            </div>
          )}
          {leading}
          {left}
        </div>
        <div className="flex items-center gap-3 justify-end flex-shrink-0">
          {right}
        </div>
      </div>
    </div>
  );
}
