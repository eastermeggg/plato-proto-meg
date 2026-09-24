import React from 'react';
import { colors } from '../../design-system/tokens';
import NavSectionHeader from '../shell/NavSectionHeader';
import PanelToggleIcon from '../shell/PanelToggleIcon';
import PlatoIcon from '../shell/PlatoIcon';

// AppSidebar — LE shell de navigation canonique de Plato (rail gauche).
// La composition (chrome du rail) était dupliquée inline (proto, playground,
// settings). Les PIÈCES existaient déjà dans src/components/shell/ (NavItem,
// NavSectionHeader) - battle-tested par le proto. AppSidebar ne les réinvente
// PAS : il les compose. On importe tout depuis ici, une seule porte.
//
// Établi depuis Figma « Sidebar & Navigation » (Plato---System 36097:42882) +
// doctrine App Shell (Plato---Design 4127:30731) + shell/NAV-BEHAVIOR.md.
//
// Grammaire (invariante) : rail (largeur 264, fond background, bord droit
// `border` #dfdcd9 = valeur Figma FINALE de la nav, 37416:1376) · header h-48
// (SidebarBrand) · groupes (NavSectionHeader ; SANS filet entre groupes de
// contenu - nav finale) · items (NavItem : liseré orange 3×15 + icône brand
// sur l'actif, gap 2) · footer optionnel.
// NB (22/09) : le rail utilisait `border-strong` (#cbc7c4, trop foncé) - dérive
// DS corrigée pour coller AU PROTO (Figma-final), pas l'inverse.
// Réaligné ISO sur 37416:1376 le 23/09 : largeur 250→264, filets de groupes
// retirés (opt-in `divider`), gap items 4→2.

// Pièces canoniques ré-exportées : les consommateurs importent tout d'ici.
export { default as NavItem } from '../shell/NavItem';
export { default as NavSectionHeader } from '../shell/NavSectionHeader';
export { default as SidebarUserInfo } from '../shell/SidebarUserInfo';

export function AppSidebar({ header, footer, width = 264, children, onCollapse, className = '', style }) {
  return (
    <div
      className={`flex-shrink-0 h-full flex flex-col bg-background border-r border-border ${className}`}
      style={{ width, ...style }}
    >
      {header != null && (
        <div className="h-12 border-b border-border flex items-center flex-shrink-0 pl-4 pr-2.5 gap-2">
          {header}
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="group p-1.5 rounded-md hover:bg-background-subtle transition-colors flex-shrink-0"
              title="Masquer la navigation"
              aria-label="Masquer la navigation"
            >
              <PanelToggleIcon dir="collapse" className="w-4 h-4 text-foreground-secondary" />
            </button>
          )}
        </div>
      )}
      <div className="flex-1 overflow-y-auto">{children}</div>
      {footer != null && (
        <div className="border-t border-border flex-shrink-0">{footer}</div>
      )}
    </div>
  );
}

// En-tête standard : logo Plato + wordmark serif + chip optionnel (ex. « DS »).
export function SidebarBrand({ chip, onClick, title = 'Plato' }) {
  const inner = (
    <>
      <PlatoIcon size={24} />
      <span style={{ fontFamily: "'RL Para Trial Central', Georgia, 'Times New Roman', serif", fontSize: 18, fontWeight: 500, color: colors.semantic.foreground, letterSpacing: '-0.5px', lineHeight: '20px' }}>
        {title}
      </span>
      {chip && (
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.brand.darker.DEFAULT, border: `1px solid ${colors.semantic.borderStrong}`, borderRadius: 5, padding: '1px 5px' }}>
          {chip}
        </span>
      )}
    </>
  );
  return onClick
    ? <button onClick={onClick} className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity text-left" title={title}>{inner}</button>
    : <span className="flex items-center gap-2 flex-1 min-w-0">{inner}</span>;
}

// Groupe : NavSectionHeader (label + action optionnelle) + items. Nav finale
// 37416:1376 : PAS de filet entre les groupes de contenu (les en-têtes mono +
// l'espace structurent), items en gap 2. `divider` (opt-in) remet un filet bas
// pour les surfaces qui en veulent un ; `last` est conservé (no-op, compat).
export function SidebarGroup({ label, action, children, divider = false, last = false }) {
  return (
    <div className={`px-2 py-2.5 ${divider ? 'border-b border-border' : ''}`}>
      {label && <NavSectionHeader label={label} action={action} />}
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}
