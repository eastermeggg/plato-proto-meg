---
name: CiteRow
package: plato
status: stable
usage: One row of the Doc Preview "Extraits cités" rail
source: src/components/preview/PreviewAtoms.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37375-8836
---

# CiteRow

Doc Preview atom: citation row - round number badge + PAGE eyebrow (mono, uppercase) + 2-line excerpt. States: default (white) · hover (accent) · active stone (solid foreground badge, cream→white gradient, left rule). `CitesPanel` (37375:9168) composes it under its "EXTRAITS CITÉS" header.


## When to use
- A reference cited in the "Extraits cités" rail (via `CitesPanel`).

## When NOT to use
- A list of documents → `Item` / Doc List.
- An inline citation inside an acte → pièce badges / `JPPill`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `index` | number | — | 0-based; badge shows `index + 1` |
| `page` | string \| number | — | PAGE eyebrow (hidden if empty) |
| `text` | string | — | excerpt (2-line clamp); empty → "Extrait indisponible" |
| `active` | `boolean` | — | active/selected styling + `aria-current` |
| `onClick` | `() => void` | — | row click |
| `innerRef` | ref | — | forwarded to the button (scroll-into-view) |
| `ariaLabel` | string | — | accessible label |

`CitesPanel`: `items` `[{ page, text }]` · `active` (index) · `onGo(i)` · `width` · `title` (default `'Extraits cités'`).

## Examples
```jsx
import { CitesPanel } from 'src/components/preview/PreviewAtoms';

<CitesPanel items={cites} active={activeIdx} onGo={goToCite} width={280} />
```
