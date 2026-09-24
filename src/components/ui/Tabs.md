---
name: Tabs
package: plato
status: beta
usage: Inline tabs - medium label + indicator, optional count and icon
source: src/components/ui/Tabs.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36099-45289
---

# Tabs

Inline tabs (variant chosen by the steward): medium label, rest muted with an invisible indicator, active foreground with a primary top-rounded indicator. Per-tab options: icon, count pill, disabled. A `padded` variant adds top padding. The segmented style is not this component → `ButtonGroup`.

_Beta - pending steward validation; SM set (2819:31095) still to arbitrate (issue #__)._

## When to use
- Switch between VIEWS of a single object (dossier tabs, sections of a panel) - content per tab, one active.

## When NOT to use
- **Segmented control** (compact choice in a form, 2-4 options) → `ButtonGroup`.
- **Navigation between pages** → shell components (rule 7 - `TopBar`, `PageHeader` carry their own tabs; don't re-roll a bar).
- **Choosing a form value** → `Select` / `RadioGroup`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `value` / `onChange` | — | — | controlled active tab |
| `options` | `[]` | `[]` | `{ value, label, icon?, count?, disabled? }` |
| `padded` | bool | `false` | Figma padded variant (extra top padding) |
| `gap` | `number` | `16` | spacing between tabs |

## Examples
```jsx
import Tabs from 'src/components/ui/Tabs';

<Tabs
  value={tab}
  onChange={setTab}
  options={[
    { value: 'apercu', label: 'Aperçu' },
    { value: 'pieces', label: 'Pièces', count: 12 },
    { value: 'export', label: 'Export', disabled: true },
  ]}
/>
```
