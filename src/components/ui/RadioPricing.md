---
name: RadioPricing
package: plato
status: stable
usage: Radio card option for licence / pricing choices
source: src/components/ui/RadioPricing.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36915-6122
---

# RadioPricing

Radio option card for licence choices: the bare shadcn RadioGroup doesn't carry the card (border, fill, shadow, icon, description), hence this extension. Selected state gets a background fill, a strong border, and a shadow.

## When to use
- **Exclusive** choice among a few rich options (licences PRO/MAX/MAX+, plans, billing destinations).
- Onboarding `/welcome` (licence step) and billing settings.

## When NOT to use
- **Multiple choice** → checkboxes.
- **2 on/off states** → `Switch`.
- **Long list of simple options** → select/dropdown, not a stack of cards.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `label` | string | `'Radio label'` | medium label |
| `description` | string | `'Description'` | muted description (single line) |
| `icon` | Lucide icon | `Receipt` | leading icon |
| `selected` | bool | `false` | radio state (managed by the parent) |
| `onSelect` | fn | — | selection callback |
| `disabled` | bool | `false` | reduced opacity, not clickable |
| `pinHover` | bool | `false` | forces the hover visual (demos) |
| `width` | number \| string | `'100%'` | card width (Figma: 409) |

## Examples
```jsx
import RadioPricing from 'src/components/ui/RadioPricing';

<RadioPricing label="Licence PRO" description="Usage individuel - 1 poste"
  selected={choice === 'pro'} onSelect={() => setChoice('pro')} />
<RadioPricing label="Licence MAX" description="Cabinet - postes illimités"
  selected={choice === 'max'} onSelect={() => setChoice('max')} />
```
