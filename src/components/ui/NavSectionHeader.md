---
name: NavSectionHeader
package: plato
type: composite
status: draft
usage: L'en-tête mono d'une section du rail (« DOSSIERS RÉCENTS ») + action optionnelle
description: >
  L'en-tête de section du rail : IBM Plex Mono 11 uppercase (opacité 70) précédé
  d'un point brand 4px. Action de création optionnelle à droite (bouton bordé
  « + » qui pivote au survol). Ré-exportée par AppSidebar / portée par SidebarGroup.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37457-4903
file: src/components/shell/NavSectionHeader.js
source: src/components/shell/NavSectionHeader.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: NavSectionHeader
tokens: [colors.brand.DEFAULT, colors.semantic.mutedForeground, colors.semantic.borderStrong]
composedBy: [AppSidebar, SidebarGroup]
---

# NavSectionHeader

> **Type** Composite · **Status** Pending · **Usage** en-tête mono d'une section du rail
> **Figma** [Nav Item / SectionHeader](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37457-4903) · **File** `src/components/shell/NavSectionHeader.js`

Le titre d'une section du rail. `SidebarGroup` le pose déjà pour toi ; on l'utilise
en direct seulement hors d'un SidebarGroup.

## Pattern / Variants / Examples

### When to use
- Titrer une section du rail (« DOSSIERS RÉCENTS », « CONV. RÉCENTES »), avec une
  action de création optionnelle rattachée à la section.

### When NOT to use
- Une ligne cliquable → `NavItem`.

### Props
| Prop | Type | Rôle |
|---|---|---|
| `label` | string | titre (rendu en mono uppercase) |
| `action` | `{ label, title?, onClick }` | bouton « + » optionnel à droite |

### Examples
```jsx
import { NavSectionHeader } from '../ui/AppSidebar';

<NavSectionHeader label="Dossiers récents" action={{ label: 'Nouveau', onClick: create }} />
```

### Tokens used
`colors.brand.DEFAULT` (point de tête), `colors.semantic.mutedForeground` (texte
mono), `colors.semantic.borderStrong` (bord du bouton d'action).

## Sprint / Explos

- Surfacé dans le DS le 22/09, en même temps que `NavItem` (même set Figma).
- Voisins : `NavItem` (lignes), `AppSidebar` / `SidebarGroup` (le rail qui la compose).

## Proto demo

Visible en contexte : les en-têtes de section du rail gauche du proto.
