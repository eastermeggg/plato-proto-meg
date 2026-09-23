---
name: MetaChip
package: plato
type: primitive
status: draft
usage: Le chip de métadonnée du Doc Preview (14 types canoniques)
description: >
  Atome du Doc Preview : chip h-28 (px-10, radius 6, bord) - icône 14 + label
  12 muted (tracking 0.12) + valeur 12 medium foreground, aside « · … »
  truncable, marqueur ✦ IA, action lien. Deux variants : default (fond
  canvas) · strong (fond cream, chip d'identité). 14 types canoniques dans
  META_CHIP_TYPES (date, pièce, type, découpage, source, juridiction, n°,
  objet, messages, pièces jointes, code, en vigueur, période, web) - un type
  = une icône + un label, partout les mêmes.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37375-9177
file: src/components/preview/PreviewAtoms.js
source: src/components/preview/PreviewAtoms.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: MetaChip
variants: [default, strong]
states: [default, hover, disabled, ai, aside, action]
tokens: [colors.semantic.cream, colors.semantic.border, colors.banner.ai.accent]
lastValidated: 2026-09-23
---

# MetaChip

> **Type** Primitive · **Status** Pending · **Usage** chip de métadonnée du Doc Preview
> **Figma** [37375:9177](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37375-9177) · **File** `src/components/preview/PreviewAtoms.js`

## Pattern / Variants / Examples

### When to use
- La barre méta d'un panneau de préviz (MetaBar h-52) et les en-têtes de cartes
  qui remontent des métadonnées clé-valeur.

### When NOT to use
- Statut / sévérité / catégorie → `Badge`.
- Type de source interactif → `SourceBadge`.

### Props
`type` (clé de `META_CHIP_TYPES` - fournit icon/label/variant) · `icon` /
`label` / `variant` (surcharges) · `value` (ReactNode) · `aside` · `ai` ·
`action` `{ label, onClick }` OU `onClick` (chip entier bouton) · `disabled`.

### Examples
```jsx
import { MetaChip } from 'src/components/preview/PreviewAtoms';
<MetaChip type="date" value="15/03/2023" ai />
<MetaChip type="piece" value="I - MEDICAL · n° 2" />
<MetaChip type="decoupage" aside="rapport_expertise.pdf" action={{ label: 'Ajuster', onClick }} />
```

### Tokens used
`cream` (strong) / `background-canvas` (default) · `border` ·
`banner.ai.accent` (✦) · foreground-secondary / foreground.

## Sprint / Explos
- Extrait de PreviewPanel le 23/09 (chantier atomes Doc Preview).

## Proto demo
`/ui-kit/c/MetaChip` - sandbox live (type, ai, action).
