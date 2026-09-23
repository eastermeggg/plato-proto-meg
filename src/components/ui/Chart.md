---
name: Chart
type: shadcn
status: pending
usage: Visualisation de données (barres, lignes, aires, camemberts) sur la rampe chart
description: >
  Graphes SVG pur maison (aucune lib), data-driven, sur la rampe colors.chart
  (5 bleus). 8 types : bar, bar-horizontal, bar-stacked, line, area,
  area-stacked, pie, donut. Grille 5 filets, libellés d'axe 12px muted,
  légende et tooltip au survol conformes aux Chart Subcomponents Figma.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-21571
file: src/components/ui/Chart.js
inventoryId: Chart
variants: [bar, bar-horizontal, bar-stacked, line, area, area-stacked, pie, donut]
states: [default, hover-tooltip, hover-dim]
tokens: [colors.chart, colors.semantic.border, colors.semantic.mutedForeground, colors.semantic.foreground, colors.semantic.background, radius.lg, shadows.xs, typography.scale.caption, typography.scale.caption-medium]
lastValidated: 2026-09-23
---

# Chart

> **Type** shadcn · **Status** Pending (2026-09-23) · **Usage** visualisation de données sur la rampe chart
> **Figma** [2819:21571](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-21571) · **File** `src/components/ui/Chart.js`

Primitive de graphe SVG maison, data-driven. Anatomie relevée sur la page
Figma « Chart » : Area Charts (6760:2820), Bar Charts (6915:1832), Pie Charts
(6915:2760) et Chart Subcomponents (Tooltip 6924:5312, Legend 6926:1710,
Chart Dot 6926:1714). Largeur fluide (ResizeObserver), hauteur par prop.

## Pattern / Variants / Examples

### When to use
- Séries temporelles ou catégorielles compactes dans une carte : évolution
  d'usage, volumes de pièces par mois, répartition d'un budget.
- Jauges de répartition simples (`pie` / `donut`, une valeur par ligne).
- Comparaison multi-séries : `bar` groupé, `bar-stacked`, `area-stacked`
  (les couleurs suivent la rampe `colors.chart`, jamais une couleur locale).

### When NOT to use
- **Un chiffre-clé seul** : c'est de la typo (heading + caption), pas un graphe.
- **Jauge de consommation licence** : `WeeklyUsageCard` (billing) a sa jauge.
- **Radar / radial / step / gradient / barres négatives / labels sur barres** :
  maquettés dans le set mais non couverts en V1 — passer par `ds-decide`
  avant d'étendre.
- **Tableaux de valeurs exactes** : préférer le système de tables
  (`docs/table-system.md`).

### Props
| Prop | Type | Défaut | Rôle |
|------|------|--------|------|
| `type` | `'bar' · 'bar-horizontal' · 'bar-stacked' · 'line' · 'area' · 'area-stacked' · 'pie' · 'donut'` | `'bar'` | famille de tracé |
| `data` | `[{ label, values }]` | `[]` | `values` : nombre ou tableau (multi-séries) ; pour pie/donut, 1 valeur par ligne |
| `series` | `string[]` | `[]` | noms de séries (légende + tooltip) |
| `height` | `number` | `192` | hauteur du tracé (Figma Bar/Default) |
| `curved` | `boolean` | `true` | line/area : Curved (lissage) ou Linear |
| `showGrid` | `boolean` | `true` | 5 filets (Figma « Lines ») |
| `showLegend` | `boolean` | `false` | rangée de légende sous le graphe |
| `showTooltip` | `boolean` | `true` | tooltip au survol (+ dots ligne/aire, dim des autres barres) |
| `showYAxis` | `boolean` | `false` | graduations Y (variante « Axes ») |
| `showXAxis` | `boolean` | `true` | libellés de catégorie sous le tracé |
| `unit` | `string` | `''` | suffixe des valeurs du tooltip (Figma « kcal ») |
| `valueFormatter` | `(n) => string` | `toLocaleString('fr-FR')` | format des valeurs |
| `className` / `style` | — | — | échappatoires (mêmes règles que Badge) |

### Examples
```jsx
import Chart from 'src/components/ui/Chart';

// Barres simples (Chart / Bar / Default)
<Chart type="bar" data={[
  { label: 'Jan', values: 125 }, { label: 'Fév', values: 66 },
  { label: 'Mar', values: 97 }, { label: 'Avr', values: 51 },
]} />

// Aires empilées multi-séries + légende + tooltip
<Chart type="area-stacked" series={['Pièces', 'Conclusions']} showLegend
  data={[
    { label: 'Jan', values: [40, 24] }, { label: 'Fév', values: [30, 13] },
    { label: 'Mar', values: [50, 38] }, { label: 'Avr', values: [47, 39] },
  ]} unit="docs" />

// Donut de répartition
<Chart type="donut" height={192} showLegend data={[
  { label: 'Dommages corporels', values: 45 },
  { label: 'Droit social', values: 30 },
  { label: 'Autres', values: 25 },
]} />
```

### Tokens used
`colors.chart[0..4]` (rampe des séries, cyclée) · `colors.semantic.border`
(grille, filet de survol) · `colors.semantic.mutedForeground` (libellés d'axe,
noms d'items du tooltip) · `colors.semantic.foreground` (valeurs, légende,
titre du tooltip) · `colors.semantic.background` (fond du tooltip, liseré des
parts et des dots) · `radius.lg` (8 — barres et tooltip) · `shadows.xs`
(tooltip) · `typography.scale.caption` / `caption-medium` (12 px).

### Écarts Figma assumés
- Grille : Figma trace `var(--border)` #e7e5e3 ; le token repo `border` est
  #dfdcd9 (assombri d'un demi-cran, dérive délibérée du thème) → token repo.
- Ombre du tooltip : Figma `shadow/lg` (2 couches) sans équivalent tokenisé →
  `shadows.xs` (même teinte rgba(26,26,26,.05), portée moindre).
- Barres : Figma arrondit les 4 coins à 8 px (`rx` plafonné à la demi-largeur /
  demi-hauteur ici pour les petites barres) ; segments empilés arrondis à 2 px
  avec 2 px de respiration (relevé visuel des maquettes Stacked).
- Types non couverts en V1 : step, gradient, radar, radial, négatifs, labels
  sur barres, grand format « Interactive ».

## Sprint / Explos

- Construit le 23/09/2026 (mission « 2 dernières primitives planifiées »,
  validée steward). Inventaire : `Chart`, layer shadcn, famille Affichage de
  données.
- La rampe `colors.chart` a été relevée du Figma CHART (5 bleus) lors de la
  migration hex → tokens ; ce composant en est le premier consommateur DS.
- Extensions candidates (radar/radial…) : chacune via `ds-decide` avec le
  symbol Figma correspondant.

## Proto demo

`/ui-kit/c/Chart` — sandbox live : un preset par type, tooltip et légende
activables.
