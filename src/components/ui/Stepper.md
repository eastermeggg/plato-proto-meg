---
name: Stepper
package: plato
status: beta
usage: Horizontal step indicator for multi-step flows (modal wizards)
source: src/components/ui/Stepper.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/09fvZrDgcY83Js7y864E4v/Plato---Design?node-id=4226-63220
---

# Stepper

Horizontal progression indicator for wizards: one numbered circle per step, joined by hairline connectors, a medium label beside each circle. State is DERIVED from a single `current` index (done / active / upcoming) - the component never holds its own progression state.

_Beta - pending steward validation (issue #__)._

## When to use
- Header of a multi-step modal (e.g. « Nouveau dossier » : Nom du dossier · Pièces client · Pièces adverses).
- Any linear 2-5 step flow where the user must see where they are and what remains.

## When NOT to use
- **Vertical / reasoning progressions** → `ReasoningStepper` (chat traces).
- **Tabs between peer views** (no order, freely switchable) → `Tabs`.
- **Progress of a background task** → `Progress` / `Spinner`.
- **More than ~5 steps** - the horizontal row stops scanning well; rethink the flow.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `steps` | `[{ label }]` | `[]` | ordered step descriptors |
| `current` | `number` | `0` | index of the active step; states derive from it (done < current, active === current, upcoming > current) |
| `onStepClick` | `(index) => void` | — | if set, DONE steps become clickable (backwards nav only); upcoming steps are never clickable |
| `className` / `style` | — | — | geometry escape hatches only, never colors |

## Examples
```jsx
import Stepper from 'src/components/ui/Stepper';

<Stepper
  steps={[{ label: 'Nom du dossier' }, { label: 'Pièces client' }, { label: 'Pièces adverses' }]}
  current={1}
  onStepClick={(i) => setStep(i)}
/>
```
