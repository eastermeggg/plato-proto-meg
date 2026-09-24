// NavItem — porte ui/ vers LA ligne de nav canonique du rail Plato.
// La source vit dans shell/NavItem.js (battle-tested par le proto) ; ce shim
// l'expose côté ui/ pour l'ergonomie « une seule porte » (elle est aussi
// ré-exportée par ui/AppSidebar). Fiche : NavItem.md · Figma 37441:55015.
export { default } from '../shell/NavItem';
