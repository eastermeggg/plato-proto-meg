---
name: Select
package: plato
status: beta
usage: Pick one option from a field-anchored dropdown list
source: src/components/ui/Select.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=6729-4904
---

# Select

Field trigger (card fill, input border, chevron-down) + popover panel with mono uppercase group labels and rows that highlight on hover, selection marked by a Check. The panel and rows are exported (`SelectMenuPanel` / `SelectMenuItem` / `SelectMenuLabel`) and reused by the `Dropdown` (same skin, steward decision).

_Beta - pending steward validation (issue #__)._

## When to use
- Pick ONE option from a list (dossier type, format, licence…).
- Groups: `option.group` → sections with a mono uppercase label.

## When NOT to use
- **Actions / navigation in a menu** → `Dropdown` (same panel).
- **Search + free text entry** → `Combobox`.
- **2-3 visible choices** → `RadioGroup` / segmented (`ButtonGroup`).
- **Rich menus** (search, pièce tree, switch, radio, shortcuts) → menus assembled on `SelectMenuPanel`, via the `Dropdown`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `value` / `onChange` | — | — | controlled state |
| `options` | array | `[]` | `{ value, label, icon?, group?, disabled? }` |
| `placeholder` | string | `'Sélectionner…'` | shown when no value |
| `disabled` | bool | `false` | trigger disabled (reduced opacity, subtle fill) |
| `width` | number | `240` | width (Figma: min 64 / max 448) |

Secondary exports: `SelectMenuPanel`, `SelectMenuItem`, `SelectMenuLabel` (the panel skin, consumed by the `Dropdown`).

## Examples
```jsx
import Select from 'src/components/ui/Select';

<Select
  value={type}
  onChange={setType}
  placeholder="Type de dossier"
  options={[
    { value: 'dc', label: 'Dommages corporels', group: 'Spécialités' },
    { value: 'social', label: 'Droit social', group: 'Spécialités' },
  ]}
/>
```
