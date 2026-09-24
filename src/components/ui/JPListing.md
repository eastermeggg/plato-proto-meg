---
name: JPListing
package: plato
status: stable
usage: Canonical JP decision card (4 contexts) + listing stack
source: src/components/jp/JPListing.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/09fvZrDgcY83Js7y864E4v/Plato---Design?node-id=2219-19197
---

# JPListing

The canonical jurisprudence decision card, one anatomy for 4 product contexts: juridiction/date/bookmark header, profile, tags (`Badge`), « Apport de la décision » block, footer n° + poste badges. The context drives what shows, never the structure.

## When to use
| Variant | Product context |
|---|---|
| `detail` | Matter / poste detail page - full card, footer badges on hover |
| `dropdown` | Org / « mémoire pref » dropdown - compact row + Ajouter button |
| `added` | Org / mémoire pref added - full card |
| `tab` | Matter / JP tab - full card, footer badges always visible |

## When NOT to use
- **Inline citation within a sentence** → `JPPill`.
- **Mini results table in chat** → `JPListingChat` (card chrome + dense rows).
- **The full reading drawer** → `DecisionDrawer`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `detail \| dropdown \| added \| tab` | — | drives context, not structure |
| `jurisdiction` / `date` / `numero` | string | — | header + footer identity |
| `profile` | node | — | decision profile line |
| `tags` | `[{ label, tone?: 'destructive' }]` | — | rendered as `Badge` |
| `quantum` | `{ poste, value }` | — | info-tone quantum badge |
| `note` / `noteTitle` | string | — | « apport » block |
| `posteChips` | node | — | footer poste badges |
| `saved` | bool | — | ochre bookmark |
| `onAdd` | fn | — | dropdown Ajouter action |
| `onClick` / `pinHover` | fn / bool | — | interactive / pin hover |
| `selected` | bool | — | drawer open (ochre ring + brand subtle fill); app extension |
| `onRemove` / `removeTitle` | fn / string | — | X revealed on hover; app extension |
| `width` | — | — | passthrough |

## Examples
```jsx
import JPListing, { JPListingStack } from 'src/components/jp/JPListing';

<JPListingStack>
  <JPListing variant="tab" note="Au titre des dépenses de santé actuelles…"
    tags={[{ label: 'Type fait générateur' }, { label: 'Décédé', tone: 'destructive' }]} />
  <JPListing variant="detail" note="…" />
</JPListingStack>

<JPListing variant="dropdown" onAdd={addToMemoire} />
```
