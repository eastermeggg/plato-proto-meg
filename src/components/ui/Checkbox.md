---
name: Checkbox
package: plato
status: stable
usage: Case à cocher - off / on / indéterminé (tri-state)
source: src/components/ui/Checkbox.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-21779
---

# Checkbox

Case à cocher tri-state (off / on / indéterminé). Coché = fond + bordure foreground, glyphe blanc. Remplace les cases inline copiées (SaveDestinationPopover, JPAddStepper, ImportEmailDialog).


## When to use
- Sélection multiple indépendante (liste, filtres, options).
- État parent partiel d'un groupe → `indeterminate`.

## When NOT to use
- **Choix exclusif** → `RadioGroup` / `RadioPricing`.
- **On/off d'un réglage immédiat** → `Switch`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `checked` | `boolean` | `false` | état coché |
| `indeterminate` | `boolean` | `false` | état partiel (Minus) |
| `label` | string | — | libellé cliquable |
| `disabled` | `boolean` | `false` | désactivé |
| `onChange` | `(next: boolean) => void` | — | changement d'état |

## Examples
```jsx
import Checkbox from 'src/components/ui/Checkbox';

<Checkbox checked={v} label="Pièces adverses" onChange={setV} />
<Checkbox indeterminate label="Tout sélectionner" onChange={selectAll} />
```
