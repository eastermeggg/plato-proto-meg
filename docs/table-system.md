# Tables Plato - décision de componentisation

> Verdict : **CUSTOM.** Les tables de Plato ne dérivent PAS du `<table>` de
> shadcn ; on n'étend pas les composants shadcn, on ne les affiche plus dans le
> DS. Figma de référence : « ComponentTable » (`Plato---System` 36554:7670).

## Pourquoi custom (et pas shadcn étendu)

shadcn `Table` = de fins wrappers sémantiques autour de `<table>/<thead>/<tr>/<td>`.
Le système Plato est d'une autre nature :

- **Cellule typée** (`DataTableCell`) = l'unité atomique, ~30 types métier :
  `Text` / `TextEmphasis` / `TextMuted` / `TextComposed`, `Amount` (Regular /
  Muted / Emphasis / Negative / Result / Missing / Progress / Qualificatif),
  `Operator` (+ / - / × / = / =Result), `Rule`, `Grip`, `Badge`, `Number`,
  `Acronym`, `Divider`, `SectionBandeau`, `IconHolder`, `Folder`, `DocSource`,
  `Options`. **Où vit le serif RL Para** (clarifié 23/09, relevé nœud par
  nœud) : sur les montants de **TITRES** - Title des familles PGP (20/28),
  en-têtes de groupe de RowCalculation (16/20), montant du TotalSubtotal
  (20/28), chiffres du BlocRésultats (30/28). Les montants de **lignes**
  (cellules `Amount*`) restent en **Inter** - c'est le contraste voulu
  titre/ligne, pas une omission.
- **En-tête de colonne** (`DataTableHeader`) : `Type=Text/Button/Checkbox` ×
  `hover` × `alignement droite`.
- **Rangées métier** (`DomainTableRows`), composées UNIQUEMENT d'instances de
  cellules : Documents, DSA, Act, DFT, IV Post, Row Hours (Labour), RowPostTP,
  RowCalculation (Chiffrage), PGP (Référence / Perçus / Perte / À échoir),
  Totals / Subtotal, Cotisations (Prélèvement : 12 types = famille × état).

La maquette le dit elle-même : « composed only from cell instances »,
« Duplicate this to compose any new prélèvement table ». C'est un système
compositionnel div-based, pas un tableau HTML stylé.

## Conséquences dans le DS

- **Retirées** de l'inventaire et des démos : `Table`, `DataTable`, `TableHeader`,
  `TableRow`, `TableCell` (shadcn). On n'affiche plus les tables shadcn.
- **Catalogués** (couche `custom`, Figma ComponentTable) :
  - `DataTableCell` - la cellule typée (atomique). *À construire.*
  - `DataTableHeader` - l'en-tête de colonne. *À construire.*
  - `DomainTableRows` - les familles de rangées métier. *À construire.*
  - `BordereauTable` (`src/components/pieces/BordereauTable.js`) - **instance
    réelle** déjà en code du système.

## À construire (ordre de levier)

1. `DataTableCell` (fondation : tous les types de cellule + RL Para sur les montants).
2. `DataTableHeader` (Text / Button / Checkbox, tri, alignement).
3. `DomainTableRows` par famille, au fil des besoins, en composant les cellules.

Chaque brique = fiche `.md` + démo, via `ds-figma-component` sur le nœud précis.
Les tables inline actuelles du proto (chiffrage, PGP, IV, cotisations…) migreront
vers ce système (chantier staged, comme le rail / les boutons).
