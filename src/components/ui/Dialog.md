---
name: Dialog
package: plato
type: primitive
status: draft
usage: Modale de contenu (formulaire, liste, texte) - header serif, body défilant, footer d'actions
description: >
  Fenêtre modale de CONTENU posée sur un scrim token overlay. Panneau
  surface-raised (card en light ; en dark l'élévation se lit par la surface,
  doctrine B), bordure border, radius 12, ombre 4xl. Header titre serif
  display-sm + description muted + slot d'action, body défilant (max-h 85vh),
  footer d'actions à droite, croix 16px opacité 70 %.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=6831-11140
file: src/components/ui/Dialog.js
source: src/components/ui/Dialog.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: Dialog
states: [closed, open]
tokens: [colors.semantic.overlay, colors.semantic.surfaceRaised, colors.semantic.border, colors.semantic.cardForeground, colors.semantic.mutedForeground, radius.xl, shadows.4xl, typography.fontFamily.serif]
lastValidated: 2026-09-24
---

# Dialog

> **Type** Primitive · **Status** Pending (2026-09-24) · **Usage** modale de contenu
> **Figma** [6831:11140](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=6831-11140) (composant 2759:16962) · **File** `src/components/ui/Dialog.js`

Décision steward 24/09 : **pas de Modal générique** — le besoin se répartit entre
`AlertDialog` (confirmation), `Dialog` (contenu, ici) et `Drawer` (latéral,
[a-dessiner], ne pas construire).

## Pattern / Variants / Examples

### When to use
- Formulaire, liste ou contenu riche qui interrompt le flux (création de
  dossier, édition, recherche modale).
- Le body défile ; header et footer restent fixes.

### When NOT to use
- **Confirmation / action destructive** (icône + titre + 2 boutons) → `AlertDialog`.
- **Panneau latéral** (contexte conservé à côté) → Drawer ([a-dessiner], spec steward en cours).
- **Menu / popover ancré** → Dropdown / Popover (non promus).

### Props
| Prop | Défaut | Rôle |
|------|--------|------|
| `open` / `onOpenChange` | - | contrôle (Escape et clic scrim ferment) |
| `title` | - | titre serif display-sm du header |
| `description` | - | description muted sous le titre |
| `headerAction` | - | slot à droite du header (lien, bouton) |
| `children` | - | body défilant |
| `footer` | - | actions à droite (passer des `Button` DS) |
| `width` | `480` | largeur du panneau (Figma : 423) |
| `showClose` | `true` | croix 16px |

### Examples
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
  {/* formulaire */}
</Dialog>
```

### Tokens used
`colors.semantic.overlay` (scrim) · `colors.semantic.surfaceRaised` (panneau) ·
`colors.semantic.border` · `colors.semantic.cardForeground` / `mutedForeground` ·
`radius.xl` (12) · `shadows['4xl']` · `typography.fontFamily.serif` (titre 20/28 -0.6).

## Sprint / Explos

- Promu le 24/09/2026 depuis Figma 6831:11140 (anatomie 2759:16962) ; consomme
  les tokens `overlay` + `surfaceRaised` créés le même jour (conditions steward
  de la doctrine ombres dark B). Cible d'adoption : les ~17 modales de contenu
  hand-roll d'App.js + FusePieces/MoveToFolder/AddPieceSearch/ImportEmail…
  (classement complet : `.context/steward-review/MODAL-CLASSIFICATION.md`).

## Proto demo

`/ui-kit/c/Dialog`
