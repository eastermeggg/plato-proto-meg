---
name: MetaChip
package: plato
status: beta
usage: The Doc Preview metadata chip (14 canonical types)
source: src/components/preview/PreviewAtoms.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37375-9177
---

# MetaChip

Doc Preview atom: a bordered chip pairing an icon + muted label + medium foreground value, with an optional truncable `· …` aside, an IA marker (✦), and a link action. Two variants: `default` (canvas fill) · `strong` (cream fill, identity chip). 14 canonical types in `META_CHIP_TYPES` (date, pièce, type, découpage, source, juridiction, n°, objet, messages, pièces jointes, code, en vigueur, période, web) - one type = one icon + one label, the same everywhere.

_Beta - label contrast holds `foreground-secondary` because `foreground-muted` falls under the WCAG floor on canvas/cream (issue #__)._

## When to use
- The metadata bar of a preview panel (MetaBar) and card headers that surface key-value metadata.

## When NOT to use
- Status / severity / category → `Badge`.
- Interactive source type → `SourceBadge`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `type` | key of `META_CHIP_TYPES` | — | provides default icon / label / variant |
| `icon` | Lucide component | preset | override the type icon |
| `label` | string | preset | override the type label |
| `variant` | `default \| strong` | preset or `default` | `strong` = cream identity chip |
| `value` | ReactNode | — | the metadata value (medium foreground) |
| `aside` | ReactNode | — | truncable `· …` trailing text |
| `ai` | bool | — | ✦ IA marker |
| `action` | `{ label, onClick }` | — | trailing text link |
| `onClick` | fn | — | makes the whole chip a button |
| `disabled` | bool | — | |
| `title` / `className` | - | - | passthrough |

## Examples
```jsx
import { MetaChip } from 'src/components/preview/PreviewAtoms';
<MetaChip type="date" value="15/03/2023" ai />
<MetaChip type="piece" value="I - MEDICAL · n° 2" />
<MetaChip type="decoupage" aside="rapport_expertise.pdf" action={{ label: 'Ajuster', onClick }} />
```
