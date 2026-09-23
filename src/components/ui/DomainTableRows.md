---
name: DomainTableRows
type: composite
status: pending
usage: The domain row families of every Plato table - composed ONLY from DataTableCell instances
description: >
  Les familles de rangées métier du système de tables Plato, portées
  pixel-perfect depuis la section Figma « ComponentTable » (36554:7670).
  Un fichier par famille dans src/components/ui/tables/ ; les rangées ne
  sont faites que de cellules typées (DataTableCell) + DataTableHeader.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36554-7670
file: src/components/ui/tables/
inventoryId: DomainTableRows
composes: [DataTableCell, DataTableHeader, Badge, SourceBadge, IVAvatar, Button]
tokens: [colors.semantic, colors.feedback, typography.fontFamily.serif, typography.scale.caption-header-cols]
lastValidated: 2026-09-23
---

# DomainTableRows

> **Type** Composite (familles custom) · **Status** Pending (2026-09-23) · **Usage** rangées métier des tables Plato
> **Figma** [36554:7670](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36554-7670) (« ComponentTable », tout y est) · **Files** `src/components/ui/tables/*.js`

Les rangées métier de toutes les tables du produit. La maquette le dit :
« composed only from cell instances » - chaque famille n'assemble que des
`DataTableCell` / `DataTableHeader`, jamais de markup de cellule ad hoc.

## Pattern / Variants / Examples

### Familles portées (un fichier = une famille, Figma node en JSDoc)

| Fichier | Famille | Variants clés |
|---|---|---|
| `RowHeaderAddDocs.js` | tête de table Documents (compteur + ajout) | default 68 · hover · simple 52 · report 76 |
| `RowFolders.js` | dossier de pièces | header 40 · row 44 × default/hover |
| `RowDocuments.js` | rangée document | header · row 44 × default/loading/hover/selected · rowSplitted |
| `RowExtracting.js` | extraction OCR | pending · progress · error 124 |
| `RowBordereau.js` | bordereau de pièces | header · section · default 52 · hover |
| `RowDSA.js` | poste DSA | header 40 · line 52 (revalorisation) |
| `ActRow.js` | actes rédigés | header · line (hover : corbeille destructive) |
| `RowDFT.js` | poste DFT (période → taux → jours) | header · row (badge taux) |
| `RowPostIV.js` | victimes indirectes (avatar + compteur docs) | header · row |
| `RowPostTP.js` | créances tiers payeur | title 48 · header · row |
| `RowCalculation.js` | chiffrage Type D | header direct/indirect · multiCol · single · subline |
| `SectionCalculation.js` | section de calcul (+ `VictimContainer`) | direct · indirect (mini-tabs) |
| `RowPGP.js` | PGP (4 sous-familles) | family reference/perceived/loss/echoir × title/header/line/footer |
| `TotalSubtotal.js` | total repliable | collapsed · subtotal · expanded · emphasis (encre) |
| `TotalsAmountPills.js` | pills de totaux | totalExp · rac · totalIndemn × default/sm |
| `RowHours.js` | relevé d'heures (Labour) | header · month · weeks · days (empty/filled/nonWorked) × hover |
| `CotisationsRows.js` | prélèvements (spec v3) | Section Captions · Row Prélèvement (12 types) · Cell Actions · en-tête page |
| `BlocResultats.js` | bloc résultats cotisations | deux chiffres + bande d'écart |

### When to use
- **Toute table métier** : composer ces familles, jamais re-rouler une rangée
  inline. Une nouvelle table = un assemblage (voir « Exemple d'assemblage »
  de la maquette : en-tête + Section Captions + rangées, uniquement des
  instances).
- Un besoin qui semble exiger un nouveau type de rangée = **un slot manquant**
  dans une famille existante, pas un nouveau composant (doctrine du Figma).

### When NOT to use
- **Une cellule isolée** → `DataTableCell` directement.
- **Un en-tête de colonne** → `DataTableHeader`.
- **Les tables inline historiques du proto** (chiffrage, PGP, IV, cotisations
  dans App.js, BordereauTable dans pieces/) : elles migreront vers ces
  familles - chantier staged, ne pas mélanger les deux systèmes dans une
  même table.

### Règles transverses
- Hauteurs canoniques : header 40 · rangée 44/52 · title 48/66.
- **Serif RL Para sur les montants de TITRES** (Title PGP 20/28, header de
  groupe indirect 16/20) ; les montants de lignes restent en Inter
  (cf. SIGNALEMENTS §6).
- Hover : réel (`useState`) + prop `pinHover` partout (démos).
- Largeur : prop `width`, défaut '100%' (Figma : 1152).

### Example
```jsx
import RowBordereau from 'src/components/ui/tables/RowBordereau';

<RowBordereau status="header" />
<RowBordereau status="section" sectionTitle="I - MEDICAL" />
<RowBordereau status="default" num="1" name="Rapport d'expertise" />
```

### Tokens used
Tokens sémantiques + familles feedback ; mono 11 (`caption-header-cols`) pour
tous les en-têtes ; serif pour les montants de titres. Écarts relevés par
famille : JSDoc des fichiers + SIGNALEMENTS §7.

## Sprint / Explos

- Porté le 23/09/2026 depuis « ComponentTable » (4 agents en parallèle,
  design context nœud par nœud, pixel-perfect).
- Instances réelles déjà en code à migrer : `BordereauTable` (pieces/),
  tables inline App.js, `CotisationsSection` (social/), relevé d'heures.

## Proto demo

`/ui-kit/c/DomainTableRows` — sandbox live : sélecteur de famille, chaque
famille montrée en assemblage complet (header + rangées + états).
