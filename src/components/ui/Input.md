---
name: Input
package: plato
status: beta
usage: Labelled form control - a label + optional helper wrapping an input slot
source: src/components/ui/Input.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=33541-69574
---

# Input (Field)

Label + optional helper + a slot for the control. In Figma this is the **Field** component whose slot can nest any input; the default slot is a text field. States (error/warning) colour the label only; the helper stays muted.

_Beta - pending steward validation (issue #__)._

## When to use
- Any labelled form control: text fields, and as a wrapper around `Select` / `Textarea` / `Combobox` via the `children` slot.
- Fields needing a helper line and/or an error/warning state on the label.
- Fields flagged AI-generated (`aiGenerated` adds a Sparkles marker on the label).

## When NOT to use
- **A bare input with no label** → render the control directly; the Field exists to pair label + helper with a slot.
- **Buttons, toggles, choices** → `Button`, `Switch`, `Checkbox`, `RadioGroup`.
- **A full error message block** → the Field colours only the *label* on error (helper stays muted); use a callout for a real error banner.

## Props
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

## Examples
```jsx
import Input from '../ui/Input';

<Input label="Nom du dossier" placeholder="Dupont c/ Martin" onChange={setName} />
<Input label="Référence" helperText="Format ANNÉE-NUMÉRO" helperPosition="between" />
<Input label="Email" error helperText="Adresse invalide" value={email} onChange={setEmail} />
<Input label="Type de dossier"><Select value={type} options={TYPES} onChange={setType} /></Input>
```
