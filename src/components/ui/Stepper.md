---
name: Stepper
type: primitive
status: validated
usage: Horizontal step indicator for multi-step flows (modal wizards)
description: >
  Horizontal stepper: numbered 24px circles joined by 40px connector lines,
  with a label per step. Three derived states (done / active / upcoming) from a
  single `current` index. Done steps show a check on success-text green; the
  active step is a filled primary circle. Optionally clickable backwards only.
figma: https://www.figma.com/design/09fvZrDgcY83Js7y864E4v/Plato---Design?node-id=4226-63220
file: src/components/ui/Stepper.js
inventoryId: Stepper
states: [done, active, upcoming]
tokens: [colors.semantic.primary, colors.semantic.primaryForeground, colors.semantic.border, colors.semantic.mutedForeground, colors.semantic.foreground, colors.feedback.success.text, typography.fontFamily.mono]
lastValidated: 2026-09-23
---

# Stepper

> **Type** Primitive · **Status** Validated (2026-09-23) · **Usage** horizontal step indicator for multi-step flows
> **Figma** [4226:63220](https://www.figma.com/design/09fvZrDgcY83Js7y864E4v/Plato---Design?node-id=4226-63220) · **File** `src/components/ui/Stepper.js`

Horizontal progression indicator for wizards: one 24px numbered circle per
step, joined by 40px hairline connectors, a 14/20 medium label beside each
circle. State is DERIVED from a single `current` index - the component never
holds its own progression state.

## Pattern / Variants / Examples

### When to use
- Header of a multi-step modal (e.g. « Nouveau dossier » : Nom du dossier ·
  Pièces client · Pièces adverses).
- Any linear 2-5 step flow where the user must see where they are and what
  remains.

### When NOT to use
- **Vertical / reasoning progressions** → `ReasoningStepper` (chat traces).
- **Tabs between peer views** (no order, freely switchable) → Tabs.
- **Progress of a background task** → `Progress` / `Spinner`.
- **More than ~5 steps** - the horizontal row with 40px connectors stops
  scanning well; rethink the flow.

### States (derived from `current`)
| State | Circle | Number / icon | Label |
|-------|--------|---------------|-------|
| `done` (i < current) | filled `success.text` (#064e3b) | white `Check` 12px | `mutedForeground` |
| `active` (i === current) | filled `primary` | number, mono 11 `primaryForeground` | `foreground` + `aria-current="step"` |
| `upcoming` (i > current) | 1px `border` outline | number, mono 11 `mutedForeground` | `mutedForeground` |

Geometry: circle 24px (full radius) · circle↔label gap 8 · step↔connector
gap 12 · connector 40 × 1px `border`. Numbers are IBM Plex Mono Medium 11
uppercase; labels Inter Medium 14/20.

### Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `steps` | `[{ label }]` | `[]` | ordered step descriptors |
| `current` | `number` | `0` | index of the active step |
| `onStepClick` | `(index) => void` | — | if set, DONE steps become clickable (backwards nav only); upcoming steps are never clickable |
| `className` / `style` | — | — | geometry escape hatches only, never colors |

### Examples
```jsx
import Stepper from 'src/components/ui/Stepper';

<Stepper
  steps={[{ label: 'Nom du dossier' }, { label: 'Pièces client' }, { label: 'Pièces adverses' }]}
  current={1}
  onStepClick={(i) => setStep(i)}
/>
```

### Tokens used
`colors.feedback.success.text` (done circle) · `colors.semantic.primary` /
`primaryForeground` (active) · `colors.semantic.border` (upcoming outline +
connectors) · `colors.semantic.foreground` / `mutedForeground` (labels) ·
`colors.semantic.white` (check) · `typography.fontFamily.mono` (numbers)

## Sprint / Explos

- Extracted 09/2026 from the « Create Matter - New Dossier Modal » Figma
  section (3698:29234) : the 3-step « Nouveau dossier » modal is its first
  consumer (`src/components/ui-kit/import/CreateMatterModal.js`, lab
  `/ui-kit/import-dossier`).
- `src/components/jp/JPAddStepper.js` is an older ad-hoc stepper (JP flow,
  different anatomy - dots + progress line); candidates for convergence later.

## Proto demo

Playable in the « Import email » lab: `/ui-kit/import-dossier` → launcher
« Nouveau dossier (3 étapes) » - the modal header drives all three states.
