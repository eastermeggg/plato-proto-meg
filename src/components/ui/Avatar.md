---
name: Avatar
package: plato
status: beta
usage: Generic person avatar - initials or image, round or square, 7 token palettes
source: src/components/ui/Avatar.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2814-11240
---

# Avatar

Neutral person avatar (workspace members, contacts, authors): initials (derived
from `name` or passed in) or image, circle/square shape, token palettes from
`colors.avatar` cycled by index via `avatarColorAt`.

_Beta - pending steward validation (issue #__)._

## When to use
- A "neutral" person: workspace member, contact, author - initials or photo.
- Lists: palette cycled by index (`avatarColorAt(idx)`).

## When NOT to use
- **Domain identities** (victimes indirectes, chiffrage, client/défense/adverse) → `IVAvatar` (chess piece, 6 palettes × 6 pieces).
- **Document/source type icon** → `KindIcon` / `SourceBadge`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `size` | `sm \| md \| lg \| xl` or number | `md` | sm/md/lg/xl or a number in px |
| `initials` | string | — | explicit initials |
| `name` | string | — | initials derived from name (2 max) |
| `image` | string | — | photo URL (covers the background) |
| `color` | `colors.avatar` palette name | `cream` | green/blue/plum/orange/rose/cream/purple |
| `shape` | `circle \| square` | `circle` | |

## Examples
```jsx
import Avatar, { avatarColorAt } from 'src/components/ui/Avatar';

<Avatar name="Meghan Regior" color={avatarColorAt(idx)} shape="square" size={32} />
<Avatar initials="JD" color="blue" />
```
