---
name: PlatoAssistantButton
package: plato
status: stable
usage: The CTA to open the Plato assistant (white pill + brand halo)
source: src/components/shell/PlatoAssistantButton.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37444-5885
---

# PlatoAssistantButton

White « Plato Assistant » pill with a Sparkle AI glyph, blurred brand halo, and comet ring - the sanctioned way to reopen the assistant rail. It is a brand CTA, never re-rolled as a plain button.

## When to use
- Reopen the Plato assistant from a dossier's TopBar when the rail is closed.

## When NOT to use
- A generic action → `Button`. This is a brand CTA, reserved for the assistant.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `onClick` | () => void | — | opens the assistant rail |

## Examples
```jsx
import PlatoAssistantButton from 'src/components/shell/PlatoAssistantButton';

<PlatoAssistantButton onClick={openAssistant} />
```
