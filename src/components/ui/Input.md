---
name: Input
package: plato
type: primitive
status: draft
usage: Labelled form control - a label + optional helper wrapping an input slot
description: >
  The Figma "Field" component - a wrapper pairing a label and helper line with a
  slot. The default slot is a text input; the slot can nest a Select, Textarea,
  etc. States (error/warning) colour the label only; the helper stays muted.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=33541-69574
file: src/components/ui/Input.js
source: src/components/ui/Input.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: Input
variants: [vertical, horizontal]
states: [default, error, warning, aiGenerated]
tokens: [colors.semantic.card, colors.semantic.backgroundSubtle, colors.badge.destructive, colors.semantic.foregroundSecondary, typography.scale]
---

# Input (Field)

> **Type** Primitive · **Status** Pending (built) · **Usage** labelled form control
> **Figma** [33541:69574 (Field)](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=33541-69574) · **File** `src/components/ui/Input.js`

Label + optional helper + a slot for the control. In Figma this is the **Field**
component whose slot can nest any input; the default slot is a text field.

## Pattern / Variants / Examples

### When to use
- Any labelled form control: text fields, and as a wrapper around `Select` / `Textarea` / `Combobox` via the `children` slot.
- Fields needing a helper line and/or an error/warning state on the label.
- Fields flagged AI-generated (`aiGenerated` adds a Sparkles marker on the label).

### When NOT to use
- **A bare input with no label** → render the control directly; the Field exists to pair label + helper with a slot.
- **Buttons, toggles, choices** → `Button`, `Switch`, `Checkbox`, `RadioGroup`.
- **A full error message block** → the Field colours only the *label* on error (helper stays muted); use a callout for a real error banner.

### Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `label` | string | — | field label |
| `helperText` | string | — | hint / helper line |
| `layout` | `vertical \| horizontal` | `vertical` | horizontal = (label + helper) \| input |
| `helperPosition` | `below \| between` | `below` | vertical only |
| `error` | bool | `false` | red label (helper stays muted) |
| `warning` | bool | `false` | amber label |
| `aiGenerated` | bool | `false` | Sparkles marker on the label |
| `children` | node | — | **slot**: replaces the default text input |
| `type` / `value` / `defaultValue` / `placeholder` / `onChange` / `disabled` | — | — | default-input pass-through |
| `inputProps` / `className` / `style` / `width` | — | — | escape hatches |

### Examples
```jsx
import Input from '../ui/Input';

<Input label="Nom du dossier" placeholder="Dupont c/ Martin" onChange={setName} />
<Input label="Référence" helperText="Format ANNÉE-NUMÉRO" helperPosition="between" />
<Input label="Email" error helperText="Adresse invalide" value={email} onChange={setEmail} />
<Input label="Type de dossier"><Select value={type} options={TYPES} onChange={setType} /></Input>
```

### Tokens used
`colors.semantic.card` / `backgroundSubtle` (bg, disabled) · `colors.badge.destructive.bg` (error label) · `colors.badge.warning.fg` (warning label) · `colors.semantic.foregroundSecondary` (helper) · `typography.scale`.

## Sprint / Explos

- Figma « Field » (`33541:69574`) : un wrapper à slot - la même Field nappe text input, Select, Textarea.
- Dérive d'inventaire : l'entrée `Input` du JSON était `missing`/`exists:false` alors que le fichier existe (corrigé au passage à la source `.md`).

## Proto demo

`/ui-kit/c/Input` — sandbox : layouts, états error/warning/ai, slot.
