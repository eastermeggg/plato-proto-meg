---
name: PanelHeader
package: plato
type: composite
status: draft
usage: La barre de titre du Doc Preview (h-56) - puce kind + serif | nav + actions
description: >
  Atome du Doc Preview : barre h-56 (pl-16 pr-12, fond blanc, filet bas).
  Gauche : KindIcon (+ eyebrow Badge optionnel) + titre serif 16 (-0.5).
  Droite : nav ‹ i/N › (14) · séparateur 1x20 · actions (gap 7, slot) ·
  Fermer (32, secondary). Variant small (kind PieceSmall) : icône nue 16 +
  titre 14 medium + action texte (« Détail › »).
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37375-8723
file: src/components/preview/PreviewAtoms.js
source: src/components/preview/PreviewAtoms.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: PanelHeader
variants: [piece, jp, email, loi, modele, small]
states: [nav, actions, close]
tokens: [colors.semantic.border, colors.accents, typography.fontFamily.serif]
lastValidated: 2026-09-23
---

# PanelHeader

> **Type** Composite · **Status** Pending · **Usage** barre de titre du Doc Preview
> **Figma** [37375:8723](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37375-8723) · **File** `src/components/preview/PreviewAtoms.js`

## Pattern / Variants / Examples

### When to use
- La barre de titre de tout panneau de préviz (PreviewPanel la compose).
- `small` : le sous-header d'une pièce dans un sujet ligne.

### When NOT to use
- La barre de tête d'une SURFACE → `TopBar`.
- L'en-tête d'un objet niveau 3 → `Niveau3Strip`.

### Props
`kind` / `icon` / `accent` · `eyebrow` (Badge optionnel) · `title` ·
`nav` `{ index, total, onPrev, onNext }` (masqué si total <= 1) · `actions`
(slot : Télécharger primaire, Supprimer destructive-subtle…) · `onClose` ·
`small` + `trailing` (variant PieceSmall).

### Examples
```jsx
import { PanelHeader } from 'src/components/preview/PreviewAtoms';
<PanelHeader kind="piece" icon={FileText} title={doc.name}
  nav={{ index: 2, total: 17, onPrev, onNext }} actions={<DownloadBtn />} onClose={close} />
```

### Tokens used
Serif RL Para (titre, display-xs) · `colors.accents` (puce) ·
`colors.semantic.border` (filet, séparateur).

## Sprint / Explos
- Extrait de PreviewPanel le 23/09 (chantier atomes Doc Preview).

## Proto demo
`/ui-kit/c/PanelHeader` - sandbox live (kind, small, title).
