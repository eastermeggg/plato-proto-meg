---
name: PageHeader
package: plato
status: stable
usage: The page header (serif title + action + optional tabs) above the content
source: src/components/ui/PageHeader.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37511-1436
---

# PageHeader

The header placed inside a page's content (not the fixed chrome): serif title +
primary action, and for listings, a tab row with counts. You compose THIS for
any listing page - never a serif `<h1>` + inline buttons. Distinct from `TopBar`
(the dossier's fixed chrome) and `Niveau3Strip` (the level-3 context bar).

## When to use
- The top of a listing page (Mes dossiers, Mes conversations): title +
  create action + optional filter tabs.

## When NOT to use
- The dossier's fixed chrome (breadcrumb + view tabs + tools) → `TopBar`.
- The level-3 context bar (poste / acte / JP / documents) → `Niveau3Strip`.
- A plain section title inside a card → raw typography, not this component.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `title` | string \| node | — | serif title (display-sm) |
| `action` | node | — | action cluster on the right (e.g. `<Button variant="primary" …/>`) |
| `tabs` | `[{ key, label, count?, icon? }]` | — | optional tab row |
| `activeTab` | string | — | key of the active tab |
| `onTabChange` | `(key) => void` | — | tab change |
| `className` / `style` | — | — | escape hatches (e.g. reduce top padding when the nav is hidden) |

Figma types: `Dossiers` (title + Button "Nouveau dossier" + tabs Ouverts /
Archivés with counts) · `Conversations` (title + Button "Nouvelle conversation",
no tabs) · `Dossier` (slim → composes `TopBar`, outside this component's scope).

`PageHeader` carries its own padding - do not wrap it in a container that adds
more. The page max-width is none (full width); only doc prose may cap at a comfortable reading measure.
Full contract + shell variants: block fiche `/ui-kit/b/shell` ("Gabarit de page").

## Examples
```jsx
import PageHeader from '../ui/PageHeader';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';

<PageHeader
  title="Mes dossiers"
  action={<Button variant="primary" icon={Plus} label="Nouveau dossier" onClick={createDossier} />}
  tabs={[
    { key: 'ouverts', label: 'Ouverts', count: 50 },
    { key: 'archives', label: 'Archivés', count: 8 },
  ]}
  activeTab={tab}
  onTabChange={setTab}
/>
```
