---
name: Calendar
package: plato
status: stable
usage: Pick a date from a monthly grid (forms, filters, deadlines)
source: src/components/ui/Calendar.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-19886
---

# Calendar

Monthly date-picker grid: week starting on Monday, French labels (`Intl`), previous/next month navigation, greyed-out outside days, today marked, selected day on a primary background. Single mode only (the Figma set does not mock up a range).

## When to use
- Pick ONE date: deadline, hearing date, pièce date, time filter.
- In a popover below a date field, or placed inside a filter panel.
- « Custom days » grid (per-day sub-label): amount / load per day below the number (`dayDetail`).

## When NOT to use
- **Date range** : not mocked up in the Figma set, not implemented. Ask for the mockup before extending the component (ds-decide rule).
- **Free-form date entry** : that's an `Input` with a mask; the Calendar comes as a complement (popover), not a replacement.
- **Agenda / planning view with placed events** : the set's `.Calendar Event Slot` (6976:59893) is a separate block, not covered here.
- **Month/year dropdown navigation** : the `Date/Month/Year dropdown` (6912:3855) header variants are not implemented (V1 = arrows only).

## Props
| Prop | Type | Default | Notes |
|------|------|--------|------|
| `value` | `Date` | `null` | selected date (controlled) |
| `onChange` | `(Date) => void` | — | click on a day |
| `month` / `onMonthChange` | `Date` / `(Date) => void` | — | controlled displayed month (first of the month) |
| `defaultMonth` | `Date` | `value` or today | initial month (uncontrolled) |
| `mode` | `'single'` | `'single'` | only mode mocked up |
| `size` | `'default'` · `'large'` | `'default'` | cell size (Figma Size) |
| `dayDetail` | `(date) => string` | — | per-day sub-label → switches to Size=Custom days |
| `disabled` | `(date) => boolean` | — | non-clickable days (Disabled state) |
| `showOutsideDays` | `boolean` | `true` | greyed-out outside days or empty cells |
| `className` / `style` | — | — | escape hatches (same rules as Badge) |

## Examples
```jsx
import Calendar from 'src/components/ui/Calendar';

// Simple selection
<Calendar value={date} onChange={setDate} />

// Controlled month + weekends disabled
<Calendar
  value={date}
  onChange={setDate}
  month={month}
  onMonthChange={setMonth}
  disabled={(d) => d.getDay() === 0 || d.getDay() === 6}
/>

// « Custom days » grid: amount per day
<Calendar size="large" value={date} onChange={setDate}
  dayDetail={(d) => (d.getDate() % 3 === 0 ? '100 EUR' : '')} />
```
