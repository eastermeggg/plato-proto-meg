---
name: Skeleton
package: plato
status: beta
usage: Shimmering placeholder that holds layout while content loads
source: src/components/ui/Skeleton.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: null
---

# Skeleton

Loading placeholder: one or more `cream` bars with a shimmer (`.animate-shimmer`, `src/index.css`). Reserves the space real content will occupy so the layout does not jump. Promoted from `previews.jsx`, tokenized.

Derived surface: there is no Skeleton page in the Figma kit (`figmaTodo: a-dessiner`), so the visual is derived from tokens, not Figma-attested. See `docs/design-truth.md`.

## When to use
- The "loading" state of a data screen (AGENTS.md rule 6, five states) when the final shape is known.
- Placeholder rows/blocks while a list, card, or panel fetches.

## When NOT to use
- **Indeterminate spinner action** (button, short wait) → `Spinner`.
- **Determinate progress** (upload, %) → `Progress`.
- **No content will follow** (truly empty) → `EmptyState`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `width` | string \| number | `'100%'` | CSS length of each bar |
| `height` | number | `14` | bar height (px) |
| `radius` | number | `4` | bar corner radius (px) |
| `count` | number | `1` | number of stacked bars |

## Examples
```jsx
import Skeleton from 'src/components/ui/Skeleton';

<Skeleton width={240} count={3} />
<Skeleton width="100%" height={120} radius={8} />
```
