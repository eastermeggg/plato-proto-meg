---
name: NavExpandControl
package: plato
status: stable
usage: The « Menu » control that reopens the rail when the nav is hidden
source: src/components/shell/NavExpandControl.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37443-5724
---

# NavExpandControl

Presentational control visible ONLY when the nav is hidden: Plato logo (→ home) + « Menu » button (panel glyph + label). Hover = immediate peek, click = reopen. Use `absolute` to anchor it top-left on barless surfaces. Rendered by `TopBar` when `navCollapsed`.

## When to use
- Rendered by the parent when `navHidden`: keeps a brand anchor + reopens the rail.
- Page with `PageHeader` (listing): a dedicated band ABOVE the title; the `PageHeader` then receives `className="pt-3"`.
- Page with `TopBar` (dossier): the `TopBar` renders it itself (via `navCollapsed`), followed by a hairline - do not compose it by hand. Full page contract: block fiche `/ui-kit/b/shell`.

## When NOT to use
- Collapsing the nav (button in the open header) → `PanelToggleIcon` in the header.
- As an overlay on the page title → use the canonical placements above.

## Props
| Prop | Type | Role |
|---|---|---|
| `onExpand` | () => void | click = reopen |
| `onPeekEnter` / `onPeekLeave` | () => void | hover = peek |
| `onHome` | () => void | logo click = home |
| `absolute` | bool | top-left anchoring (barless surfaces) |

## Examples
```jsx
import NavExpandControl from 'src/components/ui/NavExpandControl';

<NavExpandControl onExpand={openNav} onPeekEnter={peek} onPeekLeave={unpeek} onHome={goHome} />
<NavExpandControl absolute onExpand={openNav} onHome={goHome} />
```
