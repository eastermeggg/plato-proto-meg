---
name: ChatComposerNotice
package: plato
status: stable
usage: Status banner above the chat composer (analyzing / quota)
source: src/components/ChatComposerNotice.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: null
---

# ChatComposerNotice

Status banner placed above the composer: analyzing (Plato thinking), quota-warning (weekly usage gauge), quota-full. Code-first — the code is the source.

## When to use
- `analyzing` : Plato is working - the composer stays visible but announces the processing under way.
- `quota-warning` / `quota-full` : the weekly usage gauge approaches / reaches 100 % (licences + usage pricing model); CTA to usage and upgrade.

## When NOT to use
- **Conversation errors** → an error message in the thread, not a banner.
- **Marketing banners** → `NavPromoBanner` / dedicated banners.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `'analyzing' \| 'quota-warning' \| 'quota-full'` | — | unknown variant → renders nothing (null) |
| `pct` | number | — | usage % (quota variants) |
| `onOpenUsage` | `() => void` | — | open usage detail |
| `onRequestUpgrade` | `() => void` | — | upgrade CTA |

## Examples
```jsx
import ChatComposerNotice from 'src/components/ChatComposerNotice';

<ChatComposerNotice variant="analyzing" />
<ChatComposerNotice variant="quota-warning" pct={92}
  onOpenUsage={openUsage} onRequestUpgrade={upgrade} />
```
