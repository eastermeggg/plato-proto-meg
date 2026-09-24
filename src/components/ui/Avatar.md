---
name: Avatar
package: plato
type: primitive
status: draft
usage: Avatar générique de personne - initiales ou image, rond ou carré, 7 palettes tokens
description: >
  Avatar neutre (membres du workspace, contacts) : initiales (dérivées de
  `name` ou passées) ou image, forme circle/square, tailles sm/md/lg/xl
  (24/32/40/56) ou taille libre. Palettes = `colors.avatar` (le set partagé
  avec IVAvatar : green/blue/plum/orange/rose/cream/purple), cycle par index
  via `avatarColorAt`. Les identités MÉTIER (VI/VD, client/défense/adverse)
  restent `IVAvatar` (pièce d'échecs, domaine).
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2814-11240
file: src/components/ui/Avatar.js
source: src/components/ui/Avatar.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: Avatar
variants: [circle, square]
sizes: [sm, md, lg, xl, libre]
tokens: [colors.avatar (7 palettes bg/fill), typography.fontFamily.sans]
lastValidated: 2026-09-24
---

# Avatar

> **Type** Primitive · **Status** Pending (2026-09-24) · **Usage** avatar générique de personne
> **Figma** [2814:11240](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2814-11240) · **File** `src/components/ui/Avatar.js`

## Pattern / Variants / Examples

### When to use
- Personne « neutre » : membre du workspace, contact, auteur - initiales ou photo.
- Listes : palette cyclique par index (`avatarColorAt(idx)`).

### When NOT to use
- **Identités métier** (victimes indirectes, chiffrage, client/défense/
  adverse) → `IVAvatar` (pièce d'échecs, 6 palettes × 6 pièces, set validé).
- **Icône de type de document/source** → `KindIcon` / `SourceBadge`.

### Props
| Prop | Défaut | Rôle |
|------|--------|------|
| `size` | `'md'` | sm/md/lg/xl (24/32/40/56) ou nombre en px |
| `initials` / `name` | - | initiales explicites, ou dérivées de name (2 max) |
| `image` | - | URL photo (couvre le fond) |
| `color` | `'cream'` | nom de palette `colors.avatar` |
| `shape` | `'circle'` | circle / square (radius 6) |

### Examples
```jsx
import Avatar, { avatarColorAt } from 'src/components/ui/Avatar';

<Avatar name="Meghan Regior" color={avatarColorAt(idx)} shape="square" size={32} />
<Avatar initials="JD" color="blue" />
```

### Tokens used
`colors.avatar[*].bg` / `.fill` (7 palettes, source unique partagée avec
IVAvatar) · `typography.fontFamily.sans` (initiales 600, ~36 % de la taille).

## Sprint / Explos

- Promu le 24/09/2026 ; adoption immédiate dans App.js : `userAvatar` →
  Avatar (initiales - l'encodage pièce-par-rôle disparaît), `viAvatar` /
  `vdAvatar` → `IVAvatar` (canonique - « rose » remappé « plum », absent du
  set), `CHESS_PATHS`/`chessPiece` locaux supprimés (même convergence que
  PartyAvatar, SIGNALEMENTS §8).

## Proto demo

`/ui-kit/c/Avatar`
