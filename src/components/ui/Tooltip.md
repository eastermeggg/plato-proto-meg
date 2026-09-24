---
name: Tooltip
package: plato
status: beta
usage: Short text hint revealed on hover / focus of a trigger
source: src/components/ui/Tooltip.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: null
---

# Tooltip

Small dark bubble revealing a short hint on hover and keyboard focus. Surface is `foreground` with `primaryForeground` text (theme-aware). Positioned `top` / `bottom` / `left` / `right` of the trigger. Promoted from `previews.jsx`, tokenized.

Derived surface: there is no Tooltip page in the Figma kit (`figmaTodo: a-dessiner`), so the visual is derived from tokens, not Figma-attested. See `docs/design-truth.md`.

## When to use
- One-word or one-line hints on icon-only buttons and dense affordances.
- Clarifying a truncated label or an ambiguous control.

## When NOT to use
- **Rich, interactive, or multi-line content** → `Popover`.
- **Essential information** the user must read → put it in the layout; tooltips are hover-only and skipped on touch.
- **Validation / error messages** → inline field text.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `content` | node | — | hint text; empty renders the trigger alone |
| `side` | `top \| bottom \| left \| right` | `top` | position relative to trigger |
| `children` | node | — | the trigger element |

## Examples
```jsx
import Tooltip from 'src/components/ui/Tooltip';
import Button from 'src/components/ui/Button';

<Tooltip content="Apply changes to the dossier" side="top">
  <Button variant="outline" label="Save" />
</Tooltip>
```
