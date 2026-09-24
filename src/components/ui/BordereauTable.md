---
name: BordereauTable
package: plato
status: beta
usage: The bordereau de pièces table - real instance of the custom table system
source: src/components/pieces/BordereauTable.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36554-7670
---

# BordereauTable

The dossier's pièces table: dossier tree, pièce rows (including split piles and
rows being processed), column sorting, multi-select with an inverted action bar
(ink fill), context menus, move/rename/delete modals.

_Beta - this table must migrate onto the canonical `ui/tables/RowBordereau` families (issue #77)._

## When to use
- A dossier's Pièces tab - this is THE bordereau table, with its mutations (`setPieces` / `setCategories`).

## When NOT to use
- **A simple document listing** → compose the `ui/tables/RowDocuments` / `RowFolders` families.
- **The bordereau inside a generated acte** → documentary render, not this table.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `pieces` / `categories` | array | — | data |
| `setPieces` / `setCategories` | fn | — | mutations |
| `onOpenPiecePreview` | fn | — | open a pièce preview |
| `onAddFiles` / `onImportEmails` | fn | — | ingestion entry points |
| `onAskChato` | fn | — | selection → chat context |
| `onFusePieces` | fn | — | merge selected pièces |
| `onToggleDocSplit` / `onBulkToggleDocSplit` / `onRequestDocSplit` | fn | — | split gestures |
| `reviewZone` | node | `null` | « À vérifier » zone |
| `forceExpandAll` | bool | `false` | force every folder open (search) |
| `initialExpandedIds` | array | `null` | initial expanded folder ids |

## Examples
```jsx
import BordereauTable from '../pieces/BordereauTable';

<BordereauTable
  pieces={pieces}
  categories={categories}
  setPieces={setPieces}
  setCategories={setCategories}
  onOpenPiecePreview={openPreview}
  onAskChato={sendToChat}
/>
```
