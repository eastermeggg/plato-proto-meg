---
name: DropZone
package: plato
status: stable
usage: Drag-and-drop / click-to-browse file input surface
source: src/components/ui/DropZone.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=35747-41445
---

# DropZone

The sanctioned "drop a file here / click to browse" affordance - three contexts (panel, inline, rich table empty-state) with default / hover / drop / extraction states handled by the component or forceable via `state`. Any dashed upload area is this component - never a bespoke dashed box.

## When to use
- `context="panel"` - a row centered in a panel or card (e.g. the assistant composer's drop band during a drag).
- `context="inline"` - compact left-aligned row, at the foot of a list or table ("Déposez ou cliquez...").
- `context="empty"` - rich empty-state of a pièces table: icon, title with « parcourez » underlined, description, badges of expected types (`suggestions`), OU separator + `action`.
- States are handled on their own: hover → hover, native drag → drop (the component listens to dragover/drop and surfaces files via `onFiles`). `state` only forces a state (labs, screenshots) or shows `extraction`.

## When NOT to use
- **A plain browse button** with no drop target → `Button` + hidden input.
- **A list of already-dropped files** → table/rows, not a DropZone.
- **The full drop-first import screen** (Figma `start` context) → that's a screen COMPOSITION (DropZone + Doc List + promos), not this component alone.
- **Never** re-roll a dashed box inline - import this.

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `context` | `panel \| inline \| empty` | `panel` | also accepts Figma names `inline-tables` / `tables-empty` |
| `state` | `default \| hover \| drop \| extraction` | auto | forced; otherwise derived from hover / drag |
| `isDragging` | bool | — | drag state driven from outside (equivalent to `state="drop"`) |
| `onClick` | fn | — | click-to-browse |
| `onFiles` | fn(files) | — | dropped files (native drag handled by the component) |
| `labelPrefix` / `labelAction` / `labelSuffix` | string | « Déposez ou {cliquez\|parcourez} pour ajouter … » | structured label; action word is medium info blue (underlined in empty) |
| `label` | string | — | single-piece label (replaces the structured one - legacy) |
| `dropLabel` | string | « Déposez vos fichiers ici » | label of the drop state |
| `description` | string | — | descriptive sentence (empty); legacy alias `sublabel` |
| `suggestions` | [string] | — | secondary badges of expected types (empty) |
| `action` | `{icon, label, onClick}` | — | link below the OU separator (empty) |
| `extractionTitle` / `extractionDescription` | string | « Extraction en cours » | copy of the extraction state |
| `progress` / `progressLabel` | number / string | `0` | `Progress` bar + caption |
| `variant` | `container \| inline` | — | **legacy**: container → empty, inline → inline |

## Examples
```jsx
import DropZone from '../ui/DropZone';

// Panel drop band (composer) - forced state during the parent's drag
<DropZone context="panel" state="drop" />

// Compact table foot
<DropZone context="inline" onFiles={ingest} onClick={browse} />

// Empty-state of a pièces table
<DropZone
  context="empty"
  labelSuffix=" pour ajouter les justificatifs du dossier"
  description="PDF, images, .eml, .msg"
  suggestions={["Bulletins de salaire", "Relevés d'indemnités journalières", 'Autre document ?']}
  action={{ icon: PencilLine, label: 'Saisir manuellement', onClick: openForm }}
  onFiles={ingest}
/>

// Extraction in progress
<DropZone context="empty" state="extraction" progress={40} progressLabel="5/10 documents - Extraction en cours" />
```
