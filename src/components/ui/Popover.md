---
name: Popover
package: plato
status: beta
usage: Rich content anchored to a trigger, dismissed on outside-click / Escape
source: src/components/ui/Popover.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: null
---

# Popover

Floating panel anchored to a trigger, holding rich or interactive content. Surface `popover` with `border`, radius `lg`, elevation `shadows.lg`. Opens on trigger click, closes on outside-click or Escape. Controlled (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`). Promoted from `previews.jsx`, tokenized.

Derived surface: there is no Popover page in the Figma kit (`figmaTodo: a-dessiner`), so the visual is systematized from the existing product popovers (`SaveDestinationPopover`, `JPPopoverCard`), not Figma-attested. See `docs/design-truth.md`.

## When to use
- Interactive or multi-element content anchored to a control (mini-forms, action lists, filters).
- Content that should dismiss on outside-click / Escape without a full modal.

## When NOT to use
- **A plain text hint on hover** → `Tooltip`.
- **A list of actions / commands** → `Dropdown`.
- **A blocking task or confirmation** → `Dialog` / `AlertDialog`.
- **A large side panel** → `Drawer`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `anchor` | node | — | the trigger element |
| `children` | node | — | popover content |
| `open` | bool | — | controlled open state |
| `defaultOpen` | bool | `false` | initial open (uncontrolled) |
| `onOpenChange` | `(open: boolean) => void` | — | open-state change |
| `side` | `top \| bottom` | `bottom` | side relative to trigger |
| `align` | `start \| center \| end` | `start` | alignment along the side |
| `minWidth` | number | `180` | panel min width |

## Examples
```jsx
import Popover from 'src/components/ui/Popover';
import Button from 'src/components/ui/Button';

<Popover anchor={<Button variant="outline" label="Options" />} side="bottom" align="start">
  <div>Quick actions - click outside or press Escape to dismiss.</div>
</Popover>
```
