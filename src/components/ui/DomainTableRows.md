---
name: DomainTableRows
package: plato
status: beta
usage: The domain row families of every Plato table - composed ONLY from DataTableCell instances
source: src/components/ui/tables/
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36554-7670
---

# DomainTableRows

The domain row families of the Plato table system, ported from the Figma « ComponentTable » section. One file per family in `src/components/ui/tables/`; each family assembles only typed cells (`DataTableCell`) + `DataTableHeader`, never ad hoc cell markup.

_Beta - serif-on-title amount divergences pending steward arbitration (issue #78)._

## Ported families (one file = one family, Figma node in JSDoc)

| File | Family | Key variants |
|---|---|---|
| `RowHeaderAddDocs.js` | Documents table head (counter + add) | default · hover · simple · report |
| `RowFolders.js` | pièce folder | header · row × default/hover |
| `RowDocuments.js` | document row | header · row × default/loading/hover/selected · rowSplitted |
| `RowExtracting.js` | OCR extraction | pending · progress · error |
| `RowBordereau.js` | bordereau of pièces | header · section · default · hover |
| `RowDSA.js` | poste DSA | header · line (revalorisation) |
| `ActRow.js` | drafted actes | header · line (hover: destructive trash) |
| `RowDFT.js` | poste DFT (période → taux → jours) | header · row (taux badge) |
| `RowPostIV.js` | indirect victims (avatar + doc counter) | header · row |
| `RowPostTP.js` | third-party payer claims | title · header · row |
| `RowCalculation.js` | Type D chiffrage | header direct/indirect · multiCol · single · subline |
| `SectionCalculation.js` | calculation section (+ `VictimContainer`) | direct · indirect (mini-tabs) |
| `RowPGP.js` | PGP (4 sub-families) | family reference/perceived/loss/echoir × title/header/line/footer |
| `TotalSubtotal.js` | collapsible total | collapsed · subtotal · expanded · emphasis (ink) |
| `TotalsAmountPills.js` | total pills | totalExp · rac · totalIndemn × default/sm |
| `RowHours.js` | relevé d'heures (Labour) | header · month · weeks · days (empty/filled/nonWorked) × hover |
| `CotisationsRows.js` | prélèvements (spec v3) | Section Captions · Row Prélèvement (12 types) · Cell Actions · page header |
| `BlocResultats.js` | cotisations results block | two figures + gap band |

## When to use
- **Any domain table**: compose these families, never re-roll an inline row. A new table = an assembly (header + Section Captions + rows, instances only).
- A need that seems to require a new row type = **a missing slot** in an existing family, not a new component (Figma doctrine).

## When NOT to use
- **A single cell** → `DataTableCell` directly.
- **A column header** → `DataTableHeader`.
- **The legacy inline tables of the proto** (chiffrage, PGP, IV, cotisations in App.js, BordereauTable in pieces/): they will migrate to these families - staged work, do not mix the two systems in the same table.

## Props

Cross-cutting rules across families:
- Canonical heights: header · row · title (per Figma anatomy).
- **Serif RL Para on TITLE amounts** (Title PGP, indirect group header); line amounts stay in Inter.
- Hover: real (`useState`) + `pinHover` prop everywhere (demos).
- Width: `width` prop, default `'100%'`.

Each family exposes a `status` prop selecting its variant (`header` · `section` · `default`…) plus data props (`num`, `name`, `sectionTitle`…) documented in the file JSDoc.

## Examples
```jsx
import RowBordereau from 'src/components/ui/tables/RowBordereau';

<RowBordereau status="header" />
<RowBordereau status="section" sectionTitle="I - MEDICAL" />
<RowBordereau status="default" num="1" name="Rapport d'expertise" />
```
