---
name: Alert
package: plato
status: stable
usage: Inline non-blocking message banner - icon + title + description, 4 semantic variants
source: src/components/ui/Alert.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2813-9373
---

# Alert

Contextual message banner inside the page flow. Non-blocking, not dismissible
by default - it documents a state, it doesn't interrupt.

## When to use
- Flag a contextual state in a page or panel: information, warning, zone error.
- Complete a form or section with a persistent message (not a toast).
- With `actionLabel`: offer an inline exit (« Réessayer », « Voir le dossier »).

## When NOT to use
- **Blocking confirmation** - `AlertDialog` (centered modal).
- **Compact status on a row** - `Badge`.
- **Rail promo banner** - `NavPromoBanner`.
- **Field error** - `error` / `warning` states of `Input` / `InputGroup`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `default \| destructive \| info \| warning` | `default` | intent / color family |
| `title` / `description` | string | - | each optional |
| `icon` | lucide component | `AlertTriangle` | swappable (`Info`, `CircleAlert`…) |
| `hideIcon` | bool | `false` | |
| `actionLabel` / `actionIcon` / `onAction` | - | - | link-button below the text |
| `children` | node | - | free content below the description |
| `className` / `style` | - | - | escape hatches |

## Examples
```jsx
import Alert from '../ui/Alert';
import { Info, ArrowLeft } from 'lucide-react';

<Alert title="Titre" description="Ceci est la description de l'alerte" />
<Alert variant="destructive" title="Import impossible"
  description="Le bordereau contient des pièces en double." />
<Alert variant="info" icon={Info} title="Synchronisation en cours"
  description="Les pièces arrivent au fil de l'eau." />
<Alert variant="warning" title="Boîte non connectée"
  actionLabel="Connecter la boîte" actionIcon={ArrowLeft} onAction={connect} />
```
