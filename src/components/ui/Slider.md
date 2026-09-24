---
name: Slider
package: plato
status: beta
usage: Horizontal slider - rail, filled range, draggable handle(s); single or range
source: src/components/ui/Slider.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-30565
---

# Slider

Select a value (or a range) on a continuous axis: rail, filled range, draggable handle(s), single or range. Real interactions - mouse / touch drag, rail click (the nearest handle jumps), full keyboard, ARIA `role="slider"` per handle.

_Beta - focus halo now the dedicated `shadows.focusRing` token (arbitrage 24/09, board `/ui-kit/arbitrages`); handle-shadow gap (`shadows.md` candidate) still open (issue #81)._

## When to use
- Set a continuous or stepped numeric value: percentage, amount, zoom, threshold.
- Select a min-max range (`range`): fourchette d'honoraires, seniority period.

## When NOT to use
- **Exact value to type** → `Input` / `InputGroup` (the slider is approximate on drag).
- **Non-interactive progress gauge** → `Progress`.
- **Choice among a few discrete options** → `RadioGroup` / `Tabs`.
- **Binary toggle** → `Switch`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `value` | number \| `[number, number]` | — | controlled (with `onChange`) |
| `defaultValue` | same | middle of the rail | uncontrolled |
| `min` / `max` / `step` | number | 0 / 100 / 1 | decimal `step` supported |
| `range` | bool | `false` | two handles, value `[low, high]`, no crossing |
| `onChange` | fn(value) | — | on every step (drag, keyboard, rail click) |
| `onChangeCommitted` | fn(value) | — | on pointer release |
| `disabled` | bool | `false` | reduced opacity, interactions off |
| `ariaLabel` | string | `Curseur` | suffixed minimum / maximum in range |
| `className` / `style` / `width` | — | — | escape hatches (fluid width by default) |

Keyboard (per focusable handle): left/down arrows -1 step, right/up +1 step, PageDown / PageUp by 10 % of the range, Home / End to bounds. Hover, drag, and disabled states are absent from the Figma set and shipped anyway (drag = grab cursor, disabled aligned on InputGroup).

## Examples
```jsx
import Slider from '../ui/Slider';

<Slider defaultValue={50} onChangeCommitted={save} />
<Slider range defaultValue={[25, 75]} onChange={setFourchette} />
<Slider value={quotite} min={0} max={100} step={5} onChange={setQuotite} />
<Slider defaultValue={30} disabled />
```
