---
name: IVAvatar
type: custom
status: pending
usage: Chess-piece avatar for victims (IV) and users
description: >
  Avatar « pièce d'échecs » : conteneur teinté, silhouette posée sur le bord
  bas. Set complet Figma : 6 pièces (knight/bishop/rook/pawn/king/queen) ×
  6 palettes × tailles 16-40.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36533-7935
file: src/components/IVAvatar.js
inventoryId: IVAvatar
variants: [knight, bishop, rook, pawn, king, queen]
sizes: [16, 20, 24, 28, 32, 40]
tokens: [colors.feedback.success, colors.feedback.info, colors.feedback.ai, colors.feedback.warning, colors.avatar, colors.semantic.muted]
lastValidated: 2026-09-23
---

# IVAvatar

> **Type** Custom · **Status** Pending (2026-09-23) · **Usage** avatar victimes indirectes / users
> **Figma** [36533:7935](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36533-7935) · **File** `src/components/IVAvatar.js`

Avatar « pièce d'échecs » : conteneur teinté (radius 2), silhouette ChessIcons
posée sur le bord bas avec un léger étirement (rendu Figma :
preserveAspectRatio none). Chaque personne du dossier reçoit une pièce + une
couleur - une identité, pas un statut.

## Pattern / Variants / Examples

### When to use
- Représenter une **victime indirecte** (cellule `IV` des tables, listes de
  victimes) ou un **user** (cellule `User`, en-têtes de profil).
- Partout où une personne du dossier a besoin d'une identité visuelle stable.

### When NOT to use
- **Avatar générique d'un membre du cabinet** → les avatars-initiales existants
  (gradients d'identité App.js).
- **Icône décorative** → une pièce d'échecs signifie « une personne du
  dossier » ; ne pas la détourner.

### Props
| Prop | Rôle |
|---|---|
| `type` | `'knight'` (défaut) · `'bishop'` · `'rook'` · `'pawn'` · `'king'` · `'queen'` |
| `color` | `'green'` (défaut) · `'blue'` · `'purple'` · `'orange'` · `'plum'` · `'cream'` · `'default'` |
| `size` | px, libre (Figma : 16 / 20 / 24 / 28 / 32 / 40) |
| `style` | overrides inline |

### Examples
```jsx
import IVAvatar from 'src/components/IVAvatar';

<IVAvatar type="queen" color="blue" size={32} />
<IVAvatar size={24} />  {/* knight green */}
```

### Tokens used
GREEN → `feedback.success.subtle/text` · BLUE → `feedback.info.subtle/text` ·
PURPLE/Default → `feedback.ai.subtle/text` · ORANGE → `feedback.warning.subtle/base` ·
PLUM → `colors.avatar` plum · CREAM → `semantic.muted` / `foregroundQuaternary`
(écart : cream/200 #dbd7cd et cream/900 #50443e sans token, cf. SIGNALEMENTS).

## Sprint / Explos

- Réaligné pixel-perfect le 23/09/2026 depuis le set 36533:7935 : avant, seul
  le knight existait et la pièce était rendue à ~49 % de la largeur ; le Figma
  la pose à ~87 % (boîte interne pleine). Les 6 vecteurs viennent du composant
  ChessIcons 36533:7936.
- `PreviewPanel` embarque encore ses propres CHESS_PATHS locaux - doublon à
  résorber vers ce composant.

## Proto demo

`/ui-kit/c/IVAvatar` — sandbox live : pièce × couleur × taille.
