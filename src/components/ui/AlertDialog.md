---
name: AlertDialog
package: plato
status: stable
usage: Confirmation / destructive action - icon, serif title, description, two buttons
source: src/components/AlertDialog.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=6724-21154
---

# AlertDialog

Confirmation modal that interrupts with a decision: intent icon + serif title +
description + cancel/action footer. Steward decision 24/09: no generic Modal -
confirmation here, rich content → `Dialog`, lateral → `Drawer`.

## When to use
- Confirm an action, especially a destructive one (deletion, exit without
  save): intent icon + title + description + cancel/action.

## When NOT to use
- **Form or rich content** → `Dialog` (scrolling body, slots).
- **Information without a decision** → `Alert` (inline banner).

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `open` | bool | - | controlled visibility |
| `onOpenChange` | fn | - | `(open) => void` |
| `icon` | Lucide icon | `CircleAlert` | leading icon |
| `iconVariant` | `default \| destructive \| warning \| success \| info` | `default` | icon tint |
| `title` | string | - | required, serif display-xs |
| `description` | string | - | muted body |
| `warning` | string | - | amber left-bordered block under the description |
| `children` | node | - | extra body content after the description |
| `cancelLabel` | string | `Annuler` | secondary button label |
| `cancelVariant` | `neutral \| destructive` | follows `actionVariant` | force secondary button style |
| `onCancel` | fn | close | secondary button action |
| `actionLabel` | string | - | required, primary button label |
| `actionVariant` | `primary \| destructive` | `primary` | primary intent |
| `actionDisabled` | bool | `false` | disable primary button |
| `onAction` | fn | - | primary button action |
| `showClose` | bool | `true` | top-right X |
| `hideIcon` | bool | `false` | hide leading icon |

## Examples
```jsx
import AlertDialog from '../AlertDialog';
import { Trash2 } from 'lucide-react';

<AlertDialog
  open={open}
  onOpenChange={setOpen}
  icon={Trash2}
  iconVariant="destructive"
  title="Supprimer cette pièce ?"
  description="Cette action est irréversible."
  actionLabel="Supprimer"
  actionVariant="destructive"
  onAction={remove}
/>
```
