---
name: Spinner
package: plato
status: stable
usage: Inline loading indicator (spinning loader-circle icon)
source: src/components/ui/Spinner.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=33609-22857
---

# Spinner

The lucide `loader-circle` (Loader2) icon spinning continuously. Five sizes, color driven by token (foreground by default). The Figma set freezes 4 rotations - in code, a single `animate-spin` animation.

## When to use
- Local loading: inside an `Item`, a cell, a field, an empty state.
- Tinted loading: pass a feedback token (`colors.feedback.info.base`…) via `color`.
- On a dark surface / primary button: `color={colors.semantic.white}`.

## When NOT to use
- **Button mid-action** → `Button loading` (the spinner is already built in).
- **Measurable progress** → `Progress` (determinate bar).
- **Page skeleton** → shimmer / skeleton, not an isolated spinner.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `size` | `xs \| sm \| md \| lg \| xl` | `sm` | icon scale (xs to xl) |
| `color` | color token | `colors.semantic.foreground` | any color token |
| `label` | string | `'Chargement'` | aria-label (role="status") |
| `className` / `style` / `title` | — | — | passthrough |

## Examples
```jsx
import Spinner from 'src/components/ui/Spinner';
import { colors } from 'src/design-system/tokens';

<Spinner />
<Spinner size="xl" />
<Spinner size="md" color={colors.semantic.mutedForeground} />
<Spinner color={colors.feedback.info.base} label="Analyse en cours" />
```
