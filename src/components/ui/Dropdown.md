---
name: Dropdown
package: plato
type: primitive
status: draft
usage: Menu d'actions / navigation ancré à un déclencheur (skin du menu Select)
description: >
  Menu d'actions ouvert par un déclencheur libre (Button, icône). Skin
  STRICTEMENT identique au menu du Select (décision steward 24/09) : compose
  SelectMenuPanel / SelectMenuItem / SelectMenuLabel - popover bordé border,
  radius 8, ombre xl, rows px-8 py-6 radius 6 hover accent, raccourcis 12
  muted, labels de section mono 11 uppercase. Zéro style propre.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-24797
file: src/components/ui/Dropdown.js
source: src/components/ui/Dropdown.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: Dropdown
states: [closed, open, item-hover, item-disabled, item-selected]
tokens: [via SelectMenuPanel/Item/Label - colors.semantic.popover, colors.semantic.border, colors.semantic.accent, colors.semantic.foreground, colors.semantic.mutedForeground, radius.lg, radius.md, shadows.xl, typography.fontFamily.mono]
lastValidated: 2026-09-24
---

# Dropdown

> **Type** Primitive · **Status** Pending (2026-09-24) · **Usage** menu d'actions ancré
> **Figma** [2819:24797](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-24797) (skin : menu Select [6729:4904](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=6729-4904)) · **File** `src/components/ui/Dropdown.js`

## Pattern / Variants / Examples

### When to use
- Actions contextuelles derrière un bouton/icône (renommer, déplacer,
  supprimer…), avec raccourcis et sections.

### When NOT to use
- **Choisir une valeur affichée dans le champ** → `Select`.
- **Menu contextuel au clic droit positionné au curseur** → même skin, mais
  positionnement libre : composer `SelectMenuPanel` (cf. RowContextMenu).
- **Contenu riche non-menu** → Popover ([a-dessiner]).

### Props
| Prop | Défaut | Rôle |
|------|--------|------|
| `trigger` | - | nœud déclencheur (un `Button` DS, une icône…) |
| `items` | `[]` | `{ key, label, icon?, shortcut?, disabled?, selected?, group?, onSelect? }` |
| `onSelect` | - | callback global `(item) => void` |
| `align` | `'start'` | `start` / `end` (bord d'ancrage du panneau) |
| `width` | `200` | largeur du panneau |

### Examples
```jsx
import Dropdown from 'src/components/ui/Dropdown';
import Button from 'src/components/ui/Button';

<Dropdown
  trigger={<Button variant="outline" label="Actions" icon={ChevronDown} iconPosition="trailing" />}
  items={[
    { key: 'rename', label: 'Renommer', icon: Edit, shortcut: '⌘R', onSelect: rename },
    { key: 'delete', label: 'Supprimer', icon: Trash2, group: 'Danger', onSelect: remove },
  ]}
/>
```

### Tokens used
Aucun style propre : tout vient de `SelectMenuPanel` / `SelectMenuItem` /
`SelectMenuLabel` (voir fiche Select). C'est la garantie « même panel, même
rows, mêmes états » de la décision steward.

## Sprint / Explos

- Promu le 24/09/2026 en second du couple Select/Dropdown. Cible
  d'harmonisation (passe dédiée) : ExportBordereauMenu, ComposerMenu,
  SuggestionsMenu, RowContextMenu, menus custom OnboardingFlow /
  ReleveHeuresLab, et les ~9 menus positionnés d'App.js.

## Proto demo

`/ui-kit/c/Dropdown`
