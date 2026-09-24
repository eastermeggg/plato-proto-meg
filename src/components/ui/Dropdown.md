---
name: Dropdown
package: plato
status: stable
usage: Actions / navigation menu anchored to a trigger (Select menu skin)
source: src/components/ui/Dropdown.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-24797
---

# Dropdown

Actions menu opened by a free trigger (Button, icon). Skin strictly identical to the Select menu (steward decision 24/09): composes `SelectMenuPanel` / `SelectMenuItem` / `SelectMenuLabel` with zero styling of its own.


## When to use
- Contextual actions behind a button/icon (rename, move, delete…), with shortcuts and sections.

## When NOT to use
- **Pick a value shown in the field** → `Select`.
- **Right-click context menu positioned at the cursor** → same skin, but free positioning: compose `SelectMenuPanel` (cf. RowContextMenu).
- **Rich non-menu content** → Popover (not promoted).

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `trigger` | node | — | trigger node (a DS `Button`, an icon…) |
| `items` | array | `[]` | `{ key, label, icon?, shortcut?, disabled?, selected?, group?, onSelect? }` |
| `onSelect` | fn | — | global callback `(item) => void` |
| `align` | `start \| end` | `start` | panel anchor edge |
| `width` | number | `200` | panel width |

## Examples
```jsx
import Dropdown from 'src/components/ui/Dropdown';
import Button from 'src/components/ui/Button';

<Dropdown
  trigger={<Button variant="outline" label="Actions" icon={ChevronDown} iconPosition="trailing" />}
  items={[
    { key: 'rename', label: 'Renommer', icon: Edit, shortcut: '⌘R', onSelect: rename },
    { key: 'delete', label: 'Supprimer', icon: Trash2, group: 'Danger', onSelect: remove },
  ]}
/>
```
