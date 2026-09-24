---
name: TopBar
package: plato
status: stable
usage: The fixed top bar (dossier nav V2) - slotted chrome + built-in nav control
source: src/components/ui/TopBar.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37443-5796
---

# TopBar

A single fixed bar (no more 3 stacked bars). You compose THIS for any top bar (dossier, conversation, settings) - never an inline bordered bar. Nav hidden: the bar ITSELF renders `NavExpandControl` + hairline. The content (breadcrumb, serif name, tabs, tools) comes from the surface via the slots. Title + actions in the content is `PageHeader` (distinct), not this.

## When to use
- The top bar of a surface: breadcrumb + tabs on the left, tools on the right.

## When NOT to use
- The **page title + actions** (in the content, sticky) → `PageHeader`.
- The **side nav** → `AppSidebar`.

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `navCollapsed` | bool | `false` | nav hidden → the bar renders NavExpandControl + hairline, padding grows |
| `onNavExpand` / `onNavHome` / `onNavPeekEnter` / `onNavPeekLeave` | fn | — | handlers for the "Menu" control |
| `left` | node | — | breadcrumb + serif name + tabs (active tab underline at the bottom divider), separated by `TopBarHairline` |
| `right` | node | — | tools (Plato Assistant, menu…) |
| `leading` | node | — | escape hatch: custom element(s) at the head of the left cluster |

Named export: `TopBarHairline` - the chrome's vertical hairline (border-strong). Full-width bar at the top of the content column, `flex-shrink-0`, no max-width. Full page contract: block fiche `/ui-kit/b/shell`; behavior `shell/NAV-BEHAVIOR.md` §0.

## Examples
```jsx
import TopBar, { TopBarHairline } from '../ui/TopBar';

<TopBar
  navCollapsed={navHidden}
  onNavExpand={expandNav} onNavHome={goHome}
  onNavPeekEnter={openPeek} onNavPeekLeave={schedulePeekClose}
  left={<><Breadcrumb /><TopBarHairline /><Tabs /></>}
  right={<><PlatoAssistantButton /><MoreMenu /></>}
/>
```
