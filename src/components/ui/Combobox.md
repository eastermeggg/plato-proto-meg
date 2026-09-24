---
name: Combobox
package: plato
type: primitive
status: draft
usage: Sélecteur avec recherche - taper pour filtrer une longue liste
description: >
  shadcn BRUT mappé sur les tokens, aucun design custom (décision steward) :
  trigger bouton (valeur/placeholder + chevrons-up-down) + panel du Select
  avec rangée Command Search en tête (border-b, loupe 16, texte 14 muted) +
  liste filtrée (rows du Select, Check sur la sélection) + état vide.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-22160
file: src/components/ui/Combobox.js
source: src/components/ui/Combobox.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: Combobox
states: [closed, open, filtering, empty, disabled]
tokens: [via SelectMenuPanel/Item + colors.semantic.card, colors.semantic.input, colors.semantic.border, colors.semantic.mutedForeground, radius.lg, shadows.2xs]
lastValidated: 2026-09-24
---

# Combobox

> **Type** Primitive · **Status** Pending (2026-09-24) · **Usage** sélecteur avec recherche
> **Figma** [2819:22160](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-22160) · **File** `src/components/ui/Combobox.js`

## Pattern / Variants / Examples

### When to use
- Choisir UNE option dans une liste LONGUE (postes, juridictions, membres) où
  la frappe filtre.

### When NOT to use
- **Liste courte (< ~10)** → `Select`.
- **Actions** → `Dropdown`.
- **Recherche transverse multi-sources** → palette de commande (pattern à part).

### Props
| Prop | Défaut | Rôle |
|------|--------|------|
| `value` / `onChange` | - | contrôle |
| `options` | `[]` | `{ value, label, icon?, disabled? }` |
| `placeholder` | `'Rechercher…'` | trigger + input |
| `emptyText` | `'Aucun résultat.'` | état vide |
| `width` | `280` | largeur |
| `disabled` | `false` | trigger désactivé |

### Examples
```jsx
import Combobox from 'src/components/ui/Combobox';

<Combobox value={poste} onChange={setPoste} placeholder="Rechercher un poste…"
  options={POSTES.map(p => ({ value: p.id, label: p.label }))} />
```

### Tokens used
Trigger : `card` / `input` / `radius.lg` / `shadows['2xs']`. Recherche :
`border` (filet), `mutedForeground` (loupe, placeholder). Liste : panel/rows
du Select (fiche Select). Aucune valeur propre.

## Sprint / Explos

- Promu le 24/09/2026 (« raw shadcn as-is, only mapped to our tokens »).
  L'esquisse input-first est remplacée par la forme shadcn canonique
  (bouton + recherche dans le panel), API préservée.

## Proto demo

`/ui-kit/c/Combobox`
