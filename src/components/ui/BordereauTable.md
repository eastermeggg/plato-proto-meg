---
name: BordereauTable
type: domain
status: pending
usage: The bordereau de pièces table - real instance of the custom table system
description: >
  Table métier « bordereau de pièces » : arborescence dossiers/pièces, tri,
  sélection multiple (barre d'actions inversée sombre), menus contextuels,
  fusion/découpage. Instance réelle du système de tables custom - migrera
  vers les familles ui/tables/.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36554-7670
file: src/components/pieces/BordereauTable.js
inventoryId: BordereauTable
composes: [CategoryHeader, PieceRow, RowContextMenu, MoveToFolderModal, DeleteWarningModal]
tokens: [colors.semantic, typography.fontFamily.mono]
lastValidated: 2026-09-23
---

# BordereauTable

> **Type** Domain · **Status** Pending (2026-09-23) · **Usage** bordereau de pièces du dossier
> **Figma** [Row Bordereau, ComponentTable 36554:7670](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36554-7670) · **File** `src/components/pieces/BordereauTable.js`

La table des pièces du dossier : arborescence de dossiers, rangées de pièces
(dont piles découpées et rangées en cours de traitement), tri par colonnes,
sélection multiple avec barre d'actions inversée (fond encre), menus
contextuels, modales de déplacement/renommage/suppression.

## Pattern / Variants / Examples

### When to use
- L'onglet Pièces d'un dossier - c'est LA table du bordereau, avec ses
  mutations (`setPieces` / `setCategories`).

### When NOT to use
- **Un listing simple de documents** → composer les familles
  `ui/tables/RowDocuments` / `RowFolders`.
- **Le bordereau dans un acte généré** → rendu documentaire, pas cette table.

### Props (principales)
`pieces` / `categories` + `setPieces` / `setCategories` ·
`onOpenPiecePreview` · `onAddFiles` / `onImportEmails` · `onAskChato`
(sélection → contexte du chat) · `onFusePieces` · `onToggleDocSplit` /
`onBulkToggleDocSplit` / `onRequestDocSplit` · `reviewZone` (zone
« À vérifier ») · `forceExpandAll` · `initialExpandedIds`.

### Tokens used
Tokens sémantiques + mono 11 uppercase (en-têtes de colonnes) ; barre de
sélection : fond `foreground` + typographie `cream`.

## Sprint / Explos

- Instance réelle du système de tables custom (`docs/table-system.md`) : la
  famille canonique `ui/tables/RowBordereau.js` est portée depuis le même
  nœud - la migration de cette table vers les familles est le chantier
  staged.
- Split docs : rangées plates classées, pas de bandeau de groupe (memory
  `project_split_docs_no_folder`).

## Proto demo

`/ui-kit/c/BordereauTable` — démo interactive sur données locales (2
dossiers, 4 pièces).
