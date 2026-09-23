---
name: CiteRow
type: primitive
status: pending
usage: Une ligne du rail « Extraits cités » du Doc Preview
description: >
  Atome du Doc Preview : ligne de citation (px-16 py-14, gap-12) - pastille
  numéro ronde 20 + eyebrow PAGE (mono 11 uppercase) + extrait 2 lignes
  (12/16, tracking 0.12). États : default (blanc) · hover (accent) · active
  stone (pastille foreground pleine, dégradé cream→blanc, liseré 2px).
  CitesPanel (37375:9168) la compose sous son header « EXTRAITS CITÉS ».
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37375-8836
file: src/components/preview/PreviewAtoms.js
inventoryId: CiteRow
states: [default, hover, active]
tokens: [colors.semantic.cream, colors.semantic.foreground, typography.fontFamily.mono]
lastValidated: 2026-09-23
---

# CiteRow

> **Type** Primitive · **Status** Pending · **Usage** ligne du rail citations
> **Figma** [37375:8836](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37375-8836) · **File** `src/components/preview/PreviewAtoms.js`

## Pattern / Variants / Examples

### When to use
- Une référence citée dans le rail « Extraits cités » (via `CitesPanel`).

### When NOT to use
- Une liste de documents → `Item` / Doc List.
- Une citation inline dans un acte → badges pièce / `JPPill`.

### Props
`index` · `page` · `text` · `active` · `onClick` · `innerRef` · `ariaLabel`.
`CitesPanel` : `items` `[{ page, text }]` · `active` · `onGo` · `width` · `title`.

### Examples
```jsx
import { CitesPanel } from 'src/components/preview/PreviewAtoms';
<CitesPanel items={cites} active={activeIdx} onGo={goToCite} width={280} />
```

### Tokens used
Mono IBM Plex (eyebrow PAGE) · `cream` / `foreground` (pastilles, actif) ·
`border-subtle` (filets).

## Sprint / Explos
- Extrait de PreviewPanel le 23/09 (chantier atomes Doc Preview).

## Proto demo
`/ui-kit/c/CiteRow` - sandbox live (citation active).
