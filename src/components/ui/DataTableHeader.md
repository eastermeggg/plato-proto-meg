---
name: DataTableHeader
package: plato
status: stable
usage: Column header cell of the custom Plato tables (text, sort button, select checkbox)
source: src/components/ui/DataTableHeader.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2768-27447
---

# DataTableHeader

Column header cell (mono medium uppercase) of the custom Plato tables - the sibling of `DataTableCell`. At rest it carries the bottom hairline; on hover the hairline disappears and the background shifts to a lightened cream.

## When to use
- At the head of **every column** of a Plato domain table (bordereau, chiffrage, cotisations, relevé d'heures…).
- Sortable column → `type="button"` (label + arrow-up-down, `onClick`).
- Selection column → `type="checkbox"` (`checked` + `onChange`).
- The « Section Captions » band of the cotisations (PIÈCE · OPÉ. + value column label in `rightAlign`).

## When NOT to use
- **A section header inside the table body** → `DataTableCell type="SectionBandeau"`.
- **A complex sort with a menu** → compose with a real menu; this cell only carries a single click.
- **A shadcn `<th>`** → Plato tables are custom (docs/table-system.md).

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | `text \| button \| checkbox` | `text` | header kind |
| `label` | string | — | label (text / button), ellipsis-truncated |
| `rightAlign` | bool | `false` | aligns right (amount columns) |
| `checked` / `onChange` | bool / fn | — | checkbox state |
| `onClick` | fn | — | sort click (button) |
| `pinHover` | bool | `false` | forces the hover visual (demos) |
| `width` | number | `144` | column width (`36` for checkbox) |

## Examples
```jsx
import DataTableHeader from 'src/components/ui/DataTableHeader';

<DataTableHeader type="checkbox" checked={all} onChange={setAll} />
<DataTableHeader label="Dossier" />
<DataTableHeader type="button" label="Date" onClick={sortByDate} />
<DataTableHeader label="Montant" rightAlign />
```
