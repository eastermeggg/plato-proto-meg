---
name: Separator
package: plato
status: stable
usage: Divider rule - horizontal, vertical, or with a mono label
source: src/components/ui/Separator.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-30252
---

# Separator

A hairline rule from the `border` token in three shapes: full-width horizontal, horizontal with a centered uppercase mono label, and vertical (aligned to text). Replaces raw `<hr>` and inline hairlines.


## When to use
- Separate two blocks / list groups (horizontal).
- Separate two inline elements (vertical, e.g. a toolbar).
- Discreet section title: `label` shape (uppercase mono flanked by rules).

## When NOT to use
- **A container's border** → `border` Tailwind on the container, not a Separator.
- **Spacing alone** → use the gap / margin, not an invisible rule.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `orientation` | `horizontal \| vertical` | `'horizontal'` | rule direction |
| `label` | string | — | centered mono label (horizontal only) |
| `className` / `style` | — | — | passthrough |

## Examples
```jsx
import Separator from 'src/components/ui/Separator';

<Separator />
<Separator label="Métadonnées" />
<Separator orientation="vertical" />
```
