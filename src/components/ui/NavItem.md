---
name: NavItem
package: plato
status: stable
usage: The org nav row (Plato rail) - destination / recent / create / see-all
source: src/components/shell/NavItem.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37441-55015
---

# NavItem

The rail row. Import it from `AppSidebar` (`import { NavItem } from '../ui/AppSidebar'`)
and compose it inside a `SidebarGroup` - never an inline nav `<button>`.

## When to use
- Any clickable row of the left rail: destination, recent dossier/conversation,
  create at the top of a section, « Voir tout » at the foot.

## When NOT to use
- The mono section header (« DOSSIERS RÉCENTS ») → `NavSectionHeader`.
- An action outside the rail → `Button`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `destination \| recent \| create \| see-all` | `destination` | shape |
| `icon` | Lucide | — | leading icon (destination / recent / create) |
| `label` | string | — | label |
| `trail` | string | — | 2nd line (dossier ref.) - recent variant |
| `active` | bool | `false` | active state (destination / recent): cream background + border-strong edge + medium text + brand icon + orange accent |
| `onClick` | fn | — | interaction |
| `title` | string | — | native tooltip |

`collapsed` (icon-only) still exists on the component but is a legacy vestige:
the Plato rail has no reduced mode (it goes hidden, not an icon rail). Do not
use it. Cf. `AppSidebar.md`.

## Examples
```jsx
import { NavItem, SidebarGroup } from '../ui/AppSidebar';

<SidebarGroup label="Dossiers récents">
  <NavItem variant="create" icon={FolderPlus} label="Nouveau dossier" onClick={create} />
  <NavItem variant="recent" icon={FolderOpen} label="Martel / AXA" active />
  <NavItem variant="recent" label="Préavis - fin de contrat" trail="Martel / AXA" />
  <NavItem variant="see-all" label="Voir tout" onClick={seeAll} />
</SidebarGroup>
```
