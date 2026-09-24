---
name: Select
package: plato
type: primitive
status: draft
usage: Choix d'une option dans une liste déroulante ancrée au champ
description: >
  Trigger champ card bordé input (h-36, radius 8, ombre 2xs, chevron-down) +
  panel popover bordé border (radius 8, ombre xl, sections p-4, labels mono 11
  uppercase, rows px-8 py-6 radius 6 - hover accent, sélection = label medium
  + Check). Panel et rows exportés (SelectMenuPanel/Item/Label) et réutilisés
  par le Dropdown (même skin, décision steward).
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=6729-4904
file: src/components/ui/Select.js
source: src/components/ui/Select.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: Select
states: [enabled, focus, open, filled, disabled, option-disabled]
tokens: [colors.semantic.card, colors.semantic.input, colors.semantic.popover, colors.semantic.border, colors.semantic.accent, colors.semantic.foreground, colors.semantic.mutedForeground, radius.lg, radius.md, shadows.2xs, shadows.xl, typography.fontFamily.mono]
lastValidated: 2026-09-24
---

# Select

> **Type** Primitive · **Status** Pending (2026-09-24) · **Usage** liste déroulante de choix
> **Figma** [6729:4904](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=6729-4904) (trigger 2738:3407 · panel 13:2034 · rows 37122:19624) · **File** `src/components/ui/Select.js`

## Pattern / Variants / Examples

### When to use
- Choisir UNE option parmi une liste (type de dossier, format, licence…).
- Groupes : `option.group` → sections avec label mono uppercase.

### When NOT to use
- **Actions / navigation dans un menu** → Dropdown (même panel, à venir).
- **Recherche + saisie libre** → Combobox (à venir).
- **2-3 choix visibles** → `RadioGroup` / segmented (`ButtonGroup`).
- **Menus riches** (recherche, arbre de pièces, switch, radio, raccourcis) →
  menus assemblés sur `SelectMenuPanel`, avec le Dropdown.

### Props
| Prop | Défaut | Rôle |
|------|--------|------|
| `value` / `onChange` | - | contrôle |
| `options` | `[]` | `{ value, label, icon?, group?, disabled? }` |
| `placeholder` | `'Sélectionner…'` | affiché sans valeur |
| `disabled` | `false` | trigger désactivé (opacité 50, fond subtle) |
| `width` | `240` | largeur (Figma : min 64 / max 448) |

Exports secondaires : `SelectMenuPanel`, `SelectMenuItem`, `SelectMenuLabel`
(le skin du panel - consommés par le Dropdown).

### Examples
```jsx
import Select from 'src/components/ui/Select';

<Select
  value={type}
  onChange={setType}
  placeholder="Type de dossier"
  options={[
    { value: 'dc', label: 'Dommages corporels', group: 'Spécialités' },
    { value: 'social', label: 'Droit social', group: 'Spécialités' },
  ]}
/>
```

### Tokens used
Trigger : `card` / `input` / `backgroundSubtle` (disabled) / `radius.lg` /
`shadows['2xs']`. Panel : `popover` / `border` / `shadows.xl` / `radius.lg`.
Rows : `accent` (hover) / `foreground` / `mutedForeground` / `radius.md` /
`fontFamily.mono` (labels 11 uppercase). Focus : bordure `foreground` + anneau
3px `color-mix(foregroundMuted 50%)` - le nœud pointe `custom/focus`, token
absent du code (arbitrage SIGNALEMENTS §12), jamais un rgba inline.

## Sprint / Explos

- Promu le 24/09/2026 (décision steward : Select puis Dropdown en skin du même
  menu). Cible d'adoption : 46 `<select>` natifs + `selectClass` (App.js), les
  selects custom d'OnboardingFlow / ReleveHeuresLab - passe d'harmonisation
  dédiée après le Dropdown.

## Proto demo

`/ui-kit/c/Select`
