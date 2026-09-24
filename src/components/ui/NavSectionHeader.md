---
name: NavSectionHeader
package: plato
status: stable
usage: The mono header of a rail section (« DOSSIERS RÉCENTS ») + optional action
source: src/components/shell/NavSectionHeader.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37457-4903
---

# NavSectionHeader

The title of a rail section (IBM Plex Mono uppercase preceded by a brand dot,
optional create action on the right). `SidebarGroup` already lays it out for
you; use it directly only outside a SidebarGroup.

## When to use
- Title a rail section (« DOSSIERS RÉCENTS », « CONV. RÉCENTES »), with an
  optional create action attached to the section.

## When NOT to use
- A clickable row → `NavItem`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `label` | string | — | title (rendered in mono uppercase) |
| `action` | `{ label, title?, onClick }` | — | optional « + » button on the right |

## Examples
```jsx
import { NavSectionHeader } from '../ui/AppSidebar';

<NavSectionHeader label="Dossiers récents" action={{ label: 'Nouveau', onClick: create }} />
```
