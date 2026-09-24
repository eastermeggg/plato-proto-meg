---
name: PanelHeader
package: plato
status: stable
usage: The Doc Preview title bar - kind chip + serif title | nav + actions
source: src/components/preview/PreviewAtoms.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37375-8723
---

# PanelHeader

The title bar of the Doc Preview: left is a `KindIcon` (+ optional eyebrow
Badge) + serif title; right is nav ‹ i/N ›, a separator, an actions slot, and
Close. The `small` variant (PieceSmall kind) is a bare icon + medium title + a
text action (« Détail › »), used as a pièce's sub-header inside a row subject.


## When to use
- The title bar of any preview panel (`PreviewPanel` composes it).
- `small`: the sub-header of a pièce inside a row subject.

## When NOT to use
- The head bar of a SURFACE → `TopBar`.
- The header of a niveau 3 object → `Niveau3Strip`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `small` | bool | `false` | PieceSmall variant: bare icon + medium title + `trailing` action |
| `kind` | `piece \| modele \| email \| jp \| loi \| ligne \| web` | — | resolves the accent chip |
| `icon` | Lucide | — | the chip icon |
| `accent` | `{ bg, fg }` | — | overrides the kind accent |
| `eyebrow` | node | — | optional Badge before the title |
| `title` | node | — | serif title (display-xs) |
| `nav` | `{ index, total, onPrev, onNext }` | — | previous/next; hidden if `total <= 1` |
| `actions` | node | — | right-side actions slot (Télécharger, Supprimer…) |
| `onClose` | fn | — | Close button |
| `trailing` | node | — | `small`: text action on the right (e.g. « Détail › ») |
| `className` | string | `''` | escape hatch |

## Examples
```jsx
import { PanelHeader } from 'src/components/preview/PreviewAtoms';

<PanelHeader kind="piece" icon={FileText} title={doc.name}
  nav={{ index: 2, total: 17, onPrev, onNext }} actions={<DownloadBtn />} onClose={close} />
```
