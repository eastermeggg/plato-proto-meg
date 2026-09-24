---
name: Kbd
package: plato
status: stable
usage: Inline keyboard shortcut (single key or combination)
source: src/components/ui/Kbd.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=29794-42330
---

# Kbd

Compact chip that renders a keyboard key inside text, a tooltip or a menu. Two variants (default, reversed for dark surfaces) and a `KbdGroup` export for combinations. Non-interactive - it's a label, not a button.

## When to use
- Show a shortcut next to a command (command palette, menus, tooltips).
- Document a combination (`KbdGroup`: `⌘` `K`, or `Ctrl + Opt + F` in `separated` mode).
- On a dark surface (tooltip, primary button) → variant `reversed`.

## When NOT to use
- **Status / category badge** → `Badge`.
- **Clickable button** → `Button`; Kbd has no interactive state.
- **Inline code / technical values** → mono typography, not Kbd.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `default \| reversed` | `default` | `reversed` = bg white 20%, background text (dark surfaces) |
| `label` | string \| node | `⌘` | key content |
| `leftIcon` / `rightIcon` | Lucide icon | - | optional icon |
| `className` / `style` / `title` | - | - | passthrough |

`KbdGroup` (named export): `keys` (default `['⌘','⇧','⌥','⌃']`), `separated` (default `false` - inserts a `+` foreground separator), `variant`.

## Examples
```jsx
import Kbd, { KbdGroup } from 'src/components/ui/Kbd';

<Kbd label="⌘" />
<KbdGroup keys={['⌘', 'K']} />
<KbdGroup keys={['Ctrl', 'Opt', 'F']} separated />
<Kbd variant="reversed" label="Entrée" />
```
