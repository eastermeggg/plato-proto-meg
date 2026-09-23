---
name: Spinner
package: plato
type: shadcn
status: draft
usage: Indicateur de chargement inline (icône loader-circle en rotation)
description: >
  Icone lucide loader-circle en rotation continue. Cinq tailles (12 a 32 px),
  couleur par token (foreground par defaut, feedback.* ou white selon la
  surface). Role status pour l'accessibilite.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=33609-22857
file: src/components/ui/Spinner.js
source: src/components/ui/Spinner.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: Spinner
sizes: [xs, sm, md, lg, xl]
states: [spinning]
tokens: [colors.semantic.foreground, motion (animate-spin)]
lastValidated: 2026-09-23
---

# Spinner

> **Type** shadcn · **Status** Pending (2026-09-23) · **Usage** indicateur de chargement inline
> **Figma** [33609:22857](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=33609-22857) · **File** `src/components/ui/Spinner.js`

L'icône lucide `loader-circle` (Loader2) en rotation continue. Le set Figma
fige 4 rotations (0/90/180/270) - en code, une seule animation `animate-spin`.

## Pattern / Variants / Examples

### When to use
- Chargement local : dans un `Item`, une cellule, un champ, un état vide.
- Chargement teinté : passer un token feedback (`colors.feedback.info.base`…) via `color`.
- Sur surface sombre / bouton primaire : `color={colors.semantic.white}`.

### When NOT to use
- **Bouton en cours d'action** → `Button loading` (le spinner y est déjà intégré).
- **Progression mesurable** → `Progress` (barre déterminée).
- **Skeleton de page** → shimmer / skeleton, pas un spinner isolé.

### Sizes (5)
`xs` 12 · `sm` 16 (défaut) · `md` 20 · `lg` 24 · `xl` 32
(Figma Size=3/4/5/6/8)

### Props
| Prop | Défaut | Rôle |
|------|--------|------|
| `size` | `'sm'` | xs / sm / md / lg / xl |
| `color` | `colors.semantic.foreground` | n'importe quel token couleur |
| `label` | `'Chargement'` | aria-label (role="status") |
| `className` / `style` / `title` | - | passthrough |

### Examples
```jsx
import Spinner from 'src/components/ui/Spinner';
import { colors } from 'src/design-system/tokens';

<Spinner />
<Spinner size="xl" />
<Spinner size="md" color={colors.semantic.mutedForeground} />
<Spinner color={colors.feedback.info.base} label="Analyse en cours" />
```

### Tokens used
`colors.semantic.foreground` (couleur par défaut, relevée sur le set Figma) ·
classe `animate-spin` (Tailwind, même mécanique que `Button loading`) ·
tailles = échelle d'icônes Figma (12/16/20/24/32)

## Sprint / Explos

- Construit le 23/09 depuis l'inventaire DS (nœud validé par la steward ; les nuances du frame « Color » Figma sont des exemples Tailwind génériques, la couleur reste pilotée par token).

## Proto demo

`/ui-kit/c/Spinner`
