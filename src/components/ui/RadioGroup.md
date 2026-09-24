---
name: RadioGroup
package: plato
status: beta
usage: Mutually exclusive choice within a small set of options
source: src/components/ui/RadioGroup.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-29275
---

# RadioGroup

Single choice among a short, visible set of options. Selected = `foreground` ring with a filled `foreground` dot. Two variants from the Figma kit: `list` (radio + label + optional description) and `card` (each option in a bordered box, selected option takes the `foreground` border). Promoted from `previews.jsx`, tokenized.

## When to use
- Exclusive selection where all options should stay visible (2-5 options).
- Options that benefit from a supporting `description` line → `card` variant.

## When NOT to use
- **Many options / space-constrained** → `Select`.
- **Multiple independent selections** → `Checkbox`.
- **On/off of a single immediate setting** → `Switch`.
- **Pricing plan selector** → the dedicated `RadioPricing` component.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `value` | string | — | selected option value |
| `options` | `{ value, label, description?, disabled? }[]` | `[]` | option set |
| `variant` | `list \| card` | `list` | `card` = bordered boxes |
| `name` | string | `'radio'` | radio group name |
| `disabled` | bool | `false` | disables the whole group |
| `onChange` | `(value: string) => void` | — | selection change |

## Examples
```jsx
import RadioGroup from 'src/components/ui/RadioGroup';

<RadioGroup
  value={billing}
  onChange={setBilling}
  variant="card"
  options={[
    { value: 'monthly', label: 'Monthly billing', description: 'Cancel anytime.' },
    { value: 'yearly',  label: 'Yearly billing',  description: 'Save 20%.' },
  ]}
/>
```
