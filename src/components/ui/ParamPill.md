---
name: ParamPill
package: plato
type: primitive
status: beta
usage: Pilule de paramètre de calcul togglable (label + valeur quand actif)
description: >
  Pilule radius full pour un paramètre de calcul : OFF = libellé medium muted
  bordé borderStrong ; ON = fond info.bg, bord info.border, libellé medium +
  valeur regular info.text. Halo 3px background au clic/focus. Icône lucide
  circle-arrow-up par défaut. State Diff du set Figma non couvert (tokens
  manquants, SIGNALEMENTS §19).
figma: https://www.figma.com/design/09fvZrDgcY83Js7y864E4v/Plato---Design?node-id=1095-15027
file: src/components/ui/ParamPill.js
source: src/components/ui/ParamPill.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: ParamPill
variants: [off, on]
states: [default, clicked (halo :active/:focus-visible), diff (non couvert)]
tokens: [colors.feedback.info, colors.semantic.borderStrong, colors.semantic.mutedForeground, colors.semantic.background, radius.full, typography.scale.body-medium]
promotedFrom: Badge info/secondary dévoyés (matterTabContents, SIGNALEMENTS §13)
lastValidated: 2026-09-24
---

# ParamPill

> **Type** Primitive · **Status** Pending (2026-09-24) · **Usage** paramètre de calcul togglable
> **Figma** [1095:15027](https://www.figma.com/design/09fvZrDgcY83Js7y864E4v/Plato---Design?node-id=1095-15027) (« Reference Text », section LOCAL COMPONENTS > PARAMS [1613:113399](https://www.figma.com/design/09fvZrDgcY83Js7y864E4v/Plato---Design?node-id=1613-113399)) · **File** `src/components/ui/ParamPill.js`

La pilule des paramètres de calcul : rangées PGP (« Revalo », « Barème »,
« Capit », « Base journalière ») et strip de params au-dessus du composer.
OFF = paramètre disponible (libellé seul, muted) ; ON = paramètre actif
(teinte info, libellé + valeur).

## Pattern / Variants / Examples

### When to use
- Un paramètre de calcul activable dont la valeur s'affiche quand il est actif
  (revalorisation, barème, taux de capitalisation, base journalière…).
- Le strip de params d'un chat / d'une rangée de référence PGP.

### When NOT to use
- **Statut / catégorie non interactifs** → `Badge`.
- **Type de source cliquable** (pièce, JP, loi…) → `SourceBadge`.
- **Choix exclusif dans un formulaire** → `RadioGroup` / `Select`, pas une
  rangée de pilules.
- **Action** (déclenche un geste, pas un état) → `Button`.

### Props
| Prop | Défaut | Rôle |
|------|--------|------|
| `label` | — | libellé du paramètre (medium) |
| `value` | — | valeur affichée quand `on` (regular) |
| `on` | `false` | variant ON/OFF du set Figma (`aria-pressed`) |
| `icon` | `CircleArrowUp` | icône 14 de la maquette ; `null` pour sans icône |
| `onClick` / `title` / `disabled` | — | interaction |
| `className` / `style` | — | échappatoires géométrie (jamais les couleurs) |

### Examples
```jsx
import ParamPill from 'src/components/ui/ParamPill';

<ParamPill label="Revaloriser" value="IPC Annuel" on onClick={toggle} />
<ParamPill label="Perte de chance · 100 %" onClick={toggle} />
```

### Tokens used
`colors.feedback.info.bg/.border/.text` (ON) · `colors.semantic.borderStrong` /
`mutedForeground` (OFF) · `colors.semantic.background` (halo clic + fond OFF
cliqué) · `radius.full` · `typography.scale['body-medium']` / `body`.

**Écarts déclarés** : bord OFF Figma #d6d3d1 rendu `borderStrong` #cbc7c4
(demi-cran du thème, ΔE faible) ; state **Diff** (losange orange
`feedback.warning.base`, teintes #fcf4ef / #d4845a / #a6592e) non couvert -
famille de tokens absente, consignée SIGNALEMENTS §19.

## Sprint / Explos

- Promu le 24/09/2026 (ds-promote, batch « prêts ») : remplace les `Badge`
  info/secondary dévoyés du strip de params de `matterTabContents.jsx`
  (SIGNALEMENTS §13 « ParamPill »).

## Proto demo

`/ui-kit/c/ParamPill`
