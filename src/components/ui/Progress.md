---
name: Progress
package: plato
type: shadcn
status: draft
usage: Barre de progression determinee (0 a 100 %)
description: >
  Piste 8px radius full (bg secondary) + remplissage primary dont la largeur
  suit la valeur. Coins droits du remplissage clippes par la piste, comme la
  maquette. Transition douce sur la valeur.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-29134
file: src/components/ui/Progress.js
source: src/components/ui/Progress.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: Progress
variants: [determinate]
sizes: [md, sm]
tones: [default, caution, warn, muted]
tokens: [colors.semantic.secondary, colors.semantic.primary, colors.semantic.foregroundMuted, colors.banner.warning.accent, colors.feedback.warning, radius.full, motion.duration.base]
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
| `size` | `md` | `md` h8 (Figma) · `sm` h4 (jauges compactes : quota sidebar, rangées) |
| `tone` | `default` | `default` primary · `caution` pré-alerte (proposition sémantique, arbitrage 24/09 : « un token de marque ne porte pas d'état ») · `warn` alerte (`feedback.warning.base` sur piste `warning.subtle`) · `muted` progression discrète (`foregroundMuted`) |
| `label` | - | aria-label |
| `className` / `style` | - | passthrough |

### Examples
```jsx
import Progress from 'src/components/ui/Progress';

<Progress value={40} />
<Progress value={70} width="100%" label="Import des pièces" />
<Progress value={100} />
// Jauge de quota (WeeklyUsageCard) : compacte, tone par palier
<Progress value={92} size="sm" width="100%" tone="warn" label="Usage hebdomadaire" />
```

### Tokens used
`colors.semantic.secondary` (piste) · `colors.semantic.primary` (remplissage) ·
`radius.full` · `motion.duration.base` + `motion.easing.out` (transition de valeur)

## Sprint / Explos

- Construit le 23/09 depuis l'inventaire DS (nœud validé par la steward, set Figma « Progress » 0-100 %).
- 24/09 : extensions code-first validées steward (SIGNALEMENTS §16) - `size sm`
  (h4) + tone `warn` pour les jauges de quota. Adopté par `WeeklyUsageCard`
  (remplace sa barre inline ; en warn la barre montre le vrai % sur piste
  `warning.subtle`, l'ancienne version saturait la piste entière) et les 2
  barres d'extraction de poste d'App.js.
- 24/09 (arbitrage steward) : le tone `accent` initialement proposé pour le
  palier ≥70 % est refusé (« un token de marque ne porte pas d'état ») →
  renommé `caution`, proposition sémantique à valider. Tone `muted` validé et
  adopté sur la barre d'extraction du banner App.js ; reste la barre quotas
  membres (L~9333, deux remplissages par état) hors périmètre.

## Proto demo

`/ui-kit/c/Progress`
