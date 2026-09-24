---
name: Progress
package: plato
status: beta
usage: Determinate progress bar (0 to 100 %)
source: src/components/ui/Progress.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-29134
---

# Progress

Horizontal determinate bar: `secondary` track, `primary` fill whose width tracks the value. The Figma set steps from 0 % to 100 % in increments of 10; in code, `value` is continuous.

_Beta - `caution` tone is a semantic proposal pending steward validation (issue #85)._

## When to use
- Measurable progress: upload, ingestion de pièces, import completion.
- Usage gauge (e.g. weekly licence usage) when the value is known.
- In the footer of an `Item` (the Figma .Item Footer slot uses it as-is).

## When NOT to use
- **Indeterminate wait** → `Spinner`.
- **Discrete steps** (1/2/3) → stepper, not a continuous bar.
- **Score / rating** → dedicated component; the bar implies temporal progress.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `value` | number | `0` | current value |
| `max` | number | `100` | upper bound |
| `width` | number \| string | `400` | Figma variant width; pass `'100%'` for fluid use |
| `size` | `md \| sm` | `md` | `md` full height (Figma) · `sm` compact gauges (sidebar quota, rows) |
| `tone` | `default \| caution \| warn \| muted` | `default` | `default` primary · `caution` pre-alert (semantic proposal) · `warn` alert · `muted` discreet progress |
| `label` | string | — | aria-label |
| `className` / `style` | — | — | passthrough |

## Examples
```jsx
import Progress from 'src/components/ui/Progress';

<Progress value={40} />
<Progress value={70} width="100%" label="Import des pièces" />
<Progress value={100} />
// Quota gauge (WeeklyUsageCard): compact, tone per tier
<Progress value={92} size="sm" width="100%" tone="warn" label="Usage hebdomadaire" />
```
