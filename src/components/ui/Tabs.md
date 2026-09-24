---
name: Tabs
package: plato
type: primitive
status: draft
usage: Onglets inline - label medium + indicateur 2px, compteur et icône optionnels
description: >
  Onglets INLINE (variant retenu par la steward). Label Inter Medium 14/20 :
  repos mutedForeground (indicateur invisible), hover secondaryForeground +
  indicateur border, actif foreground + indicateur primary (2px, arrondi haut
  30). Options par onglet : icône 16, compteur (pill 20 bordée border, 12
  medium mutedForeground), disabled (opacité 50). Variant padded (pt-10,
  gap 6). Le style segmented n'est pas ce composant -> ButtonGroup.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36099-45289
file: src/components/ui/Tabs.js
source: src/components/ui/Tabs.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: Tabs
variants: [default, padded]
states: [rest, hover, active, disabled]
tokens: [colors.semantic.foreground, colors.semantic.secondaryForeground, colors.semantic.mutedForeground, colors.semantic.primary, colors.semantic.border, typography (body-medium 14/20)]
lastValidated: 2026-09-24
---

# Tabs

> **Type** Primitive · **Status** Pending (2026-09-24) · **Usage** onglets inline
> **Figma** [36099:45289](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36099-45289) · **File** `src/components/ui/Tabs.js`

## Pattern / Variants / Examples

### When to use
- Basculer entre des VUES d'un même objet (onglets de dossier, sections d'un
  panneau) - contenu par onglet, un seul actif.

### When NOT to use
- **Segmented control** (choix compact dans un formulaire, 2-4 options) →
  `ButtonGroup` (cf. PairTabs dans l'audit d'adoption).
- **Navigation entre pages** → composants de shell (règle 7 - `TopBar`,
  `PageHeader` portent leurs propres onglets ; ne pas re-rouler une barre).
- **Choix d'une valeur de formulaire** → `Select` / `RadioGroup`.

### Props
| Prop | Défaut | Rôle |
|------|--------|------|
| `value` / `onChange` | - | onglet actif contrôlé |
| `options` | `[]` | `{ value, label, icon?, count?, disabled? }` |
| `padded` | `false` | variant Figma padded (pt-10, gap 6) |
| `gap` | `16` | espacement entre onglets |

### Examples
```jsx
import Tabs from 'src/components/ui/Tabs';

<Tabs
  value={tab}
  onChange={setTab}
  options={[
    { value: 'apercu', label: 'Aperçu' },
    { value: 'pieces', label: 'Pièces', count: 12 },
    { value: 'export', label: 'Export', disabled: true },
  ]}
/>
```

### Tokens used
`foreground` (actif) · `secondaryForeground` (hover) · `mutedForeground`
(repos, compteur) · `primary` (indicateur actif) · `border` (indicateur hover,
bordure du compteur) · typo body-medium 14/20. Les valeurs de bordure du nœud
(#e7e5e3) mappent le token `border` par rôle, jamais par valeur (règle
d'arbitrage n°2, design-truth).

## Sprint / Explos

- Promu le 24/09/2026 depuis le variant inline (décision steward ; le set
  « Tabs » 2819:31095 taille SM reste à arbitrer). Cible d'adoption : barres
  d'onglets custom d'App.js (:6724), ReleveHeuresLab (2 sets), onglets de
  l'AddExpense (classement modales).

## Proto demo

`/ui-kit/c/Tabs`
