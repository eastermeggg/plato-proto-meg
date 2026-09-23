---
name: DataTableCell
type: composite
status: pending
usage: The atomic typed cell — the only building block of every Plato custom table row
description: >
  L'unité atomique de toutes les tables Plato (div-based, pas <table> shadcn).
  Une prop `type` sélectionne un des ~30 rôles métier : texte, montant, entité,
  marqueur, opérateur de calcul, bande de section. Les rangées métier ne sont
  faites QUE d'instances de cette cellule.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36554-5657
file: src/components/ui/DataTableCell.js
inventoryId: DataTableCell
variants: [IV, User, DocSource, IconHolder, Folder, Text, TextEmphasis, TextMuted, TextComposed, Badge, Number, Accronym, Grip, Options, Divider, AmountRegular, AmountMuted, AmountEmphasis, AmountResult, NegativeAmount, AmountQualificatif, AmountMissing, AmountProgress, OperatorPlus, OperatorMinus, OperatorMultiply, OperatorEqual, OperatorEqualResult, Rule, SectionBandeau]
composes: [IVAvatar, Badge, SourceBadge]
tokens: [colors.semantic, colors.feedback.info, colors.feedback.destructive, typography.scale.body, typography.scale.caption, typography.scale.heading-sm, typography.scale.caption-header-cols, radius.md, radius.full]
lastValidated: 2026-09-23
---

# DataTableCell

> **Type** Composite (custom, pas shadcn) · **Status** Pending (2026-09-23) · **Usage** cellule typée atomique des tables Plato
> **Figma** [36554:5657](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36554-5657) · **File** `src/components/ui/DataTableCell.js`

L'unité atomique de **toutes** les tables du produit. Les tables Plato ne
dérivent pas du `<table>` de shadcn (retiré du DS) : ce sont des systèmes
compositionnels div-based dont chaque rangée n'est faite **que** d'instances de
`DataTableCell`. Contexte complet : `docs/table-system.md`.

## Pattern / Variants / Examples

### When to use
- Construire **n'importe quelle rangée** d'une table métier Plato (chiffrage,
  PGP, IV, cotisations, bordereau, relevé d'heures…) : on compose des cellules,
  on ne re-roule pas de `<td>`.
- Aligner une colonne de montants (`Amount*`), une colonne de calcul
  (`Operator*` + `AmountResult`), un porte-entité (`IV`, `User`, `Folder`).
- Introduire une bande de section (`SectionBandeau`) ou une règle appliquée
  (`Rule`) au sein d'une table.

### When NOT to use
- **Une pièce/JP citée en prose** → `SourceBadge` / `JPPill`, pas une cellule.
- **Un statut / une catégorie autonome** → `Badge` (la cellule `Badge` est un
  *emplacement* de badge dans une table, pas un badge libre).
- **Le chrome de table** (en-têtes de colonne, tri) → `DataTableHeader`
  (*à construire*), pas cette cellule.
- **Un chiffre qui participe à un calcul dans une `Rule`** → il n'y va JAMAIS ;
  la formule vit dans la prose du panneau de la ligne.

### Familles de types (~30)
| Famille | Types |
|---|---|
| Texte | `Text` · `TextEmphasis` · `TextMuted` · `TextComposed` |
| Montant | `AmountRegular` · `AmountMuted` · `AmountEmphasis` · `AmountResult` · `NegativeAmount` · `AmountQualificatif` · `AmountMissing` · `AmountProgress` |
| Entité | `IV` · `User` · `Folder` · `IconHolder` · `DocSource` |
| Marqueur | `Badge` · `Number` · `Accronym` · `Grip` · `Options` · `Divider` |
| Calcul | `OperatorPlus` · `OperatorMinus` · `OperatorMultiply` · `OperatorEqual` · `OperatorEqualResult` · `Rule` |
| Section | `SectionBandeau` |

### Props
| Prop | Types concernés | Rôle |
|---|---|---|
| `type` | tous | sélectionne le rôle (défaut `Text`) |
| `text` | textes, montants, `Badge`, `Number`, `Accronym`, `IV`/`User` (nom) | contenu principal |
| `subtext` | `IV`/`User`, `Text`, `TextEmphasis`, `AmountQualificatif` (barré), `AmountMissing` (raison) | ligne secondaire |
| `title` / `description` | `SectionBandeau` | titre (ce que la section produit) + description grise, sans chiffre |
| `ruleName` / `ruleState` | `Rule`, `TextComposed` | nom rédigé de la règle + état en mots |
| `sources` | `Rule`, `TextComposed` | `[{ type, label }]` rendus en `SourceBadge` |
| `note` | `TextComposed` | note grise de bas de cellule |
| `icon` | `Text`, `IconHolder`, `DocSource` | icône de tête (override) |
| `avatarColor` | `IV`, `User` | palette `IVAvatar` (défaut `plum`) |
| `align` | tous | `'left'`/`'right'` — override l'alignement par défaut |
| `width` | tous | largeur fixe (défaut selon le type : 406 / 64 / 46 / pleine) |
| `onClick` | interactifs | handler de clic |

### Examples
```jsx
import DataTableCell from 'src/components/ui/DataTableCell';

// Une rangée de cotisation (famille × état) se compose de cellules :
<DataTableCell type="TextComposed" text="Réduction sur heures supplémentaires"
  sources={[{ type: 'code', label: 'Art. L. 241-17 CSS' }]} />
<DataTableCell type="AmountRegular" text="24,12 €" />
<DataTableCell type="NegativeAmount" text="-100 €" />
<DataTableCell type="OperatorEqualResult" />
<DataTableCell type="AmountResult" text="14 769 €" />
<DataTableCell type="SectionBandeau" title="Base soumise à cotisations"
  description="Les montants demandés, et le sort de chacun" />
```

### Tokens used
`colors.semantic.*` (foreground / mutedForeground / foregroundMuted / muted / border / white / primary) · `colors.feedback.info.subtle|text` (porte-icônes docs, Folder) · `colors.feedback.destructive.base` (NegativeAmount) · `typography.scale.body|caption|heading-sm|caption-header-cols` · `radius.md` / `radius.full`

> **Note montants (divergence signalée).** La maquette Figma câble les montants
> en Inter (sans) — le composant suit le Figma. `docs/table-system.md` évoque
> « RL Para sur les montants » : divergence non arbitrée ici, consignée dans
> `SIGNALEMENTS.md`. L'anneau « lie-de-vin » de `OperatorMinus` est
> `rgba(127,29,29,0.2)` = `feedback.destructive.text` @ 20% (pas de token alpha
> disponible), fidèle au Figma.

## Sprint / Explos

- **Système de tables Plato** (`docs/table-system.md`) : verdict CUSTOM. Trois
  briques à construire — `DataTableCell` (ici, la fondation), `DataTableHeader`
  (en-tête de colonne, *à construire*), rangées métier `DomainTableRows`
  (*à construire*, composent ces cellules). Instance réelle déjà en code :
  `BordereauTable` (`src/components/pieces/BordereauTable.js`).
- Les additions **droit social / cotisations** (spec v3) vivent dans les types
  `Operator*`, `Rule`, `TextComposed`, `AmountQualificatif/Missing/Progress`,
  `SectionBandeau` — cf. `CotisationsSection` et la note
  [[project_cotisations_social]].
- Les tables inline actuelles du proto (chiffrage, PGP, IV, cotisations)
  migreront vers ce système (chantier staged).

## Proto demo

`/ui-kit/c/DataTableCell` — sandbox live : sélecteur de `type` (les ~30) +
presets par famille (Montants, Calcul, Entités, Section).
