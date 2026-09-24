---
name: Combobox
package: plato
status: beta
usage: Search-driven picker - type to filter a long list
source: src/components/ui/Combobox.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-22160
---

# Combobox

Raw shadcn mapped onto the tokens, no custom design (steward decision): button trigger (value/placeholder + chevrons-up-down) + the Select panel with a Command Search row at the top + filtered list (Select rows, Check on the selection) + empty state.

_Beta - pending steward validation (issue #__)._

## When to use
- Pick ONE option from a LONG list (postes, juridictions, members) where typing filters.

## When NOT to use
- **Short list (< ~10)** → `Select`.
- **Actions** → `Dropdown`.
- **Cross-source search** → command palette (separate pattern).

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `value` / `onChange` | — | — | controlled state |
| `options` | `[{ value, label, icon?, disabled? }]` | `[]` | option list |
| `placeholder` | string | `'Rechercher…'` | trigger + input |
| `emptyText` | string | `'Aucun résultat.'` | empty state |
| `width` | number | `280` | width |
| `disabled` | `boolean` | `false` | trigger disabled |

## Examples
```jsx
import Combobox from 'src/components/ui/Combobox';

<Combobox value={poste} onChange={setPoste} placeholder="Rechercher un poste…"
  options={POSTES.map(p => ({ value: p.id, label: p.label }))} />
```
