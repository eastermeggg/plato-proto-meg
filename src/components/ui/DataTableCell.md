---
name: DataTableCell
package: plato
status: beta
usage: The atomic typed cell — the only building block of every Plato custom table row
source: src/components/ui/DataTableCell.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36554-5657
---

# DataTableCell

The atomic unit of **every** table in the product. Plato tables do not derive from the shadcn `<table>` (removed from the DS): they are div-based compositional systems whose every row is made **only** of `DataTableCell` instances. A `type` prop selects one of ~30 domain roles. Full context: `docs/table-system.md`.

_Beta - amounts render in Inter (sans) per Figma while `docs/table-system.md` calls for RL Para; divergence logged in SIGNALEMENTS, not arbitrated (issue #78)._

## When to use
- Build **any row** of a Plato domain table (chiffrage, PGP, IV, cotisations, bordereau, relevé d'heures…): compose cells, do not re-roll a `<td>`.
- Align a column of amounts (`Amount*`), a calculation column (`Operator*` + `AmountResult`), an entity holder (`IV`, `User`, `Folder`).
- Introduce a section band (`SectionBandeau`) or an applied rule (`Rule`) within a table.

## When NOT to use
- **A pièce/JP cited in prose** → `SourceBadge` / `JPPill`, not a cell.
- **A standalone status / category** → `Badge` (the `Badge` cell is a badge *slot* in a table, not a free-standing badge).
- **Table chrome** (column headers, sorting) → `DataTableHeader`, not this cell.
- **A number that feeds a calculation inside a `Rule`** → it NEVER goes there; the formula lives in the prose of the row's panel.

## Props
| Prop | Applies to | Role |
|---|---|---|
| `type` | all | selects the role (default `Text`) |
| `text` | texts, amounts, `Badge`, `Number`, `Accronym`, `IV`/`User` (name) | main content |
| `subtext` | `IV`/`User`, `Text`, `TextEmphasis`, `AmountQualificatif` (struck through), `AmountMissing` (reason) | secondary line |
| `title` / `description` | `SectionBandeau` | title (what the section produces) + grey description, no number |
| `ruleName` / `ruleState` | `Rule`, `TextComposed` | written name of the rule + state in words |
| `sources` | `Rule`, `TextComposed` | `[{ type, label }]` rendered as `SourceBadge` |
| `note` | `TextComposed` | grey note at the bottom of the cell |
| `icon` | `Text`, `IconHolder`, `DocSource` | leading icon (override) |
| `avatarColor` | `IV`, `User` | `IVAvatar` palette (default `plum`) |
| `align` | all | `'left'`/`'right'` — overrides the default alignment |
| `width` | all | fixed width (default per type) |
| `onClick` | interactive ones | click handler |

Type families (~30):

| Family | Types |
|---|---|
| Text | `Text` · `TextEmphasis` · `TextMuted` · `TextComposed` |
| Amount | `AmountRegular` · `AmountMuted` · `AmountEmphasis` · `AmountResult` · `NegativeAmount` · `AmountQualificatif` · `AmountMissing` · `AmountProgress` |
| Entity | `IV` · `User` · `Folder` · `IconHolder` · `DocSource` |
| Marker | `Badge` · `Number` · `Accronym` · `Grip` · `Options` · `Divider` |
| Calculation | `OperatorPlus` · `OperatorMinus` · `OperatorMultiply` · `OperatorEqual` · `OperatorEqualResult` · `Rule` |
| Section | `SectionBandeau` |

## Examples
```jsx
import DataTableCell from 'src/components/ui/DataTableCell';

// A cotisation row (famille × état) is composed of cells:
<DataTableCell type="TextComposed" text="Réduction sur heures supplémentaires"
  sources={[{ type: 'code', label: 'Art. L. 241-17 CSS' }]} />
<DataTableCell type="AmountRegular" text="24,12 €" />
<DataTableCell type="NegativeAmount" text="-100 €" />
<DataTableCell type="OperatorEqualResult" />
<DataTableCell type="AmountResult" text="14 769 €" />
<DataTableCell type="SectionBandeau" title="Base soumise à cotisations"
  description="Les montants demandés, et le sort de chacun" />
```
