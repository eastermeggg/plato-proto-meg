---
name: KindIcon
package: plato
status: beta
usage: The Doc Preview identity chip - an icon on a per-kind subtle fill
source: src/components/preview/PreviewAtoms.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37375-9147
---

# KindIcon

Doc Preview atom: a rounded square carrying the kind's icon on its subtle fill. Canonical accents via `colors.accents`: piece / modele / email indigo · jp emerald · loi violet · ligne sand · web neutral. Rendered by `PanelHeader`; never an inline colored chip.

_Beta - pending steward validation (issue #__)._

## When to use
- The kind chip of a preview panel (`PanelHeader`) or a source card.

## When NOT to use
- An interactive source pill → `SourceBadge`.
- A status / category badge → `Badge`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `kind` | key of `KIND_ACCENTS` | `piece` (fallback) | picks the accent (`piece`/`modele`/`email`/`jp`/`loi`/`ligne`/`web`) |
| `icon` | Lucide component | — | the icon rendered inside |
| `accent` | `{ bg, fg }` | — | overrides the kind accent |
| `className` | string | `''` | passthrough |

## Examples
```jsx
import { KindIcon } from 'src/components/preview/PreviewAtoms';
<KindIcon kind="jp" icon={Scale} />
```
