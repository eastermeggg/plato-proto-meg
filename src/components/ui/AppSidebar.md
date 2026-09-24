---
name: AppSidebar
package: plato
status: beta
usage: THE canonical navigation shell (left rail) - compose, never re-roll
source: src/components/ui/AppSidebar.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36097-42882
---

# AppSidebar

The navigation shell **never changes**. It is therefore ONE component, documented
once, composed everywhere - you NEVER re-roll an inline rail. `AppSidebar`
composes and re-exports the battle-tested proto pieces (`NavItem`,
`NavSectionHeader`) behind a single import door; the only new part is the rail
chrome (header + scroll + footer).

_Beta - proto nav + settings sub-rail still assemble the rail inline, migration onto the AppSidebar chrome is staged (issue #__)._

## When to use
- Any left navigation rail: the DS platform, the proto, the settings sub-rail.
  Always compose `AppSidebar` + its sub-components.

## When NOT to use
- A properties / tools panel on the right → that's not a nav; use a dedicated `<aside>` (playground Controls rail).
- A horizontal tab bar (dossier nav V2) → that's the Top Bar / `Niveau3Strip`, not this rail.

## Props
| Component | Role / props |
|---|---|
| `AppSidebar` | rail chrome: `header`, `footer`, `width` (264), `children`, `onCollapse` (renders the collapse button in the header) |
| `SidebarBrand` | header: `chip`, `onClick`, `title` ("Plato") |
| `SidebarGroup` | `label`, `action` (create button), `last`, `children` — wraps `NavSectionHeader` |
| `NavItem` (shell) | `variant` (destination/recent/create/see-all), `icon`, `label`, `trail`, `active`, `collapsed`, `onClick` |
| `NavSectionHeader` (shell) | `label`, `action` |

Behavior notes: rail is fixed-width, `flex-shrink-0`, `background` fill + right
`borderStrong` edge. The rail lives in a nav slot driven by the shell (open /
hidden / peek) - a page passes content, never manages state. Entering a dossier
auto-collapses the org nav (product rule); `⌘\` toggles everywhere. No reduced
icon rail: the only collapse is the hidden state (width 0). Full behavior:
`src/components/shell/NAV-BEHAVIOR.md`. Settings replaces the org nav with
`SettingsSidebar` (the sub-rail IS the nav).

## Examples
```jsx
// A single door: NavItem / NavSectionHeader / SidebarUserInfo re-exported.
import { AppSidebar, SidebarBrand, SidebarGroup, NavItem, SidebarUserInfo } from '../ui/AppSidebar';
import { Home, FolderOpen, MessageCircle, Settings, FolderPlus, MessageCirclePlus } from 'lucide-react';

<AppSidebar
  header={<SidebarBrand onClick={goHome} />}
  footer={<SidebarUserInfo name="Meghan" org="Cabinet Hexa" avatar={<Avatar/>} onClick={openMenu} />}
>
  <NavItem icon={Home}          label="Accueil"           active={page==='home'}          onClick={goHome} />
  <NavItem icon={FolderOpen}    label="Mes dossiers"      active={page==='dossiers'}      onClick={goDossiers} />
  <NavItem icon={MessageCircle} label="Mes conversations" active={page==='conversations'} onClick={goConversations} />
  <NavItem icon={Settings}      label="Paramètres"        active={page==='settings'}      onClick={goSettings} />

  <SidebarGroup label="Dossiers récents">
    <NavItem variant="create" icon={FolderPlus} label="Nouveau dossier" onClick={createDossier} />
    <NavItem variant="recent" icon={FolderOpen} label="Martel / AXA" onClick={openMartel} />
    <NavItem variant="see-all" label="Voir tout" onClick={goDossiers} />
  </SidebarGroup>
  <SidebarGroup label="Conv. récentes" last>
    <NavItem variant="create" icon={MessageCirclePlus} label="Nouvelle conversation" onClick={newConv} />
    <NavItem variant="recent" label="Préavis - fin de contrat" trail="Martel / AXA" onClick={openConv} />
  </SidebarGroup>
</AppSidebar>
```
