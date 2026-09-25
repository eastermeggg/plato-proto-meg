---
name: Sheet
package: plato
status: stable
usage: Master side panel (right/left) - overlay that never hides the chat
source: src/components/ui/Sheet.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37749-1024
---

# Sheet

Master component for side panels: two sizes (sm / wide), side right or left. The scrim and the panel stop at `var(--chat-offset)` so the chat stays visible and interactive - the user can ask the assistant to modify what the sheet shows. Build any new panel by stacking `SheetSection`s; never re-roll a lateral panel inline. Steward merge 25/09/2026: Sheet absorbed Drawer (canonical name Sheet, master implementation kept); the former generic 4-edge Sheet is gone - a future top/bottom sheet is a variant of this component.

## When to use
- **MODIFY an existing object** - the doctrine (steward 24/09) is **Dialog to CREATE, Sheet to MODIFY**: editing an org user, a day entry of the relevé d'heures, a chiffrage line, a cotisation… any side edit.
- **The chat stays visible**: scrim and panel stop at `var(--chat-offset)` - the user can ask the agent to modify what the sheet shows.
- Build any new panel by stacking `SheetSection`s; the Figma content variants (Time Slots, Licence, Role, Detail, Notes, Expense, Form) are compositions of existing primitives (Input, Textarea, Switch, Progress, Checkbox, DropZone…) - never bespoke markup.

## When NOT to use
- **CREATE a new object** → `Dialog` (creation flows are centered modals).
- **Interrupting decision** → `AlertDialog`.
- **Document preview panel** → `PreviewPanel` (own anatomy).

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onOpenChange` | bool / fn | — | controlled (Escape and scrim click close) |
| `side` | `right \| left` | `right` | panel side |
| `size` | `sm \| wide \| number` | `sm` | sm / wide / width in px |
| `title` | string | — | serif display header title |
| `icon` / `avatar` | node | — | optional icon or avatar before the title |
| `children` | node | — | scrollable content (stack `SheetSection`s) |
| `footer` | node | — | optional slot (border-t, justify-between) |
| `showClose` | bool | `true` | secondary square close |
| `respectChatOffset` | bool | `true` | stop at `var(--chat-offset)` (right side) |

`SheetSection`: `title` (mono uppercase) · `icon` · `subtitle` (right) · `actionLabel`/`actionIcon`/`onAction` (info link) · `bordered` (border-b) · `children`.

## Examples
```jsx
import Sheet, { SheetSection } from 'src/components/ui/Sheet';
import Button from 'src/components/ui/Button';
import { Clock4 } from 'lucide-react';

<Sheet open={open} onOpenChange={setOpen} title="Antoine Mercier" avatar={<Avatar name="Antoine Mercier" size={24} />}
  footer={<><Button variant="destructive-subtle" label="Retirer du cabinet" /><Button label="Enregistrer" /></>}>
  <SheetSection title="Créneaux travaillés" icon={Clock4} subtitle="total 8H" bordered>…</SheetSection>
  <SheetSection title="Licence" actionLabel="Modifier" onAction={edit} bordered>…</SheetSection>
</Sheet>
```
