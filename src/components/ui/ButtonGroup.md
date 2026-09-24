---
name: ButtonGroup
package: plato
status: stable
usage: Segmented button group (related actions, split button)
source: src/components/ui/ButtonGroup.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=28685-126219
---

# ButtonGroup

`Button`s joined into one block: outer rounded corners, squared inner corners, a
a hairline rule between segments. **Composes Button, never re-rolls a button** - the
group clones its children and only touches geometry (radius, borders), never colors.

## When to use
- Inseparable sibling actions (Précédent / Suivant, zoom - / +).
- Split button: primary action + dropdown chevron.
- Compact icon toolbar, horizontal or vertical.

## When NOT to use
- **Persistent exclusive choice** (filters, views) → `Tabs` (`variant="pills"`).
- **Independent actions** → separate `Button`s with a `gap`.
- **Field + attached button** → Input Group pattern (« Button Group & Input »), not yet ported.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `primary \| outline \| secondary` | `primary` | forced onto children without an explicit variant |
| `orientation` | `horizontal \| vertical` | `horizontal` | |
| `size` | `xs \| sm \| md \| lg` | `md` | Button size forced by default |
| `separators` | bool | `true` | hairline rule between segments |
| `ariaLabel` | string | — | label of the `role="group"` |
| `className` / `style` | — | — | passthrough |

## Examples
```jsx
import ButtonGroup from 'src/components/ui/ButtonGroup';
import Button from 'src/components/ui/Button';
import { ChevronDown, Plus } from 'lucide-react';

<ButtonGroup ariaLabel="Actions">
  <Button label="Enregistrer" />
  <Button size="icon" icon={ChevronDown} />
</ButtonGroup>

<ButtonGroup variant="outline">
  <Button label="Jour" />
  <Button label="Semaine" />
  <Button label="Mois" />
  <Button size="icon" icon={Plus} />
</ButtonGroup>

<ButtonGroup variant="secondary" orientation="vertical">
  <Button label="Dupliquer" />
  <Button label="Renommer" />
</ButtonGroup>
```
