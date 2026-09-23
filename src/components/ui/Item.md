---
name: Item
package: plato
type: shadcn
status: draft
usage: Rangee generique de liste / menu (media + titre + description + actions)
description: >
  Rangee radius 12 a slots - media (boite icone cadree ou node libre), titre
  body-medium, description muted, actions a droite, header visuel et footer
  optionnels. Deux types (default, outline), deux tailles, hover accent quand
  interactive. Export ItemGroup pour empiler.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=32847-5869
file: src/components/ui/Item.js
source: src/components/ui/Item.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: Item
variants: [default, outline]
sizes: [md, sm]
states: [enabled, hover]
tokens: [colors.semantic.foreground, colors.semantic.mutedForeground, colors.semantic.muted, colors.semantic.border, colors.semantic.accent, radius.xl, radius.lg, radius.md, typography.scale.body, typography.scale.body-medium]
lastValidated: 2026-09-23
---

# Item

> **Type** shadcn · **Status** Pending (2026-09-23) · **Usage** rangée générique de liste / menu
> **Figma** [32847:5869](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=32847-5869) · **File** `src/components/ui/Item.js`

La rangée à tout faire : media à gauche, titre + description au centre,
actions à droite. Padding 16, gap 16, radius 12 (taille `md`). Le hover
(bg accent) ne s'active que si la rangée est interactive.

## Pattern / Variants / Examples

### When to use
- Listes de réglages, de connecteurs, de notifications (titre + description + action).
- Rangée cliquable d'un menu riche ou d'un panneau (avec `onClick`).
- Carte légère autoportante → `variant="outline"` (+ `header` / `footer` si besoin).
- Piles homogènes → `ItemGroup` (export nommé, Items collés).

### When NOT to use
- **Tables de données** (colonnes typées, tri) → `DataTableCell` / DomainTableRows.
- **Navigation du rail** → `NavItem` (shell canonique, jamais re-roulé).
- **Cartes JP** → `JPListing` ; **statuts** → `Badge`.

### Variants / Sizes / States
`default` (fond transparent) · `outline` (bord 1px border) ·
`md` (pad 16, gap 16) · `sm` (pad 8, gap 10, contenu gap 2, media avatar) ·
`enabled` · `hover` (bg accent, si `onClick` ou `pinHover`)

### Props
| Prop | Défaut | Rôle |
|------|--------|------|
| `variant` | `'default'` | `default` / `outline` |
| `size` | `'md'` | `md` (Figma Default) / `sm` (Figma Small) |
| `icon` | - | icône lucide dans la boîte média cadrée (bg muted, bord, 16px) |
| `media` | - | node libre à la place de la boîte (avatar, image, `Spinner`) |
| `title` | `'Title'` | body-medium foreground |
| `description` | `'Description'` | body muted-foreground |
| `actions` | - | node(s) à droite (`Button` size `sm`, 32px, en général) |
| `header` / `footer` | - | slots pleine largeur (visuel h128 / rangée gap 8) |
| `onClick` / `pinHover` | - | rend interactif (role button) / fige le hover |
| `className` / `style` | - | passthrough |

### Examples
```jsx
import Item, { ItemGroup } from 'src/components/ui/Item';
import Button from 'src/components/ui/Button';
import Progress from 'src/components/ui/Progress';
import { BadgeCheck } from 'lucide-react';

<Item icon={BadgeCheck} title="Boîte connectée" description="Synchronisation active"
  actions={<Button variant="outline" size="sm" label="Gérer" />} />

<Item variant="outline" title="Dossier Martin c/ SARL Dupont"
  description="12 pièces importées" onClick={openDossier} />

<Item size="sm" media={<img alt="" src={avatarUrl} style={{ width: 32, height: 32, borderRadius: 9999 }} />}
  title="Camille Aubry" description="Vu il y a 2 h" />

<ItemGroup>
  <Item title="Pièce n° 12" description="Facture" onClick={open} />
  <Item title="Pièce n° 13" description="Relevé" onClick={open} />
</ItemGroup>
```

### Tokens used
`colors.semantic.foreground` / `mutedForeground` (textes) · `muted` + `border`
(boîte média) · `accent` (hover) · `border` (outline) · `radius.xl` (rangée) /
`radius.lg` (boîte média) / `radius.md` (header) ·
`typography.scale['body-medium']` / `body`

## Sprint / Explos

- Construit le 23/09 depuis l'inventaire DS (nœud validé par la steward, set Figma Type × Size × State + slots .Item Media / Header / Actions / Footer).

## Proto demo

`/ui-kit/c/Item`
