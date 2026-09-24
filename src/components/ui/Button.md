---
name: Button
package: plato
status: stable
usage: The single action affordance - anything the user clicks to DO something
source: src/components/ui/Button.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2814-11933
---

# Button

The single sanctioned clickable action. If it triggers an action, it's a Button;
if it navigates the app chrome, it's a nav item; if it's a non-interactive label,
it's a `Badge`. Never re-roll a `<button>` inline.

## When to use
- Any action: submit, confirm, cancel, "J'ai terminé", "Commencer", "Valider".
- Use **variant to signal intent**, not decoration:
  - `primary` — the one main action of a view (dark fill).
  - `secondary` — supporting action next to a primary (cream fill).
  - `ghost` — low-emphasis inline action (no fill until hover).
  - `outline` — neutral bordered action (white + border).
  - `destructive` — irreversible / dangerous action (red).
  - `destructive-subtle` — soft removal action in a dense row / card (`feedback.destructive.subtle`).
  - `ai-subtle` — action tied to an AI gesture (`feedback.ai.subtle`).
  - `link` / `warning-link` / `success-link` / `neutral-link` — text-only links (underline on hover).

## When NOT to use
- **Navigation of the app shell** → use the nav item components, not a Button.
- **Non-interactive status / tag / count** → `Badge`.
- **Toggle / choice** → `Switch`, `Checkbox`, `RadioGroup`.
- **A link to elsewhere** → a link styled as text, or `ghost` if it must look button-like.
- `className` / `style` are geometry escape hatches only - never to change colors, which stay on the variants.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `primary \| secondary \| ghost \| outline \| destructive \| destructive-subtle \| ai-subtle \| link \| warning-link \| success-link \| neutral-link` | `primary` | intent |
| `size` | `xs \| sm \| md \| lg \| icon-xs \| icon-sm \| icon \| icon-lg` | `md` | icon-* = square icon-only |
| `icon` | Lucide icon | — | rendered at the size's `iconSize` |
| `iconPosition` | `leading \| trailing` | `leading` | |
| `label` | string | — | text (or `children`) |
| `children` | node | — | alternative to `label` |
| `loading` | bool | `false` | spinner, clicks suppressed |
| `disabled` | bool | `false` | 50% opacity, `not-allowed` |
| `onClick` | fn | — | |
| `fullWidth` | bool | `false` | stretch to container |
| `type` | string | `button` | |
| `title` | string | — | tooltip |

## Examples
```jsx
import Button from '../ui/Button';
import { Check, Clock, ArrowRight } from 'lucide-react';

<Button variant="primary" label="J'ai terminé" icon={Check} onClick={onDone} />
<Button variant="outline" label="Commencer moi-même" icon={Clock} onClick={onLog} />
<Button variant="primary" size="lg" label="Valider · mois suivant" icon={ArrowRight} iconPosition="trailing" />
<Button variant="destructive" label="Supprimer" onClick={onDelete} />
```
