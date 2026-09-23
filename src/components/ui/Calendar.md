---
name: Calendar
type: shadcn
status: pending
usage: Sélection d'une date dans une grille mensuelle (formulaires, filtres, échéances)
description: >
  Calendrier de sélection de date : grille mensuelle commençant le lundi,
  navigation mois précédent/suivant, jours hors-mois grisés, aujourd'hui
  marqué, jour sélectionné en fond primary. Libellés français via
  Intl.DateTimeFormat('fr-FR'), aucune lib de dates. Mode single uniquement
  (le set Figma ne maquette pas de plage).
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-19886
file: src/components/ui/Calendar.js
inventoryId: Calendar
variants: [single]
sizes: [default, large, custom-days]
states: [enabled, hover, focus, disabled, selected, outside, today]
tokens: [colors.semantic.primary, colors.semantic.primaryForeground, colors.semantic.foreground, colors.semantic.mutedForeground, colors.semantic.muted, colors.semantic.background, colors.semantic.borderHover, radius.lg, typography.scale.body, typography.scale.body-medium, typography.scale.caption]
lastValidated: 2026-09-23
---

# Calendar

> **Type** shadcn · **Status** Pending (2026-09-23) · **Usage** sélection d'une date (grille mensuelle)
> **Figma** [2819:19886](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-19886) · **File** `src/components/ui/Calendar.js`

Grille mensuelle de sélection de date, construite depuis les sous-composants
du set Figma : `.Calendar Day Button` (305:4208), `.Calendar Arrow Button`
(6733:2244), `.CalendarDayHeader` (6734:4882), `.Calendar Header Type=Default`
(6735:17260). Semaine commençant le lundi, libellés français (`Intl`).

## Pattern / Variants / Examples

### When to use
- Choisir UNE date : échéance, date d'audience, date de pièce, filtre temporel.
- Dans un popover sous un champ date, ou posé dans un panneau de filtre.
- Grille « Custom days » (52 px, sous-libellé par jour) : montant / charge par
  jour sous le numéro (`dayDetail`).

### When NOT to use
- **Plage de dates (range)** : non maquettée dans le set Figma, non implémentée.
  Demander la maquette avant d'étendre le composant (règle ds-decide).
- **Saisie libre de date** : c'est un `Input` avec masque, le Calendar vient en
  complément (popover), pas en remplacement.
- **Vue agenda / planning avec événements posés** : le `.Calendar Event Slot`
  (6976:59893) du set est un bloc à part, non couvert ici.
- **Navigation par dropdowns mois/année** : les variantes d'en-tête
  `Date/Month/Year dropdown` (6912:3855) ne sont pas implémentées (V1 =
  `Type=Default`, flèches seules).

### Props
| Prop | Type | Défaut | Rôle |
|------|------|--------|------|
| `value` | `Date` | `null` | date sélectionnée (contrôlé) |
| `onChange` | `(Date) => void` | — | clic sur un jour |
| `month` / `onMonthChange` | `Date` / `(Date) => void` | — | mois affiché contrôlé (premier du mois) |
| `defaultMonth` | `Date` | `value` ou aujourd'hui | mois initial (non contrôlé) |
| `mode` | `'single'` | `'single'` | seul mode maquetté |
| `size` | `'default' 32px` · `'large' 48px` | `'default'` | taille des cases (Figma Size) |
| `dayDetail` | `(date) => string` | — | sous-libellé par jour → bascule en Size=Custom days (52 px) |
| `disabled` | `(date) => boolean` | — | jours non cliquables (état Disabled) |
| `showOutsideDays` | `boolean` | `true` | jours hors-mois grisés ou cases vides |
| `className` / `style` | — | — | échappatoires (mêmes règles que Badge) |

### Examples
```jsx
import Calendar from 'src/components/ui/Calendar';

// Sélection simple
<Calendar value={date} onChange={setDate} />

// Mois contrôlé + week-ends désactivés
<Calendar
  value={date}
  onChange={setDate}
  month={month}
  onMonthChange={setMonth}
  disabled={(d) => d.getDay() === 0 || d.getDay() === 6}
/>

// Grille « Custom days » : montant par jour
<Calendar size="large" value={date} onChange={setDate}
  dayDetail={(d) => (d.getDate() % 3 === 0 ? '100 EUR' : '')} />
```

### Tokens used
`colors.semantic.primary` / `primaryForeground` (jour sélectionné) ·
`colors.semantic.foreground` (jour), `mutedForeground` + opacité 50 %
(hors-mois / désactivé, état Disabled Figma) · `colors.semantic.muted`
(survol + aujourd'hui) · `colors.semantic.background` (flèches) ·
`colors.semantic.borderHover` (anneau focus) · `radius.lg` (8, cases et
flèches) · `typography.scale.body` (jour 14/20), `body-medium` (mois),
`caption` (jours de semaine, sous-libellés 12).

### Écarts Figma assumés
- Survol : Figma pose `var(--accent)` ; dans la palette du repo
  `accent == background` (#f8f7f5), le survol serait invisible → rendu avec
  `colors.semantic.muted` (#eeece6, cran visible le plus proche).
- Aujourd'hui : pas de variante « today » dans le set → convention shadcn
  (fond accent), rendue avec `colors.semantic.muted` pour la même raison.
- Anneau focus : Figma `custom/focus` rgba(163,163,163,.5) 3 px, pas de token
  alpha → `colors.semantic.borderHover` (#a8a29e) 3 px via `:focus-visible`.
- Flèches : bouton local, pas `Button size="icon"` (34 px, sans l'état « repos
  à 50 % ») ; la géométrie Figma est 32 px + opacité 50 % au repos.

## Sprint / Explos

- Construit le 23/09/2026 (mission « 2 dernières primitives planifiées »,
  validée steward). Inventaire : `Calendar`, layer shadcn, famille Formulaires.
- Le set référence aussi une page « Calendar Blocks » (22 blocks) : des
  compositions, à traiter comme du contenu d'app, pas des variantes de la
  primitive.
- Range, dropdowns d'en-tête et Event Slot = extensions candidates, chacune à
  passer par `ds-decide` avec sa maquette.

## Proto demo

`/ui-kit/c/Calendar` — sandbox live : sélection, mois contrôlé, `disabled`,
grille Custom days.
