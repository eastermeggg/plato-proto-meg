---
name: Badge
package: plato
status: stable
usage: Inline status / tag / count label (non-interactive)
source: src/components/ui/Badge.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=136-1178
---

# Badge

Compact, single-line label for status, category tags, and counts. Non-interactive by design - if it needs an action, it's a `Button`, not a Badge.

## When to use
- Status indicators on rows, cards, and table cells (`Validated`, `À revoir`, `Erreur`).
- Notification / unread counts on icons, tabs, sidebar items (`count`).
- Compact icon affordances inside dense toolbars (`iconOnly`).
- Category / piece-type tags on dossier rows or chat artifacts (`accent` for warm brand tags).

## When NOT to use
- **Filter chips** → use `Tabs` (`variant="pills"`).
- **Buttons** → Badges are non-interactive; use `Button` (`secondary` / `ghost`).
- **Multi-line content** → Badge is single-line, ellipsis-truncates; use a card or callout.
- **Form inputs / toggles** → use `Checkbox`, `Switch`, or `RadioGroup`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `default \| secondary \| outline \| destructive \| ai \| success \| info \| warning \| accent` | `default` | intent / color family |
| `size` | `sm \| md` | `sm` | |
| `label` | string | — | label mode (text) |
| `leftIcon` / `rightIcon` | Lucide icon | — | optional icons, label mode |
| `count` | number | — | number mode (full-radius pill); caps at `99+` |
| `iconOnly` | bool | `false` | icon-only mode (with `icon`) |
| `icon` | Lucide icon | — | the icon for icon-only mode |
| `title` | string | — | native tooltip |

## Examples
```jsx
import Badge from 'src/components/ui/Badge';
import { Sparkles } from 'lucide-react';

<Badge variant="success" label="Validated" />
<Badge variant="ai" label="AI" leftIcon={Sparkles} />
<Badge variant="destructive" count={12} />
<Badge variant="ai" iconOnly icon={Sparkles} />
```
