---
name: SidebarUserInfo
package: plato
type: composite
status: draft
usage: Le pied « profil » du rail (avatar + prénom + cabinet + chevrons)
description: >
  Le pied du rail (Sidebar Custom Items / Region=UserInfo) : avatar + prénom +
  cabinet + chevrons, états Default/Hover ; mode collapsed = avatar seul + tooltip.
  Présentationnel - le menu déroulant (contenu app) est passé en children et
  affiché par le parent.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36097-37493
file: src/components/shell/SidebarUserInfo.js
source: src/components/shell/SidebarUserInfo.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: SidebarUserInfo
states: [default, hover]
modes: [expanded, collapsed]
tokens: [colors.semantic.cream, colors.semantic.foreground, colors.semantic.foregroundSecondary, colors.semantic.border]
composedBy: [AppSidebar]
---

# SidebarUserInfo

> **Type** Composite · **Status** Pending · **Usage** pied « profil » du rail
> **Figma** [Sidebar Custom Items / UserInfo](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36097-37493) · **File** `src/components/shell/SidebarUserInfo.js`

Le pied du rail. Le proto le compose (l'avatar et le menu déroulant restent
fournis par l'appelant, qui connaît l'utilisateur et le contenu du menu).

## Pattern / Variants / Examples

### When to use
- Le footer d'`AppSidebar` : identité + accès au menu compte.

### When NOT to use
- Un item de nav → `NavItem`. Un en-tête de section → `NavSectionHeader`.

### Props
| Prop | Type | Rôle |
|---|---|---|
| `avatar` | node | l'avatar rendu (24 déplié / 32 replié) |
| `name` | string | libellé (prénom) |
| `org` | string | cabinet / organisation |
| `collapsed` | bool | mode réduit (avatar + tooltip) |
| `onClick` | () => void | ouvre/ferme le menu |
| `tooltipLabel` / `showTooltip` | — | tooltip en mode réduit |
| `children` | node | le panneau déroulant (rendu par le parent quand ouvert) |

### Examples
```jsx
import { SidebarUserInfo } from '../ui/AppSidebar';

<SidebarUserInfo name="Meghan" org="Cabinet Hexa" avatar={<Avatar/>} onClick={toggle}>
  {open && <UserMenu />}
</SidebarUserInfo>
```

### Tokens used
`colors.semantic.cream` (survol), `foreground` / `foregroundSecondary` (nom + org),
`border` (filet haut).

## Sprint / Explos

- Extrait du rail proto le 22/09 (markup à l'identique - bascule sans delta visuel). Voisin : `AppSidebar`.

## Proto demo

Visible en contexte : le pied du rail gauche du proto.
