---
name: InputGroup
package: plato
status: beta
usage: Field with addons joined inside a single bordered container (icon, prefix, Kbd, button)
source: src/components/ui/InputGroup.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=27510-119942
---

# InputGroup

A single bordered container for the field AND its segments: search icon, `https://` prefix, ⌘ shortcut, validation check, send button. The addons live INSIDE the field border, never joined on the outside.

_Beta - Figma focus/error halos mapped to closest tokens; dedicated halo token candidate for promotion (issue #__)._

## When to use
- Field with a visual prefix/suffix: URL, amount, unit, domain.
- Search with icon and keyboard shortcut (Kbd).
- Inline-validated field (check) or with an embedded action (send button).
- Textarea with toolbar / counter (`blockStart` / `blockEnd`).
- Read-only calculated field (`calculated` state, accent background).

## When NOT to use
- **Simple field with label + helper** - the default `Input` slot is enough.
- **A label / hint above the field** - do NOT recode them: slot the InputGroup into `Input`: `<Input label="…"><InputGroup … /></Input>`. (InputGroup does not compose Input: it's Input, the Field-wrapper, that wraps InputGroup via its `children` slot - same model as Select/Textarea.)
- **Composer / chat zone** - `AssistantComposer`.
- **Button group without a field** - compose `Button`s.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `type` | `text \| textarea` | `text` | |
| `leading` / `trailing` | node | - | inline addons before / after the field (type text) |
| `blockStart` / `blockEnd` | `{ left, right }` | - | block addon rows (type textarea) |
| `error` / `warning` / `disabled` / `calculated` | bool | `false` | states from the set |
| `value` / `defaultValue` / `placeholder` / `onChange` / `onFocus` / `onBlur` / `rows` / `inputProps` | - | - | field pass-through |
| `className` / `style` / `width` | - | - | escape hatches |

Exported helpers: `InputGroupText` (prefix/suffix medium mutedForeground), `InputGroupKbd` (composition alias that renders the `Kbd` primitive - zero duplicated style), `InputGroupCheck` (pill foreground + inverted check). Icons: lucide, color mutedForeground, passed rendered in `leading`/`trailing`. Addon button: `Button` size `xs` / `icon-xs`.

## Examples
```jsx
import Input from '../ui/Input';
import InputGroup, { InputGroupText, InputGroupKbd, InputGroupCheck } from '../ui/InputGroup';
import Button from '../ui/Button';
import { Search } from 'lucide-react';
import { colors } from '../../design-system/tokens';

<InputGroup
  leading={<Search style={{ width: 16, height: 16, color: colors.semantic.mutedForeground, flexShrink: 0 }} strokeWidth={1.75} />}
  trailing={<InputGroupKbd>⌘K</InputGroupKbd>}
  placeholder="Rechercher une pièce" />

<Input label="Site web">
  <InputGroup leading={<InputGroupText>https://</InputGroupText>}
    trailing={<InputGroupCheck />} placeholder="plato.fr" />
</Input>

<InputGroup type="textarea" placeholder="Décrire le problème"
  blockEnd={{
    left: <InputGroupText>0/280 caractères</InputGroupText>,
    right: <Button size="icon-xs" icon={ArrowUp} title="Envoyer" />,
  }} />

<InputGroup calculated value="1 728,00 EUR" trailing={<InputGroupCheck />} />
```
