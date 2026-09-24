---
name: EmptyState
package: plato
status: beta
usage: The empty state of a data screen - icon + copy + up to two actions
source: src/components/EmptyState.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=33462-36283
---

# EmptyState

The canonical empty state: an icon, a short serif title, a muted line of copy, and up to two actions. This is the sanctioned way to render the "vide" state required on every data screen (AGENTS.md §6) - never re-roll a centered icon + text block inline.

_Beta - actions use inline `<button>`s instead of the `Button` primitive, à migrer (issue #79)._

## When to use
- The **empty** state of any data screen: no dossiers yet, no pièces imported, an empty search or filter result.
- First-run / zero-data surfaces where the primary action is "create the first item".
- Filtered lists that returned nothing, with a "Réinitialiser les filtres" secondary action.

## When NOT to use
- **Loading** state → use `Spinner` / skeletons, not EmptyState.
- **Error** state → use `Alert` (`variant="destructive"`) or a dedicated error block.
- **Inline "no value" cell** in a table → the `—` placeholder, not a full block.
- **Onboarding walkthrough** → the welcome flow, not a single empty state.

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `icon` | Lucide icon | — | rendered inside the muted circle; omit for a copy-only state |
| `title` | string | — | serif title (RL Para), required |
| `description` | string | — | muted supporting line (optional) |
| `primaryAction` | `{ label, onClick, icon? }` | — | dark primary button |
| `secondaryAction` | `{ label, onClick, icon? }` | — | outlined secondary button (optional) |

## Examples
```jsx
import EmptyState from 'src/components/EmptyState';
import { FolderPlus, Search } from 'lucide-react';

<EmptyState
  icon={FolderPlus}
  title="Aucun dossier"
  description="Créez votre premier dossier pour commencer."
  primaryAction={{ label: 'Nouveau dossier', icon: FolderPlus, onClick: onCreate }}
/>

<EmptyState
  icon={Search}
  title="Aucun résultat"
  description="Aucune pièce ne correspond à ce filtre."
  secondaryAction={{ label: 'Réinitialiser les filtres', onClick: onReset }}
/>
```
