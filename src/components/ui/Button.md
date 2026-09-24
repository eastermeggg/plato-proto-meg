---
name: Button
package: plato
type: primitive
status: draft
usage: The single action affordance - anything the user clicks to DO something
description: >
  Plato action button. Five variants map to intent (primary action, secondary,
  low-emphasis ghost, bordered outline, destructive). Icon-capable, three sizes.
  The only sanctioned button - never re-roll one inline.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2814-11933
file: src/components/ui/Button.js
source: src/components/ui/Button.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: Button
variants: [primary, secondary, ghost, outline, destructive, destructive-subtle, ai-subtle, link, warning-link, success-link, neutral-link]
sizes: [xs, sm, md, lg, icon-xs, icon-sm, icon, icon-lg]
states: [enabled, hover, focus-visible, active, loading, disabled]
figmaVariants: [Default, Secondary, Destructive, Outline, Ghost, Link, Warning Link, Success Link, Neutral Link]
figmaSizes: [XS, Small, Default, Large, Icon XS, Icon Small, Icon, Icon Large]
figmaStates: [Enabled, Hover, Focus, Active, Loading, Disabled]
tokens: [colors.semantic.primary, colors.semantic.muted, colors.semantic.border, colors.feedback.destructive, colors.feedback.ai, colors.banner.neutral]
promotedFrom: src/components/ui-kit/previews.jsx
---

# Button

> **Type** Primitive · **Status** Pending (built, no Figma ref yet) · **Usage** the one action affordance
> **File** `src/components/ui/Button.js` · promu depuis `ui-kit/previews.jsx`

The single sanctioned clickable action. If it triggers an action, it's a Button;
if it navigates the app chrome, it's a nav item; if it's a non-interactive label,
it's a `Badge`.

## Pattern / Variants / Examples

### When to use
- Any action: submit, confirm, cancel, "J'ai terminé", "Commencer", "Valider".
- Use **variant to signal intent**, not decoration:
  - `primary` — the one main action of a view (dark fill).
  - `secondary` — supporting action next to a primary (cream fill).
  - `ghost` — low-emphasis inline action (no fill until hover).
  - `outline` — neutral bordered action (white + border).
  - `destructive` — irreversible / dangerous action (red).
  - `destructive-subtle` — action de retrait douce dans une rangée / carte
    (fond `feedback.destructive.subtle`, texte `.text`) - promu de l'ex-SmallBtn
    de l'import V2 (24/09/2026). Réservé aux contextes denses ; le destructif
    plein reste la norme pour les confirmations.
  - `ai-subtle` — action liée à un geste IA (découpe, suggestion) : fond
    `feedback.ai.subtle`, texte `.text`. Même origine.

### When NOT to use
- **Navigation of the app shell** → use the nav item components, not a Button.
- **Non-interactive status / tag / count** → `Badge`.
- **Toggle / choice** → `Switch`, `Checkbox`, `RadioGroup`.
- **A link to elsewhere** → a link styled as text, or `ghost` if it must look button-like.
- **Never** re-roll a `<button>` with inline styles - import this.
- Échappatoires `className` / `style` (23/09) : ajustements de géométrie ponctuels depuis un contexte précis (ex. CTA nav h32/px12 aligné à gauche) - jamais pour changer les couleurs, qui restent aux variants.

### Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `primary \| secondary \| ghost \| outline \| destructive \| destructive-subtle \| ai-subtle \| link \| *-link` | `primary` | intent |
| `size` | `sm \| md \| lg` | `md` | |
| `icon` | Lucide icon | — | rendered at the size's `iconSize` |
| `iconPosition` | `leading \| trailing` | `leading` | |
| `label` | string | — | text (or `children`) |
| `children` | node | — | alternative to `label` |
| `disabled` | bool | `false` | 50% opacity, `not-allowed` |
| `onClick` | fn | — | |
| `fullWidth` | bool | `false` | stretch to container |
| `type` | string | `button` | |
| `title` | string | — | tooltip |

### Examples
```jsx
import Button from '../ui/Button';
import { Check, Clock, ArrowRight } from 'lucide-react';

<Button variant="primary" label="J'ai terminé" icon={Check} onClick={onDone} />
<Button variant="outline" label="Commencer moi-même" icon={Clock} onClick={onLog} />
<Button variant="primary" size="lg" label="Valider · mois suivant" icon={ArrowRight} iconPosition="trailing" />
<Button variant="destructive" label="Supprimer" onClick={onDelete} />
```

### Tokens used
`colors.semantic.primary` / `foregroundTertiary` (primary) · `colors.semantic.muted` / `input` (secondary) · `colors.semantic.border` (outline) · `colors.feedback.destructive.text` (destructive) · `colors.banner.neutral.bgFrom` (ghost/outline hover). Zero hardcoded values.

## Sprint / Explos

- Promu depuis la preview validée de `ui-kit/previews.jsx` (mêmes variants/props).
- Teinte de marque : voir le lab `/ui-kit/brand-orange` (l'orange « Vif atténué » n'est PAS un aplat de bouton).

### Écart vs Figma — COMBLÉ (22/09/2026)

Le composant code couvre désormais le set Figma ([page Button](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2814-11933), ~290 variants), traduit en tokens (jamais de transcription pixel) :

| Axe | Figma | Code |
|---|---|---|
| Types | 9 | 9 ✓ (`link` = info.text, `warning/success-link` = feedback.text, `neutral-link` = mutedForeground ; souligné au survol) |
| Tailles | 8 | 8 ✓ (`xs` h22 + 4 icon-only carrés 22/26/34/40, alignés sur les hauteurs texte) |
| États | 6 | 6 ✓ (`loading` : spinner Loader2 + clics coupés ; focus ring `:focus-visible` sur le token ring ; active = pressed natif) |

Ajouts **additifs** : props existantes inchangées, aucun call-site cassé.

## Proto demo

`/ui-kit/c/Button` — sandbox : variants × sizes × icon positions × disabled.
