---
name: Textarea
package: plato
status: stable
usage: Resizable multi-line text area (label + helper + error)
source: src/components/ui/Textarea.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-31164
---

# Textarea

Multi-line text area with vertical resize, mirror of `Input` (card fill, border, error state). Optional label and helper. Promoted from `previews.jsx`, tokenized. Replaces raw `<textarea>`.


## When to use
- Long free-text entry: note, motif, description, comment.

## When NOT to use
- **Short single-line entry** → `Input`.
- **Rich chat composer** (toolbar, pièces, tokens) → `AssistantComposer`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `value` | string | `''` | controlled value |
| `placeholder` | string | — | hint text |
| `rows` | `number` | `4` | initial height |
| `label` | string | — | label above |
| `helperText` | string | — | help below the field |
| `error` | bool | `false` | destructive border + helper |
| `disabled` | bool | `false` | disabled (subtle fill) |
| `onChange` | fn | — | native handler |

## Examples
```jsx
import Textarea from 'src/components/ui/Textarea';

<Textarea label="Motif" value={v} onChange={e => setV(e.target.value)} />
<Textarea error helperText="Champ requis" value={v} onChange={...} />
```
