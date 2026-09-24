---
name: SidebarUserInfo
package: plato
status: stable
usage: The rail « profile » footer (avatar + first name + cabinet + chevrons)
source: src/components/shell/SidebarUserInfo.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36097-37493
---

# SidebarUserInfo

The rail footer (avatar + first name + cabinet + chevrons), the sanctioned identity block at the bottom of `AppSidebar`. Presentational: the avatar and the dropdown menu stay supplied by the caller, who knows the user and the menu content.

## When to use
- The footer of `AppSidebar`: identity + access to the account menu.

## When NOT to use
- A nav item → `NavItem`. A section header → `NavSectionHeader`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `avatar` | node | — | the rendered avatar (expanded / collapsed) |
| `name` | string | — | label (first name) |
| `org` | string | — | cabinet / organisation |
| `collapsed` | bool | `false` | reduced mode (avatar + tooltip) |
| `onClick` | () => void | — | opens/closes the menu |
| `tooltipLabel` / `showTooltip` | — | — | tooltip in reduced mode |
| `children` | node | — | the dropdown panel (rendered by the parent when open) |

## Examples
```jsx
import { SidebarUserInfo } from '../ui/AppSidebar';

<SidebarUserInfo name="Meghan" org="Cabinet Hexa" avatar={<Avatar/>} onClick={toggle}>
  {open && <UserMenu />}
</SidebarUserInfo>
```
