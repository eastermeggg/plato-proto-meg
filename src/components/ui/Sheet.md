---
name: Sheet
package: plato
status: beta
usage: Generic panel that slides in from an edge for secondary content
source: src/components/ui/Sheet.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: null
---

# Sheet

Lightweight panel sliding in from any edge (`right` / `left` / `top` / `bottom`) over a `overlay` scrim, surface `card`, elevation `shadows.xl`. Dismisses on scrim-click and Escape. Positioned `absolute inset:0`, so it fills its nearest positioned ancestor (sandbox canvas, screen container) rather than the viewport - a "trapped" overlay. Promoted from `previews.jsx`, tokenized.

Derived surface: there is no Sheet page in the Figma kit (`figmaTodo: a-dessiner`), so the visual is derived from tokens, not Figma-attested. See `docs/design-truth.md`.

## When to use
- Secondary content from any edge, incl. `top` / `bottom` sheets that `Drawer` does not cover.
- A quick, generic slide-out where the heavy master panel would be overkill.

## When NOT to use
- **The product master side panel** (canonical widths, `--chat-offset`, `DrawerSection`, viewport-fixed) → `Drawer`.
- **A modal form / content dialog** → `Dialog`.
- **A destructive confirmation** → `AlertDialog`.
- **A small anchored panel** → `Popover`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `open` | bool | — | visibility |
| `side` | `right \| left \| top \| bottom` | `right` | entry edge |
| `onClose` | `() => void` | — | scrim-click / Escape / close button |
| `title` | string | — | header title |
| `children` | node | — | panel body |
| `width` | number | `360` | width for `right` / `left` |
| `height` | number | `320` | height for `top` / `bottom` |

## Examples
```jsx
import Sheet from 'src/components/ui/Sheet';

<Sheet open={open} side="right" title="Filters" onClose={() => setOpen(false)}>
  <p>Secondary content.</p>
</Sheet>
```
