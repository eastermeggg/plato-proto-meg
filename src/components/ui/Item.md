---
name: Item
package: plato
status: stable
usage: Generic list / menu row (media + title + description + actions)
source: src/components/ui/Item.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=32847-5869
---

# Item

The do-it-all row: media on the left, title + description in the center, actions on the right. Two types (default, outline), two sizes, accent hover when interactive. The hover (bg accent) only kicks in if the row is interactive.

## When to use
- Lists of settings, connectors, notifications (title + description + action).
- Clickable row of a rich menu or a panel (with `onClick`).
- Light self-contained card → `variant="outline"` (+ `header` / `footer` if needed).
- Homogeneous stacks → `ItemGroup` (named export, Items joined).

## When NOT to use
- **Data tables** (typed columns, sorting) → `DataTableCell` / DomainTableRows.
- **Rail navigation** → `NavItem` (canonical shell, never re-rolled).
- **JP cards** → `JPListing` ; **statuses** → `Badge`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `default \| outline` | `default` | `outline` adds a border |
| `size` | `md \| sm` | `md` | `md` = Figma Default, `sm` = Figma Small (avatar media) |
| `icon` | Lucide icon | - | icon in the framed media box (bg muted, border) |
| `media` | node | - | free node in place of the box (avatar, image, `Spinner`) |
| `title` | string | `Title` | body-medium foreground |
| `description` | string | `Description` | body muted-foreground |
| `actions` | node | - | node(s) on the right (`Button` size `sm`, usually) |
| `header` / `footer` | node | - | full-width slots (visual header / row) |
| `onClick` / `pinHover` | fn / bool | - | makes it interactive (role button) / pins the hover |
| `className` / `style` | - | - | passthrough |

## Examples
```jsx
import Item, { ItemGroup } from 'src/components/ui/Item';
import Button from 'src/components/ui/Button';
import Progress from 'src/components/ui/Progress';
import { BadgeCheck } from 'lucide-react';

<Item icon={BadgeCheck} title="Boîte connectée" description="Synchronisation active"
  actions={<Button variant="outline" size="sm" label="Gérer" />} />

<Item variant="outline" title="Dossier Martin c/ SARL Dupont"
  description="12 pièces importées" onClick={openDossier} />

<Item size="sm" media={<img alt="" src={avatarUrl} style={{ width: 32, height: 32, borderRadius: 9999 }} />}
  title="Camille Aubry" description="Vu il y a 2 h" />

<ItemGroup>
  <Item title="Pièce n° 12" description="Facture" onClick={open} />
  <Item title="Pièce n° 13" description="Relevé" onClick={open} />
</ItemGroup>
```
