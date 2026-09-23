---
name: Progress
type: shadcn
status: pending
usage: Barre de progression determinee (0 a 100 %)
description: >
  Piste 8px radius full (bg secondary) + remplissage primary dont la largeur
  suit la valeur. Coins droits du remplissage clippes par la piste, comme la
  maquette. Transition douce sur la valeur.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-29134
file: src/components/ui/Progress.js
inventoryId: Progress
variants: [determinate]
tokens: [colors.semantic.secondary, colors.semantic.primary, radius.full, motion.duration.base]
lastValidated: 2026-09-23
---

# Progress

> **Type** shadcn · **Status** Pending (2026-09-23) · **Usage** barre de progression déterminée
> **Figma** [2819:29134](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-29134) · **File** `src/components/ui/Progress.js`

Barre horizontale h 8, piste `secondary`, remplissage `primary`. Le set Figma
décline 0 % → 100 % par pas de 10 - en code, `value` est continue.

## Pattern / Variants / Examples

### When to use
- Progression mesurable : upload, ingestion de pièces, complétion d'un import.
- Jauge d'usage (ex. usage hebdomadaire licences) quand la valeur est connue.
- Dans le footer d'un `Item` (slot Figma .Item Footer l'utilise tel quel).

### When NOT to use
- **Attente indéterminée** → `Spinner`.
- **Étapes discrètes** (1/2/3) → stepper, pas une barre continue.
- **Score / notation** → composant dédié, la barre implique une progression temporelle.

### Props
| Prop | Défaut | Rôle |
|------|--------|------|
| `value` | `0` | valeur courante (premier variant du set Figma) |
| `max` | `100` | borne haute |
| `width` | `400` | largeur du variant Figma ; passer `'100%'` en usage fluide |
| `label` | - | aria-label |
| `className` / `style` | - | passthrough |

### Examples
```jsx
import Progress from 'src/components/ui/Progress';

<Progress value={40} />
<Progress value={70} width="100%" label="Import des pièces" />
<Progress value={100} />
```

### Tokens used
`colors.semantic.secondary` (piste) · `colors.semantic.primary` (remplissage) ·
`radius.full` · `motion.duration.base` + `motion.easing.out` (transition de valeur)

## Sprint / Explos

- Construit le 23/09 depuis l'inventaire DS (nœud validé par la steward, set Figma « Progress » 0-100 %).

## Proto demo

`/ui-kit/c/Progress`
