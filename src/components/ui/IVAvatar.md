---
name: IVAvatar
package: plato
status: beta
usage: Chess-piece avatar for victims (IV) and users
source: src/components/IVAvatar.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36533-7935
---

# IVAvatar

« Chess-piece » avatar: tinted container, ChessIcons silhouette seated on the bottom edge. Each person in the dossier gets a piece + a color - an identity, not a status. Full Figma set: 6 pieces (knight/bishop/rook/pawn/king/queen) × 6 palettes.

_Beta - the cream palette lacks dedicated tokens for two tints (SIGNALEMENTS), à combler (issue #__)._

## When to use
- Represent a **victime indirecte** (`IV` table cell, victim lists) or a **user** (`User` cell, profile headers).
- Anywhere a person in the dossier needs a stable visual identity.

## When NOT to use
- **Generic avatar for a cabinet member** → the existing initials avatars (App.js identity gradients).
- **Decorative icon** → a chess piece means « a person in the dossier »; don't repurpose it.

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | `knight \| bishop \| rook \| pawn \| king \| queen` | `knight` | chess piece |
| `color` | `green \| blue \| purple \| orange \| plum \| cream \| default` | `green` | palette |
| `size` | number | — | px, free (Figma: 16 / 20 / 24 / 28 / 32 / 40) |
| `style` | object | — | inline overrides |

## Examples
```jsx
import IVAvatar from 'src/components/IVAvatar';

<IVAvatar type="queen" color="blue" size={32} />
<IVAvatar size={24} />  {/* knight green */}
```
