# DropZone

Plato file-drop component. Promoted faithfully from the validated inline preview
in `src/components/ui-kit/previews.jsx`. Hover / drag-over styling comes from the
global `.dropzone-container` / `.dropzone-inline` / `.dropzone-drop` rules in
`src/index.css`.

## Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `'container' \| 'inline'` | `'container'` | container = large dashed box; inline = compact dashed row |
| `label` | string | — | primary text |
| `sublabel` | string | — | secondary text (container variant) |
| `onClick` | fn | — | click-to-browse |
| `onFiles` | fn | — | files dropped (wire when real upload exists) |
| `isDragging` | bool | — | drives the `dropzone-drop` drag state |

## Usage

```jsx
import DropZone from '../ui/DropZone';

<DropZone variant="inline" label="Joindre un justificatif" onClick={addFile} />
```

Don't re-roll a dashed upload area inline — import this.
