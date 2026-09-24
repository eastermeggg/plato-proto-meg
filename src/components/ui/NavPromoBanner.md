---
name: NavPromoBanner
package: plato
status: stable
usage: Contextual rail promo banner (mailbox not connected / referral)
source: src/components/shell/NavPromoBanner.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37471-1271
---

# NavPromoBanner

Full-width rail banner (horizontal info-blue gradient + info-text icon/text +
chevron) for a contextual push. Two placements: `edge=top` (below the header)
or `edge=bottom` (nav footer).

## When to use
- A contextual push inside the rail: « Connectez votre boîte mail » (top),
  referral « -10% » (bottom).

## When NOT to use
- A full-width app status message → trial banner / bandeau dossier.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `icon` | Lucide | — | leading icon |
| `label` | string | — | label |
| `edge` | `top \| bottom` | — | bottom rule (top) or top rule (bottom) |
| `onClick` | fn | — | interaction |
| `title` | string | — | native tooltip |

## Examples
```jsx
import { NavPromoBanner } from '../ui/AppSidebar';
import { Mail } from 'lucide-react';

<NavPromoBanner edge="top" icon={Mail} label="Connectez votre boîte mail" onClick={connect} />
```
