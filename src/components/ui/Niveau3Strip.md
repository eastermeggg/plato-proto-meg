---
name: Niveau3Strip
package: plato
status: stable
usage: The level-3 context bar (poste / acte / JP / documents) below the tabs
source: src/components/shell/Niveau3Strip.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37447-5922
---

# Niveau3Strip

The bar placed below the dossier tabs when you enter an object (poste, acte,
JP…): a named return, code, serif title, value, and previous/next among
siblings. You compose THIS, never an inline `border-b` context bar. A new
level-3 object = content passed to `Niveau3Strip` + its building blocks, not a
new bar by hand (see `AGENTS.md`, shell rules). It's the proto's
`renderContentSubHeader` that composes it.

## When to use
- The header of a level-3 object: named return + code + title + value + siblings.

## When NOT to use
- The PAGE header (listing) → `PageHeader`.
- The dossier's fixed chrome (breadcrumb + view tabs) → `TopBar`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `back` | node | — | return on the first line (gap 10) |
| `justify` | `between \| start` | — | title ↔ actions, or left-packed |
| `children` | node | — | left/right content composed from the building blocks below |

Building block exports (composed inside `Niveau3Strip`):

| Export | Role |
|--------|------|
| `BreadcrumbReturn` | named return: arrow + label medium muted (hover foreground) |
| `StripTitle` | serif title |
| `StripAmount` | serif amount |
| `SiblingNav` | previous/next + counter « n / N » mono |
| `CodeBadge` | code badge muted fill, secondary-foreground |
| `StripDivider` | vertical divider (`tall`, before the primary action) |

Full-width bar, `flex-shrink-0`, placed below `TopBar` (or at the top of the
content if there's no TopBar), above the scrollable body. NEVER stacks with
another return: a single return level visible at a time. No max-width. Page
contract: block fiche `/ui-kit/b/shell`.

Five kinds per page/tab (all composed from the blocks):

| Kind | Left | Right |
|------|------|-------|
| Poste | return ↵ CodeBadge + StripTitle | SiblingNav · StripAmount · tall divider · primary action |
| Actes | StripTitle ("X actes") | primary action "Nouvel acte" |
| Acte | return ↵ StripTitle | Acte/Bordereau tabs + actions |
| Documents | search muted | "Nouveau dossier" (outline) + "Ajouter des docs" (primary) |
| JP | StripTitle | primary action "Rechercher" |

## Examples
```jsx
import Niveau3Strip, { BreadcrumbReturn, CodeBadge, StripTitle, StripAmount, StripDivider, SiblingNav } from '../ui/Niveau3Strip';

<Niveau3Strip justify="between" back={<BreadcrumbReturn label="Retour au chiffrage" onClick={back} />}>
  <div className="flex items-center gap-2.5">
    <CodeBadge>DFP</CodeBadge>
    <StripTitle>Déficit fonctionnel permanent</StripTitle>
  </div>
  <div className="flex items-center gap-3">
    <SiblingNav index={2} total={9} onPrev={prev} onNext={next} />
    <StripAmount>38 900 €</StripAmount>
    <StripDivider tall />
    <Button variant="primary" size="sm" label="Copier chiffrage" />
  </div>
</Niveau3Strip>
```
