---
name: ButtonGroup
package: plato
type: shadcn
status: draft
usage: Groupe de boutons segmente (actions liees, split button)
description: >
  Boutons accoles avec coins internes carres et filet separateur 1px. Compose
  le Button canonique (clone des enfants, neutralisation des radius/bords
  internes). Trois types Figma mappes sur les variants Button, deux
  orientations.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=28685-126219
file: src/components/ui/ButtonGroup.js
source: src/components/ui/ButtonGroup.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: ButtonGroup
variants: [primary, outline, secondary]
sizes: [xs, sm, md, lg]
modes: [horizontal, vertical]
tokens: [colors.semantic.primary, colors.semantic.input, radius.lg, Button (composition)]
lastValidated: 2026-09-23
---

# ButtonGroup

> **Type** shadcn · **Status** Pending (2026-09-23) · **Usage** groupe de boutons segmenté
> **Figma** [28685:126219](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=28685-126219) · **File** `src/components/ui/ButtonGroup.js`

Des `Button` accolés en un seul bloc : coins externes `radius.lg` (8), coins
internes carrés, filet 1px entre segments. **Compose Button, ne re-roule
jamais un bouton** - le groupe clone ses enfants et ne touche qu'à la
géométrie (radius, bords), jamais aux couleurs.

## Pattern / Variants / Examples

### When to use
- Actions sœurs indissociables (Précédent / Suivant, zoom - / +).
- Split button : action principale + chevron déroulant.
- Barre d'outils compacte (icônes) horizontale ou verticale.

### When NOT to use
- **Choix exclusif persistant** (filtres, vues) → `Tabs` (`variant="pills"`).
- **Actions indépendantes** → des `Button` séparés avec un `gap`.
- **Champ + bouton accolés** → pattern Input Group (Figma « Button Group & Input »), pas encore porté.

### Variants (3)
`primary` (Figma Type=Default - filet primary, fondu) · `outline` (filet input,
bords externes seulement) · `secondary` (filet input)

### Props
| Prop | Défaut | Rôle |
|------|--------|------|
| `variant` | `'primary'` | imposé aux enfants sans variant explicite |
| `orientation` | `'horizontal'` | `horizontal` / `vertical` (Figma) |
| `size` | `'md'` | taille Button imposée par défaut (Figma h36) |
| `separators` | `true` | filet 1px entre segments |
| `ariaLabel` | - | label du `role="group"` |
| `className` / `style` | - | passthrough |

### Examples
```jsx
import ButtonGroup from 'src/components/ui/ButtonGroup';
import Button from 'src/components/ui/Button';
import { ChevronDown, Plus } from 'lucide-react';

<ButtonGroup ariaLabel="Actions">
  <Button label="Enregistrer" />
  <Button size="icon" icon={ChevronDown} />
</ButtonGroup>

<ButtonGroup variant="outline">
  <Button label="Jour" />
  <Button label="Semaine" />
  <Button label="Mois" />
  <Button size="icon" icon={Plus} />
</ButtonGroup>

<ButtonGroup variant="secondary" orientation="vertical">
  <Button label="Dupliquer" />
  <Button label="Renommer" />
</ButtonGroup>
```

### Tokens used
`radius.lg` (coins externes, Figma 8) · `colors.semantic.primary` /
`colors.semantic.input` (filet séparateur) · tout le reste vient de `Button`
(variants, tailles, focus ring)

## Sprint / Explos

- Construit le 23/09 depuis l'inventaire DS (nœud validé par la steward) ; choix : composition de `Button` plutôt que transcription des boutons Figma (px16/h36 Figma vs px14/h36 Button md - dérive délibérée du Button canonique, cf. Button.md).

## Proto demo

`/ui-kit/c/ButtonGroup`
