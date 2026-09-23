---
name: Textarea
package: plato
type: primitive
status: draft
usage: Zone de texte multi-lignes redimensionnable (label + helper + error)
description: >
  Zone de texte multi-lignes, resize vertical. Label et helper optionnels, état
  error. Même palette qu'Input (fond card, bordure border, error
  badge.destructive.bg). Remplace les `<textarea>` bruts.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-31164
file: src/components/ui/Textarea.js
source: src/components/ui/Textarea.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: Textarea
states: [default, error, disabled]
tokens: [colors.semantic.card, colors.semantic.border, colors.semantic.foreground, colors.badge.destructive.bg, radius.lg]
lastValidated: 2026-09-24
---

# Textarea

> **Type** Primitive · **Status** Pending (2026-09-24) · **Usage** zone de texte multi-lignes
> **Figma** [2819:31164](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-31164) · **File** `src/components/ui/Textarea.js`

Zone multi-lignes, miroir d'`Input`. Promu depuis `previews.jsx`, tokenisé.

## Pattern / Variants / Examples

### When to use
- Saisie libre longue : note, motif, description, commentaire.

### When NOT to use
- **Saisie courte sur une ligne** → `Input`.
- **Composer de chat riche** (toolbar, pièces, tokens) → `AssistantComposer`.

### Props
| Prop | Défaut | Rôle |
|------|--------|------|
| `value` | `''` | valeur contrôlée |
| `placeholder` | - | texte indicatif |
| `rows` | `4` | hauteur initiale |
| `label` | - | libellé au-dessus |
| `helperText` | - | aide sous le champ |
| `error` | `false` | bordure + helper destructifs |
| `disabled` | `false` | désactivé (fond backgroundSubtle) |
| `onChange` | - | handler natif |

### Examples
```jsx
import Textarea from 'src/components/ui/Textarea';

<Textarea label="Motif" value={v} onChange={e => setV(e.target.value)} />
<Textarea error helperText="Champ requis" value={v} onChange={...} />
```

### Tokens used
`colors.semantic.card` (fond) · `colors.semantic.border` (bordure) ·
`colors.semantic.foreground` (texte) · `colors.badge.destructive.bg` (error) · `radius.lg`.

## Sprint / Explos

- Promu le 24/09/2026 depuis `ui-kit/previews.jsx`, tokenisé (fond `#ffffff`→`card`, error `#991b1b`→`badge.destructive.bg`). Cible d'adoption : `<textarea>` bruts (audit DS cat. 1).

## Proto demo

`/ui-kit/c/Textarea`
