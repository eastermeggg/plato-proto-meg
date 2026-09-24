---
name: Chart
package: plato
status: stable
usage: Data visualization (bars, lines, areas, pies) on the chart ramp
source: src/components/ui/Chart.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-21571
---

# Chart

In-house SVG chart primitive (no library), data-driven, on the `colors.chart` ramp. Eight types: bar, bar-horizontal, bar-stacked, line, area, area-stacked, pie, donut. Fluid width (ResizeObserver), height by prop, with grid, muted axis labels, legend and hover tooltip matching the Figma Chart Subcomponents.

## When to use
- Compact time or categorical series in a card: usage trend, pièce volumes per month, budget breakdown.
- Simple breakdown gauges (`pie` / `donut`, one value per row).
- Multi-series comparison: grouped `bar`, `bar-stacked`, `area-stacked` (colors follow the `colors.chart` ramp, never a local color).

## When NOT to use
- **A single key figure**: that's typography (heading + caption), not a chart.
- **Licence consumption gauge**: `WeeklyUsageCard` (billing) has its own gauge.
- **Radar / radial / step / gradient / negative bars / labels on bars**: mocked up in the set but not covered in V1 — go through `ds-decide` before extending.
- **Tables of exact values**: prefer the table system (`docs/table-system.md`).

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `type` | `'bar' · 'bar-horizontal' · 'bar-stacked' · 'line' · 'area' · 'area-stacked' · 'pie' · 'donut'` | `'bar'` | plot family |
| `data` | `[{ label, values }]` | `[]` | `values`: number or array (multi-series); for pie/donut, 1 value per row |
| `series` | `string[]` | `[]` | series names (legend + tooltip) |
| `height` | `number` | `192` | plot height (Figma Bar/Default) |
| `curved` | `boolean` | `true` | line/area: Curved (smoothing) or Linear |
| `showGrid` | `boolean` | `true` | grid lines (Figma « Lines ») |
| `showLegend` | `boolean` | `false` | legend row below the chart |
| `showTooltip` | `boolean` | `true` | hover tooltip (+ line/area dots, dimming of other bars) |
| `showYAxis` | `boolean` | `false` | Y ticks (« Axes » variant) |
| `showXAxis` | `boolean` | `true` | category labels below the plot |
| `unit` | `string` | `''` | suffix for tooltip values (Figma « kcal ») |
| `valueFormatter` | `(n) => string` | `toLocaleString('fr-FR')` | value format |
| `className` / `style` | — | — | escape hatches (same rules as Badge) |

## Examples
```jsx
import Chart from 'src/components/ui/Chart';

// Simple bars (Chart / Bar / Default)
<Chart type="bar" data={[
  { label: 'Jan', values: 125 }, { label: 'Fév', values: 66 },
  { label: 'Mar', values: 97 }, { label: 'Avr', values: 51 },
]} />

// Stacked multi-series areas + legend + tooltip
<Chart type="area-stacked" series={['Pièces', 'Conclusions']} showLegend
  data={[
    { label: 'Jan', values: [40, 24] }, { label: 'Fév', values: [30, 13] },
    { label: 'Mar', values: [50, 38] }, { label: 'Avr', values: [47, 39] },
  ]} unit="docs" />

// Breakdown donut
<Chart type="donut" height={192} showLegend data={[
  { label: 'Dommages corporels', values: 45 },
  { label: 'Droit social', values: 30 },
  { label: 'Autres', values: 25 },
]} />
```
