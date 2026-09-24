---
name: Drawer
package: plato
type: primitive
status: draft
usage: Master side panel (right/left) - overlay that never hides the chat
description: >
  Master component for side drawers. Two sizes (sm 408 / wide 860), side
  right or left. The scrim and the panel stop at var(--chat-offset): the
  chat stays visible and interactive so the user can ask the assistant to
  modify what the drawer shows. Header (16px icon or 24px avatar + serif
  display-xs title + 26px secondary close), scrollable content slot, optional
  footer slot (border-t, p-20, justify-between). Elevation L3 role (2xl) +
  border on the chat side. DrawerSection sub-component: mono 11 uppercase
  section header (icon+subtitle / icon / action / simple) + free content.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37749-1024
file: src/components/ui/Drawer.js
source: src/components/ui/Drawer.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: Drawer
variants: [sm, wide, right, left]
states: [closed, open]
tokens: [colors.semantic.overlay, colors.semantic.border, colors.semantic.secondary, colors.semantic.foreground, colors.semantic.mutedForeground, colors.feedback.info.text, radius.sm, shadows.2xl, typography.fontFamily.serif, typography.fontFamily.mono]
lastValidated: 2026-09-24
---

# Drawer

> **Type** Primitive · **Status** Pending (2026-09-24) · **Usage** master side panel
> **Figma** [37749:1024](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37749-1024) (SidePanel 37734:55506/55546 · Section Header 37740:1059 · Section Content 37732:13180) · **File** `src/components/ui/Drawer.js`

## Pattern / Variants / Examples

### When to use
- Inspect or edit an object WITHOUT leaving the screen: detail of a
  cotisation, workspace member, day entry (relevé), any side panel.
- **The chat stays visible**: scrim and panel stop at `var(--chat-offset)` -
  the user can ask the agent to modify what the drawer shows.
- Build any new panel by stacking `DrawerSection`s; the 8 Figma content
  variants (Time Slots, Licence, Role, Detail, Notes, Expense, Form) are
  compositions of existing primitives (Input, Textarea, Switch, Progress,
  Checkbox, DropZone…) - never bespoke markup.

### When NOT to use
- **Interrupting decision** → `AlertDialog`. **Centered content form** →
  `Dialog`. **Document preview panel** → `PreviewPanel` (own anatomy).

### Props
| Prop | Default | Role |
|------|---------|------|
| `open` / `onOpenChange` | - | controlled (Escape and scrim click close) |
| `side` | `'right'` | right / left |
| `size` | `'sm'` | sm (408) / wide (860) / number in px |
| `title` | - | serif display-xs header title |
| `icon` / `avatar` | - | optional 16px icon or 24px avatar before the title |
| `children` | - | scrollable content (stack `DrawerSection`s) |
| `footer` | - | optional slot - border-t, p-20, justify-between |
| `showClose` | `true` | 26px secondary square close |
| `respectChatOffset` | `true` | stop at `var(--chat-offset)` (right side) |

`DrawerSection`: `title` (mono 11 uppercase) · `icon` · `subtitle` (right,
mono 11) · `actionLabel`/`actionIcon`/`onAction` (12 medium info link) ·
`bordered` (border-b) · `children`.

### Examples
```jsx
import Drawer, { DrawerSection } from 'src/components/ui/Drawer';
import Button from 'src/components/ui/Button';
import { Clock4 } from 'lucide-react';

<Drawer open={open} onOpenChange={setOpen} title="Antoine Mercier" avatar={<Avatar name="Antoine Mercier" size={24} />}
  footer={<><Button variant="destructive-subtle" label="Retirer du cabinet" /><Button label="Enregistrer" /></>}>
  <DrawerSection title="Créneaux travaillés" icon={Clock4} subtitle="total 8H" bordered>…</DrawerSection>
  <DrawerSection title="Licence" actionLabel="Modifier" onAction={edit} bordered>…</DrawerSection>
</Drawer>
```

### Tokens used
`overlay` (scrim) · `bg-surface` (panel) · `border` (header/footer rules,
chat-side border) · `secondary` (close fill) + `radius.sm` · serif
display-xs (title) · mono 11 uppercase (section headers) ·
`feedback.info.text` (section action) · `shadows['2xl']` (L3 role, §10).

## Sprint / Explos

- Promu le 24/09/2026 depuis le master Figma livré par la steward (remplace le
  chantier [a-dessiner]). L'entrée DSAEditDrawer (réf Figma invalide,
  SIGNALEMENTS §12) est retirée de l'inventaire : le master couvre le besoin.
  Cible d'adoption : les 3 drawers classés (App.js:20906 membre,
  CotisationsSection:507, ReleveHeuresLab:515) + le panneau bordereau 860
  (App.js:15850) qui suit déjà la mécanique --chat-offset.

## Proto demo

`/ui-kit/c/Drawer`
