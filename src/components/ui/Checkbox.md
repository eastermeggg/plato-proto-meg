---
name: Checkbox
package: plato
type: primitive
status: draft
usage: Case à cocher 16px - off / on / indéterminé (tri-state)
description: >
  Case 16px radius sm. États off, on (Check), indéterminé (Minus), disabled.
  Coché = fond + bordure foreground, glyphe white. Remplace les cases inline
  copiées (SaveDestinationPopover, JPAddStepper, ImportEmailDialog).
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-21779
file: src/components/ui/Checkbox.js
source: src/components/ui/Checkbox.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: Checkbox
states: [off, on, indeterminate, disabled]
tokens: [colors.semantic.foreground, colors.semantic.border, colors.semantic.card, colors.semantic.white, radius.sm]
lastValidated: 2026-09-24
---

# Checkbox

> **Type** Primitive · **Status** Pending (2026-09-24) · **Usage** case à cocher
> **Figma** [2819:21779](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-21779) · **File** `src/components/ui/Checkbox.js`

Case 16px, tri-state (off / on / indéterminé). Promu depuis `previews.jsx`, tokenisé.

## Pattern / Variants / Examples

### When to use
- Sélection multiple indépendante (liste, filtres, options).
- État parent partiel d'un groupe → `indeterminate`.

### When NOT to use
- **Choix exclusif** → `RadioGroup` / `RadioPricing`.
- **On/off d'un réglage immédiat** → `Switch`.

### Props
| Prop | Défaut | Rôle |
|------|--------|------|
| `checked` | `false` | état coché |
| `indeterminate` | `false` | état partiel (Minus) |
| `label` | - | libellé cliquable |
| `disabled` | `false` | désactivé |
| `onChange` | - | `(next: boolean) => void` |

### Examples
```jsx
import Checkbox from 'src/components/ui/Checkbox';

<Checkbox checked={v} label="Pièces adverses" onChange={setV} />
<Checkbox indeterminate label="Tout sélectionner" onChange={selectAll} />
```

### Tokens used
`colors.semantic.foreground` (coché) · `colors.semantic.border` (repos) ·
`colors.semantic.card` (fond) · `colors.semantic.white` (glyphe) · `radius.sm`.

## Sprint / Explos

- Promu le 24/09/2026 depuis `ui-kit/previews.jsx`, tokenisé + ajout `indeterminate` (relevé du besoin tri-state d'ImportEmailDialog, audit DS cat. 2).

## Proto demo

`/ui-kit/c/Checkbox`
