---
name: Separator
package: plato
type: primitive
status: draft
usage: Filet de séparation - horizontal, vertical, ou avec libellé mono
description: >
  Filet 1px issu du token border. Trois formes : horizontal pleine largeur,
  horizontal avec libellé mono uppercase centré, vertical (hauteur 16, aligné
  au texte). Remplace les `<hr>` bruts et les hairlines inline bg-foreground/10.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-30252
file: src/components/ui/Separator.js
source: src/components/ui/Separator.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: Separator
variants: [horizontal, horizontal-label, vertical]
tokens: [colors.semantic.border, colors.semantic.foregroundMuted, typography.fontFamily.mono]
lastValidated: 2026-09-24
---

# Separator

> **Type** Primitive · **Status** Pending (2026-09-24) · **Usage** filet de séparation
> **Figma** [2819:30252](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-30252) · **File** `src/components/ui/Separator.js`

Filet 1px (token `border`). Promu depuis l'esquisse `previews.jsx`, tokenisé.

## Pattern / Variants / Examples

### When to use
- Séparer deux blocs / groupes de liste (horizontal).
- Séparer deux éléments inline (vertical, ex. barre d'outils).
- Titre de section discret : forme `label` (mono uppercase encadré de filets).

### When NOT to use
- **Bordure d'un conteneur** → `border` Tailwind sur le conteneur, pas un Separator.
- **Espacement seul** → utiliser le gap / margin, pas un filet invisible.

### Props
| Prop | Défaut | Rôle |
|------|--------|------|
| `orientation` | `'horizontal'` | horizontal / vertical |
| `label` | - | libellé mono centré (horizontal only) |
| `className` / `style` | - | passthrough |

### Examples
```jsx
import Separator from 'src/components/ui/Separator';

<Separator />
<Separator label="Métadonnées" />
<Separator orientation="vertical" />
```

### Tokens used
`colors.semantic.border` (filet) · `colors.semantic.foregroundMuted` (libellé) ·
`typography.fontFamily.mono` (libellé 11px uppercase).

## Sprint / Explos

- Promu le 24/09/2026 depuis `ui-kit/previews.jsx` (esquisse validée look-and-feel), tokenisé. Cible d'adoption : `<hr>` bruts + hairlines `bg-foreground/10` (audit DS cat. 1).

## Proto demo

`/ui-kit/c/Separator`
