---
name: ParamPill
package: plato
status: beta
usage: Togglable calculation-parameter pill (label + value when active)
source: src/components/ui/ParamPill.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/09fvZrDgcY83Js7y864E4v/Plato---Design?node-id=1095-15027
---

# ParamPill

The calculation-parameter pill: PGP rows (« Revalo », « Barème », « Capit »,
« Base journalière ») and the params strip above the composer. OFF = available
parameter (label only, muted); ON = active parameter (info tint, label + value).

_Beta - the Figma set's Diff state (orange diamond) is not covered: the diff tint family has no tokens (issue #__)._

## When to use
- A toggleable calculation parameter whose value shows when it's active
  (revalorisation, barème, taux de capitalisation, base journalière…).
- The params strip of a chat / of a PGP reference row.

## When NOT to use
- Non-interactive status / category → `Badge`.
- Clickable source type (pièce, JP, loi…) → `SourceBadge`.
- Exclusive choice in a form → `RadioGroup` / `Select`, not a row of pills.
- Action (triggers a gesture, not a state) → `Button`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `label` | string | — | parameter label (medium) |
| `value` | node | — | value shown when `on` (regular) |
| `on` | bool | `false` | ON/OFF variant (`aria-pressed`) |
| `icon` | Lucide | `CircleArrowUp` | leading icon; `null` for none |
| `onClick` | fn | — | interaction |
| `title` | string | — | native tooltip |
| `disabled` | bool | — | disabled state |
| `className` / `style` | — | — | geometry escape hatches (never the colors) |

## Examples
```jsx
import ParamPill from 'src/components/ui/ParamPill';

<ParamPill label="Revaloriser" value="IPC Annuel" on onClick={toggle} />
<ParamPill label="Perte de chance · 100 %" onClick={toggle} />
```
