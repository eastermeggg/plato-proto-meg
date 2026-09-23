---
name: Slider
type: shadcn
status: pending
usage: Curseur horizontal - rail, plage remplie, poignée(s) draggables ; simple ou range
description: >
  Curseur : rail 6px (fond secondary), plage remplie (primary), poignée 16px
  (fond background, bord primary, ombre). Mode range à deux poignées.
  Contrôlé ou non contrôlé, drag pointeur réel (clic rail inclus), clavier
  complet (flèches, Home/End, PageUp/Down), focus ring 3px, disabled.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-30565
file: src/components/ui/Slider.js
inventoryId: Slider
variants: [single, range]
states: [enabled, focus, dragging, disabled]
tokens: [colors.semantic.secondary, colors.semantic.primary, colors.semantic.background, colors.semantic.borderHover, radius.full, shadows.xs]
lastValidated: 2026-09-23
---

# Slider

> **Type** shadcn · **Status** Pending (built 2026-09-23) · **Usage** curseur de valeur
> **Figma** [2819:30565](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-30565) (set `2785:10703`, item `6895:13278`) · **File** `src/components/ui/Slider.js`

Sélection d'une valeur (ou d'une plage) sur un axe continu. Interactions
réelles : drag à la souris / au doigt, clic sur le rail (la poignée la plus
proche saute), clavier complet, ARIA `role="slider"` par poignée.

## Pattern / Variants / Examples

### When to use
- Régler une valeur numérique continue ou par pas : pourcentage, montant, zoom, seuil.
- Sélectionner une plage min-max (`range`) : fourchette d'honoraires, période d'ancienneté.

### When NOT to use
- **Valeur exacte à saisir** - `Input` / `InputGroup` (le slider est approximatif au drag).
- **Jauge de progression non interactive** - `Progress`.
- **Choix parmi quelques options discrètes** - `RadioGroup` / `Tabs`.
- **Interrupteur binaire** - `Switch`.

### Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `value` | number \| `[number, number]` | - | contrôlé (avec `onChange`) |
| `defaultValue` | idem | milieu du rail | non contrôlé |
| `min` / `max` / `step` | number | 0 / 100 / 1 | `step` décimal supporté |
| `range` | bool | `false` | deux poignées, valeur `[bas, haut]`, sans croisement |
| `onChange` | fn(valeur) | - | à chaque pas (drag, clavier, clic rail) |
| `onChangeCommitted` | fn(valeur) | - | au relâchement du pointeur |
| `disabled` | bool | `false` | opacité 0.5, interactions coupées |
| `ariaLabel` | string | `Curseur` | suffixé minimum / maximum en range |
| `className` / `style` / `width` | - | - | échappatoires (largeur fluide par défaut) |

### Clavier (par poignée, focusable)
Flèches gauche/bas -1 pas · droite/haut +1 pas · PageDown / PageUp ±10 % de
l'étendue · Home / End bornes. Focus visible : halo 3px (état Focus du set).

### Dimensions clés (Figma)
Rail h 6, radius full, largeur de référence 258 · plage remplie h 6 primary ·
poignée 16px, bord 1px primary, fond background, centrée sur le rail
(top -5px dans la maquette = centrage vertical).

### Examples
```jsx
import Slider from '../ui/Slider';

<Slider defaultValue={50} onChangeCommitted={save} />
<Slider range defaultValue={[25, 75]} onChange={setFourchette} />
<Slider value={quotite} min={0} max={100} step={5} onChange={setQuotite} />
<Slider defaultValue={30} disabled />
```

### Tokens used
`colors.semantic.secondary` (rail) · `colors.semantic.primary` (plage + bord de poignée) · `colors.semantic.background` (poignée) · `colors.semantic.borderHover` (halo focus via color-mix 50 %) · `radius.full` · `shadows.xs`.

### Écarts tokens relevés (pas corrigés)
- Ombre de poignée Figma `shadow/md` (0 2px 4px -2px + 0 4px 6px -1px rgba(26,26,26,0.05)) → `shadows.xs`, seul token d'ombre plausible du repo ; candidat `shadows.md` à promouvoir.
- Halo focus Figma `custom/focus` rgba(163,163,163,0.5) → `color-mix(in srgb, colors.semantic.borderHover 50%, transparent)` - même mapping que InputGroup.
- États hover / drag / disabled absents du set Figma : livrés quand même (drag = curseur grab, disabled aligné sur l'opacité 0.5 d'InputGroup).

## Sprint / Explos

- Set minimal côté Figma (Range=False/True + .Slider Item Enabled/Focus) : tout le comportement (contrôlé/non contrôlé, pas décimaux, non-croisement des poignées, commit au relâchement) est défini côté code.
- Pas de variant vertical ni de tooltip de valeur dans la maquette - à passer par `ds-decide` si un besoin émerge.

## Proto demo

`/ui-kit/c/Slider` - sandbox : simple, range, pas de 5, disabled, valeurs live.
