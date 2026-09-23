---
name: KindIcon
package: plato
type: primitive
status: draft
usage: La puce d'identité du Doc Preview - icône 16 sur fond subtle par kind
description: >
  Atome du Doc Preview : carré arrondi 6 (28px, padding 6) portant l'icône 16
  du kind sur son fond subtle. Accents canoniques via colors.accents :
  piece / modele / email indigo · jp emerald · loi violet · ligne sand ·
  web neutre. Rendu par PanelHeader ; jamais une puce colorée inline.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37375-9147
file: src/components/preview/PreviewAtoms.js
source: src/components/preview/PreviewAtoms.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: KindIcon
variants: [piece, modele, email, jp, loi, ligne, web]
tokens: [colors.accents.indigo, colors.accents.emerald, colors.accents.violet, colors.accents.sand, colors.semantic.backgroundSubtle]
lastValidated: 2026-09-23
---

# KindIcon

> **Type** Primitive · **Status** Pending · **Usage** puce d'identité du Doc Preview
> **Figma** [37375:9147](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37375-9147) · **File** `src/components/preview/PreviewAtoms.js`

## Pattern / Variants / Examples

### When to use
- La puce de kind d'un panneau de préviz (PanelHeader) ou d'une carte source.

### When NOT to use
- Une pilule source interactive → `SourceBadge`.
- Un badge de statut / catégorie → `Badge`.

### Props
`kind` (clé de `KIND_ACCENTS`) · `icon` (composant Lucide) · `accent`
(surcharge `{ bg, fg }`).

### Examples
```jsx
import { KindIcon } from 'src/components/preview/PreviewAtoms';
<KindIcon kind="jp" icon={Scale} />
```

### Tokens used
`colors.accents.*` (subtle + text) - les mêmes valeurs que les variables Figma.

## Sprint / Explos
- Extrait de PreviewPanel le 23/09 (chantier atomes Doc Preview).

## Proto demo
`/ui-kit/c/KindIcon` - sandbox live (kind).
