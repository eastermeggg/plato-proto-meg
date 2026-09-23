---
name: Kbd
type: shadcn
status: pending
usage: Raccourci clavier inline (touche seule ou combinaison)
description: >
  Chip 20px pour afficher une touche clavier (Inter Medium 12, bg muted).
  Deux variants (default, reversed pour surfaces sombres) et un export
  KbdGroup pour les combinaisons (juxtaposees ou reliees par un +).
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=29794-42330
file: src/components/ui/Kbd.js
inventoryId: Kbd
variants: [default, reversed]
modes: [single, group, group-separated]
tokens: [colors.semantic.muted, colors.semantic.mutedForeground, colors.semantic.background, colors.semantic.white, colors.semantic.foreground, radius.md, typography.scale.caption-medium, typography.scale.caption]
lastValidated: 2026-09-23
---

# Kbd

> **Type** shadcn · **Status** Pending (2026-09-23) · **Usage** raccourci clavier inline
> **Figma** [29794:42330](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=29794-42330) · **File** `src/components/ui/Kbd.js`

Chip compact (h 20, radius 6) qui matérialise une touche clavier dans du texte,
un tooltip ou un menu. Non interactif - c'est une étiquette, pas un bouton.

## Pattern / Variants / Examples

### When to use
- Afficher un raccourci à côté d'une commande (palette de commandes, menus, tooltips).
- Documenter une combinaison (`KbdGroup` : `⌘` `K`, ou `Ctrl + Opt + F` en mode `separated`).
- Sur surface sombre (tooltip, bouton primaire) → variant `reversed`.

### When NOT to use
- **Badge de statut / catégorie** → `Badge`.
- **Bouton cliquable** → `Button` ; Kbd n'a aucun état interactif.
- **Code inline / valeurs techniques** → typographie mono, pas Kbd.

### Variants (2)
`default` (bg muted, texte muted-foreground) · `reversed` (bg blanc 20 %, texte background - surfaces sombres)

### Props
| Prop | Défaut | Rôle |
|------|--------|------|
| `variant` | `'default'` | `default` / `reversed` |
| `label` | `'⌘'` | contenu de la touche (string ou node) |
| `leftIcon` / `rightIcon` | - | icône lucide 12px optionnelle |
| `className` / `style` / `title` | - | passthrough |

`KbdGroup` (export nommé) : `keys` (défaut `['⌘','⇧','⌥','⌃']`), `separated`
(défaut `false` - insère un `+` Inter Regular 12 foreground), `variant`.

### Examples
```jsx
import Kbd, { KbdGroup } from 'src/components/ui/Kbd';

<Kbd label="⌘" />
<KbdGroup keys={['⌘', 'K']} />
<KbdGroup keys={['Ctrl', 'Opt', 'F']} separated />
<Kbd variant="reversed" label="Entrée" />
```

### Tokens used
`colors.semantic.muted` (bg) · `colors.semantic.mutedForeground` (texte) ·
`colors.semantic.background` + `colors.semantic.white` (reversed, via color-mix 20 %) ·
`colors.semantic.foreground` (séparateur +) · `radius.md` ·
`typography.scale['caption-medium']` / `caption`

## Sprint / Explos

- Construit le 23/09 depuis l'inventaire DS (nœud validé par la steward, set Figma « Kbd » + « Kbd Group »).

## Proto demo

`/ui-kit/c/Kbd`
