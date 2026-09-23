---
name: DataTableHeader
package: plato
type: composite
status: draft
usage: Column header cell of the custom Plato tables (h40, mono 11 uppercase)
description: >
  Cellule d'en-tête de colonne des tables custom Plato. Trois types (text,
  button de tri, checkbox « tout sélectionner ») × hover × alignement droite.
  Aussi la brique de la bande « Section Captions » des cotisations.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2768-27447
file: src/components/ui/DataTableHeader.js
source: src/components/ui/DataTableHeader.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: DataTableHeader
variants: [text, button, checkbox]
states: [default, hover, rightAlign, checked]
tokens: [colors.semantic.mutedForeground, colors.semantic.border, colors.semantic.muted, colors.semantic.primary, colors.semantic.input, typography.scale.caption-header-cols, shadows.xs]
lastValidated: 2026-09-23
---

# DataTableHeader

> **Type** Composite (custom, pas shadcn) · **Status** Pending (2026-09-23) · **Usage** en-tête de colonne des tables Plato
> **Figma** [2768:27447](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2768-27447) · **File** `src/components/ui/DataTableHeader.js`

Cellule d'en-tête de colonne (h 40, IBM Plex Mono 11 medium uppercase) des
tables custom Plato - la sœur de `DataTableCell`. Au repos elle porte le filet
bas 1px ; au survol le filet disparaît et le fond passe en crème éclaircie
(rendu Figma exact : voile blanc 50 % sur muted).

## Pattern / Variants / Examples

### When to use
- En tête de **chaque colonne** d'une table métier Plato (bordereau, chiffrage,
  cotisations, relevé d'heures…).
- Colonne triable → `type="button"` (libellé + arrow-up-down, `onClick`).
- Colonne de sélection → `type="checkbox"` (`checked` + `onChange`, largeur 36).
- La bande « Section Captions » des cotisations (PIÈCE · OPÉ. + libellé
  colonne valeur en `rightAlign`).

### When NOT to use
- **Un en-tête de section dans le corps de la table** → `DataTableCell
  type="SectionBandeau"`.
- **Un tri complexe avec menu** → composer avec un vrai menu ; cette cellule ne
  porte qu'un clic.
- **Un `<th>` shadcn** → les tables Plato sont custom (docs/table-system.md).

### Props
| Prop | Rôle |
|---|---|
| `type` | `'text'` (défaut) · `'button'` · `'checkbox'` |
| `label` | libellé (text / button) - tronqué ellipsis |
| `rightAlign` | aligne à droite (colonnes de montants) |
| `checked` / `onChange` | état de la checkbox |
| `onClick` | clic de tri (button) |
| `pinHover` | force le visuel hover (démos) |
| `width` | défaut 144 (36 pour checkbox) |

### Examples
```jsx
import DataTableHeader from 'src/components/ui/DataTableHeader';

<DataTableHeader type="checkbox" checked={all} onChange={setAll} />
<DataTableHeader label="Dossier" />
<DataTableHeader type="button" label="Date" onClick={sortByDate} />
<DataTableHeader label="Montant" rightAlign />
```

### Tokens used
`typography.scale['caption-header-cols']` (mono 11 medium) · `colors.semantic.mutedForeground` · `colors.semantic.border` (filet bas) · `colors.semantic.muted` (fond hover, sous voile blanc 50 %) · `colors.semantic.primary` / `input` / `white` + `shadows.xs` (checkbox)

## Sprint / Explos

- Système de tables Plato (`docs/table-system.md`) : `DataTableCell` (fait) +
  `DataTableHeader` (ici) + rangées métier `src/components/ui/tables/`.
- Les en-têtes inline existants (`TreeColumnHeader` de BordereauTable, etc.)
  migreront vers cette cellule (chantier staged).

## Proto demo

`/ui-kit/c/DataTableHeader` — sandbox live : type × rightAlign × hover épinglé.
