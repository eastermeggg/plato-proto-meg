---
name: Badge
package: plato
type: primitive
status: stable
usage: Inline status / tag / count label (non-interactive)
description: >
  Compact single-line label for status, category tags, and counts. Three modes
  (label, number, icon-only) across 8 semantic variants. Ellipsis-truncates;
  never wraps.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=136-1178
file: src/components/ui/Badge.js
source: src/components/ui/Badge.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: Badge
variants: [default, secondary, outline, destructive, ai, success, info, warning]
sizes: [sm, md]
modes: [label, number, icon-only]
tokens: [colors.badge, radius.md, radius.full, typography.scale.caption-medium]
lastValidated: 2026-05-07
---

# Badge

> **Type** Primitive · **Status** Validated (2026-05-07) · **Usage** inline status / tag / count label
> **Figma** [136:1178](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=136-1178) · **File** `src/components/ui/Badge.js`

Compact, single-line label for status, category tags, and counts. Non-interactive
by design - if it needs an action, it's a `Button`, not a Badge.

## Pattern / Variants / Examples

### When to use
- Status indicators on rows, cards, and table cells (`Validated`, `À revoir`, `Pending`, `Erreur`).
- Notification / unread counts on icons, tabs, sidebar items (`number` mode).
- Compact icon affordances inside dense toolbars (`icon-only` mode).
- Category / piece-type tags on dossier rows or chat artifacts.

### When NOT to use
- **Filter chips** → use `Tabs` (`variant="pills"`).
- **Buttons** → Badges are non-interactive; use `Button` (`secondary` / `ghost`).
- **Multi-line content** → Badge is single-line, ellipsis-truncates; use a card or callout.
- **Form inputs / toggles** → use `Checkbox`, `Switch`, or `RadioGroup`.

### Variants (8)
`default` · `secondary` · `outline` · `destructive` · `ai` · `success` · `info` · `warning`
(`destructive-subtle` and `dot` from earlier prototypes are NOT in Figma and are not public API.)

### Sizes
`sm` (default, 20 px) · `md` (24 px)

### Modes
| Mode | When | Trigger |
|------|------|---------|
| `label` | text + optional left/right icon | `<Badge label="…" leftIcon={X} rightIcon={Y} />` |
| `number` | numeric count (full-radius pill) | `<Badge count={8} />` — caps at `99+` |
| `icon-only` | single icon, no text (full-radius pill) | `<Badge iconOnly icon={Sparkles} />` |

### Examples
```jsx
import Badge from 'src/components/ui/Badge';
import { Sparkles } from 'lucide-react';

<Badge variant="success" label="Validated" />
<Badge variant="ai" label="AI" leftIcon={Sparkles} />
<Badge variant="destructive" count={12} />
<Badge variant="ai" iconOnly icon={Sparkles} />
```

### Tokens used
`colors.badge.*` (bg + fg per variant) · `colors.semantic.foregroundSecondary` (outline number/icon-only fg) · `radius.md` (label) / `radius.full` (number, icon-only) · `typography.scale['caption-medium']`

## Sprint / Explos

- **Rationalisation Pills** : deux familles distinctes - `Badge` (générique, statut/sévérité/catégorie, ici) vs *Source Badge* (interactif, 9 types de source, séparé). Règle : STATUS/SEVERITY/CATEGORY → Badge ; SOURCE TYPE → Source Badge.
- Section de démo transverse : `/ui-kit/badges-pills`.

## Proto demo

`/ui-kit/c/Badge` — sandbox live : contrôles + presets couvrant chaque mode × variante d'intérêt.
