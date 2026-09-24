---
name: SourceBadge
package: plato
status: beta
usage: INTERACTIVE source pill - clicking opens the source (pièce, JP, loi, email…)
source: src/components/ui/SourceBadge.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2814-11330
---

# SourceBadge

The second family of pills: identity by source TYPE (icon + family tint), interactive - clicking opens the source in the PreviewPanel. The generic `Badge` stays for status / severity / category. `JPPill` is a SourceBadge of type `jp` with its citation slots.

_Beta - tints translated to closest tokens, exact Figma fills not yet reconciled (issue #__)._

## When to use
- Any clickable reference to a **source**: pièce, jurisprudence, loi, code article, modèle, email, web page, calculation line, PASS, assiette.
- Inline in the agent's prose, in citation rails, in actes.

## When NOT to use
- **Status, severity, category** (non-clickable) → `Badge`.
- **Action** → `Button`. A SourceBadge *opens its source*, it does not trigger a business action.

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | one of the 10 types | `piece` | identity: piece · jp · loi · code · modele · email · web · ligne · pass · assiette (icon + tint) |
| `size` | `sm \| md` | `sm` | |
| `selected` | bool | `false` | pressed border (source open) |
| `showIcon` | bool | `true` | |
| `label` | string | — | simple label (or `children` for rich content) |
| `children` | node | — | inline slots (cf. JPPill) |
| `onClick` / `onMouseEnter` / `onMouseLeave` | fn | — | interactive + hover cards |

## Examples
```jsx
import SourceBadge from '../ui/SourceBadge';

<SourceBadge type="piece" label="Pièce n°12 - Rapport d'expertise" onClick={openPiece} />
<SourceBadge type="loi" label="Art. L242-1 CSS" onClick={openLoi} />
<SourceBadge type="jp" selected>{/* citation slots - see JPPill */}</SourceBadge>
```
