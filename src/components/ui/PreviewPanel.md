---
name: PreviewPanel
package: plato
status: beta
usage: One preview shell for every source kind (piece/modele/jp/email/loi/ligne/web)
source: src/components/preview/PreviewPanel.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37375-9330
---

# PreviewPanel

One shell (serif header, scrollable body, meta bar, shared citations rail with scroll-to-citation), and a body + metadata plugged per source kind via `PREVIEW_KINDS`: piece · modele · jp · email · loi · ligne · web. It composes the `PreviewAtoms.js` atoms (KindIcon, PanelHeader, MetaChip, CiteRow / CitesPanel, Previewer / PreviewerPage), never an inline redefinition.

_Beta - local CHESS_PATHS avatar duplicate to resorb toward `IVAvatar` (issue #84)._

## When to use
- **Any source preview** opened from the chat, the bordereau, a poste or a citation - one panel, never an ad hoc viewer.
- « ligne de poste » subject: pass `ligne` - the doc becomes the attached pièce, a rail edits the ligne's values (`railLeft` to compare).

## When NOT to use
- **Long reading of a decision** → `DecisionDrawer`.
- **Action dialogs** (rename, split…) → centered modals; the panel carries no destructive actions.
- **Web link** → `kind="web"` does NOT open a panel (external link) - encoded in `PREVIEW_KINDS`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `kind` | string | — | source kind (piece · modele · jp · email · loi · ligne · web) |
| `source` | object | — | descriptor: name, type, date, pages, summary, provenance, passages… |
| `onClose` / `onPrev` / `onNext` | fn | — | navigation callbacks |
| `navIndex` / `navTotal` | number | — | position in the nav sequence |
| `embedded` | bool | `false` | in-flow render, for labs/demos |
| `onOpenSource` | fn | — | cross-navigation to another source |
| `ligne` / `railLeft` | object | — | ligne subject (doc = attached pièce, edit rail) |

## Examples
```jsx
import PreviewPanel from 'src/components/preview/PreviewPanel';

<PreviewPanel kind="piece" source={piece} embedded onOpenSource={openSource} />
<PreviewPanel kind="jp" source={jpSource} onClose={close} />
```
