---
name: Dialog
package: plato
status: stable
usage: Content modal (form, list, text) - serif header, scrolling body, action footer
source: src/components/ui/Dialog.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=6831-11140
---

# Dialog

Content modal window laid over an overlay-token scrim: surface-raised panel with a serif display title, muted description, scrolling body and a right-aligned action footer. Steward decision 24/09: **no generic Modal** - the need splits between `AlertDialog` (confirmation), `Dialog` (content, here) and `Drawer` (lateral).


## When to use
- Form, list or rich content that interrupts the flow (dossier creation, editing, modal search).
- The body scrolls; header and footer stay fixed.

## When NOT to use
- **Confirmation / destructive action** (icon + title + 2 buttons) → `AlertDialog`.
- **Lateral panel** (context kept alongside) → `Drawer`.
- **Anchored menu / popover** → `Dropdown` / Popover (not promoted).

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onOpenChange` | bool / fn | — | controlled state (Escape and scrim click close) |
| `title` | string | — | serif display header title |
| `description` | string | — | muted description under the title |
| `headerAction` | node | — | slot on the right of the header (link, button) |
| `children` | node | — | scrolling body |
| `footer` | node | — | actions on the right (pass DS `Button`s) |
| `width` | number | `480` | panel width |
| `showClose` | bool | `true` | close affordance top-right |

## Examples
```jsx
import Dialog from 'src/components/ui/Dialog';
import Button from 'src/components/ui/Button';

<Dialog
  open={open}
  onOpenChange={setOpen}
  title="Nouveau dossier"
  description="Renseignez les informations du dossier."
  footer={<><Button variant="ghost" label="Annuler" onClick={close} /><Button label="Créer" onClick={create} /></>}
>
  {/* form */}
</Dialog>
```
