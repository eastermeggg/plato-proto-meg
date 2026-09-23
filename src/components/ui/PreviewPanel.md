---
name: PreviewPanel
type: domain
status: pending
usage: One preview shell for every source kind (piece/modele/jp/email/loi/ligne/web)
description: >
  Le panneau de prévisualisation systématisé : une coquille unique (header
  serif, corps, barre méta, rail citations) avec corps et métadonnées
  enfichables par kind de source. Le block (37375:9330) COMPOSE les atomes de
  PreviewAtoms.js : KindIcon (37375:9147), PanelHeader (37375:8738), MetaChip
  (37375:9183), CiteRow (37375:8851) + CitesPanel (37375:9168), Previewer +
  PreviewerPage (37375:8874/8876).
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37375-9330
file: src/components/preview/PreviewPanel.js
inventoryId: PreviewPanel
variants: [piece, modele, jp, email, loi, ligne, web]
states: [embedded, drawer, editing, rail-citations, sujet-ligne]
tokens: [colors.banner.warning, colors.banner.ai, typography.fontFamily.serif, typography.fontFamily.mono]
lastValidated: 2026-09-23
---

# PreviewPanel

> **Type** Domain (gros bloc, nombreux sous-composants) · **Status** Pending (2026-09-23) · **Usage** panneau de préviz unique, pluggable par kind
> **Figma** [37375:8722](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37375-8722) · **File** `src/components/preview/PreviewPanel.js`

Une seule coquille (header serif, corps scrollable, barre méta, rail
citations partagé avec scroll-to-citation), et un corps + des métadonnées
**enfichés par kind de source** via `PREVIEW_KINDS` : piece · modele · jp ·
email · loi · ligne · web.

### Atomes (src/components/preview/PreviewAtoms.js)
Le panneau COMPOSE ses atomes - jamais de redéfinition inline. Chacun a sa
sandbox `/ui-kit/c/<id>` :

| Atome | Figma | Rôle |
|---|---|---|
| `KindIcon` | 37375:9147 | puce 28 (icône 16, fond subtle par kind : indigo / emerald / violet / sand) |
| `PanelHeader` | 37375:8738 | barre de titre h-56 (puce + serif 16 \| nav ‹ i/N › · actions · Fermer) + variant `small` (PieceSmall 37613:19640) |
| `MetaChip` | 37375:9183 | chip de métadonnée h-28, 14 types canoniques (`META_CHIP_TYPES`), variant strong |
| `CiteRow` / `CitesPanel` | 37375:8851 / 9168 | ligne + rail « EXTRAITS CITÉS » (actif stone : pastille foreground, dégradé cream, liseré 2px) |
| `Previewer` / `PreviewerPage` | 37375:8874 / 8876 | corps défilant (Body p-24 fond background) + feuille (bordure noire 10 %, ombre sm, carrée) |

Tous ré-exportés depuis `PreviewPanel.js` (compat imports).

## Pattern / Variants / Examples

### When to use
- **Toute prévisualisation de source** ouverte depuis le chat, le bordereau,
  un poste ou une citation - un seul panneau, jamais un viewer ad hoc.
- Sujet « ligne de poste » : passer `ligne` - le doc devient la pièce
  attachée, un rail édite les valeurs de la ligne (`railLeft` pour comparer).

### When NOT to use
- **Lecture longue d'une décision** → `DecisionDrawer`.
- **Dialogues d'action** (renommer, découper…) → modales centrées, le panneau
  ne porte pas d'actions destructives.
- **Lien web** → `kind="web"` n'ouvre PAS de panneau (lien externe) - c'est
  encodé dans `PREVIEW_KINDS`.

### Props (principales)
`kind` · `source` (descripteur : name, type, date, pages, summary,
provenance, passages…) · `onClose` / `onPrev` / `onNext` / `navIndex` /
`navTotal` · `embedded` (rendu en flux, pour labs/démos) · `onOpenSource`
(navigation croisée) · `ligne` + `railLeft` (sujet ligne).

### Examples
```jsx
import PreviewPanel from 'src/components/preview/PreviewPanel';

<PreviewPanel kind="piece" source={piece} embedded onOpenSource={openSource} />
<PreviewPanel kind="jp" source={jpSource} onClose={close} />
```

### Tokens used
Serif RL Para (header) · mono (chips méta) · `banner.warning.border/accent`
(surlignage citations) · `banner.ai.accent` (marqueur généré par IA) ·
familles badge par kind (`BADGE_ACCENT`).

## Sprint / Explos

- Systématisation : un shell, corps pluggables (memory
  `project_preview_panel_systemized`) ; V2 Figma pixel-perfect (PR #73).
- Ouverture : drawer à GAUCHE du chat via `--chat-offset` (le chat reste
  visible) - lab `/ui-kit/preview-panel`.
- Doublon connu : CHESS_PATHS locaux (avatars) à résorber vers `IVAvatar`.

## Proto demo

`/ui-kit/c/PreviewPanel` — un exemple jouable par kind (piece · modele · jp ·
email · loi · ligne · web) + l'état « Éditer la ligne » (kind `edit`, sujet
ligne de poste : doc = pièce attachée, rail d'édition à droite, Figma
37611:19401) ; le lab complet avec drawer + grip vit à `/ui-kit/preview-panel`.
