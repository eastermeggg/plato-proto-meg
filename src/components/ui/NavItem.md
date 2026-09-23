---
name: NavItem
type: composite
status: pending
usage: La ligne de la nav org (rail Plato) - destination / recent / create / see-all
description: >
  LA ligne du rail de navigation. Quatre variantes (destination, recent,
  recent+trail, create, see-all) et trois états (défaut / hover / actif). L'actif
  porte fond cream + bord border-strong + liseré orange + icône brand. Battle-tested
  par le proto ; ré-exportée par AppSidebar (on l'importe depuis là).
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37441-55015
file: src/components/shell/NavItem.js
inventoryId: NavItem
variants: [destination, recent, recent-trail, create, see-all]
states: [default, hover, active]
modes: [expanded]
tokens: [colors.brand.DEFAULT, colors.semantic.cream, colors.semantic.borderStrong, colors.semantic.foreground, colors.semantic.foregroundSecondary, colors.semantic.mutedForeground]
composedBy: [AppSidebar]
---

# NavItem

> **Type** Composite · **Status** Pending · **Usage** ligne du rail de navigation
> **Figma** [Navigation / Sidebar / Item](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37441-55015) · **File** `src/components/shell/NavItem.js`

La ligne du rail. On l'importe depuis `AppSidebar` (`import { NavItem } from '../ui/AppSidebar'`)
et on la compose dans un `SidebarGroup` - jamais un `<button>` de nav inline.

## Pattern / Variants / Examples

### When to use
- Toute ligne cliquable du rail gauche : destination, dossier/conversation
  récent, création en tête de section, « Voir tout » en pied.

### When NOT to use
- L'en-tête mono de section (« DOSSIERS RÉCENTS ») → `NavSectionHeader`.
- Une action hors rail → `Button`.

### Variantes (Figma Kind → prop `variant`)
| Figma | `variant` | Forme |
|---|---|---|
| Folder / Conversation | `destination` | icône + label, h-8 r-6 |
| Conversation | `recent` | idem, ligne de récent |
| ConversationWithTrail | `recent` + `trail` | 2e ligne CornerDownRight (réf. dossier), h-11 |
| Create | `create` | rangée PLATE en tête de liste : icône à 70 % + libellé 14 medium muted (nav finale 37416:1376, 23/09 - l'ancien bouton blanc bordé est retiré du frame Current), jamais actif |
| SeeAll | `see-all` | « Voir tout » muted 14px + chevron qui glisse |

### États (destination / recent)
- **défaut** texte foreground, icône foreground-secondary, fond nu
- **hover** fond cream/60, chevron de fin qui apparaît
- **actif** fond cream + bord border-strong + texte medium + icône **brand** + **liseré orange** 2×15 (glow 38%)

### Props
| Prop | Type | Rôle |
|---|---|---|
| `variant` | `destination \| recent \| create \| see-all` | forme |
| `icon` | Lucide | icône de tête (destination / recent / create) |
| `label` | string | libellé |
| `trail` | string | 2e ligne (réf. dossier) - variante recent |
| `active` | bool | état actif (destination / recent) |
| `onClick` / `title` | — | interaction |

> `collapsed` (icône seule) existe encore sur le composant mais c'est un
> **vestige legacy** : le rail Plato n'a pas de mode réduit (il passe en
> **masquée**, pas en rail d'icônes). Ne pas l'employer. Cf. `AppSidebar.md`.

### Examples
```jsx
import { NavItem, SidebarGroup } from '../ui/AppSidebar';

<SidebarGroup label="Dossiers récents">
  <NavItem variant="create" icon={FolderPlus} label="Nouveau dossier" onClick={create} />
  <NavItem variant="recent" icon={FolderOpen} label="Martel / AXA" active />
  <NavItem variant="recent" label="Préavis - fin de contrat" trail="Martel / AXA" />
  <NavItem variant="see-all" label="Voir tout" onClick={seeAll} />
</SidebarGroup>
```

### Tokens used
`colors.brand.DEFAULT` (liseré + icône active), `colors.semantic.cream` (fond
actif/hover), `colors.semantic.borderStrong` (bord actif),
`foreground` / `foregroundSecondary` / `mutedForeground` (texte + icônes).

## Sprint / Explos

- Relevé aligné sur la nav FINALE (Plato---System 37416:1376, 09/09). Surfacé dans le DS le 22/09.
- Voisins : `NavSectionHeader` (en-tête mono), `AppSidebar` (le rail qui la compose), `NavExpandControl` (contrôle repli).

## Proto demo

Visible en contexte : chaque ligne du rail gauche du proto.
