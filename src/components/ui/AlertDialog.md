---
name: AlertDialog
package: plato
type: primitive
status: stable
usage: Confirmation / action destructive - icône, titre serif, description, deux boutons
description: >
  Modale de confirmation qui interrompt avec une décision. Carte p-24 gap-16
  radius 12 (ombre token lg, scrim token overlay), icône 24px teintée par
  intent, titre serif display-xs (16/20 -0.5), description muted, footer
  cancel/action h-36. Le cancel suit l'intent (destructive-subtle si action
  destructive, cream sinon). Breakpoint Small : colonne centrée, boutons
  empilés pleine largeur.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=6724-21154
file: src/components/AlertDialog.js
source: src/components/AlertDialog.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: AlertDialog
variants: [primary, destructive]
states: [closed, open, action-disabled]
tokens: [colors.semantic.overlay, colors.semantic.surfaceRaised, colors.semantic.primary, colors.feedback.destructive.subtle, colors.feedback.destructive.text, colors.feedback.warning.border, colors.feedback.warning.text, shadows.lg, radius.xl]
lastValidated: 2026-09-24
---

# AlertDialog

> **Type** Primitive · **Status** Validated (aligné Figma 24/09/2026) · **Usage** confirmation
> **Figma** [6724:21154](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=6724-21154) (composant 1:78 + Small 2759:16913, exemples 7005:45447) · **File** `src/components/AlertDialog.js` (porte `ui/AlertDialog.js`)

Décision steward 24/09 : pas de Modal générique — confirmation ici, contenu →
`Dialog`, latéral → Drawer ([a-dessiner]).

## Pattern / Variants / Examples

### When to use
- Confirmer une action, surtout destructive (suppression, sortie sans
  sauvegarde) : icône d'intent + titre + description + cancel/action.

### When NOT to use
- **Formulaire ou contenu riche** → `Dialog` (body défilant, slots).
- **Information sans décision** → `Alert` (bandeau inline).

### Props (inchangées - alignement visuel seul)
`open` / `onOpenChange` · `icon` + `iconVariant` (default/destructive/warning/
success/info) · `title` · `description` · `warning` (bloc bordure warning) ·
`cancelLabel` / `cancelVariant` / `onCancel` · `actionLabel` / `actionVariant`
(primary/destructive) / `actionDisabled` / `onAction` · `showClose` · `hideIcon`.

### Alignement Figma du 24/09 (validé steward)
- scrim `bg-black/50` → token `overlay` ; surface → `surfaceRaised`
- ombre inline (91-liste) → token `shadows.lg` (nom aligné sur le shadow/lg du nœud)
- bouton primaire `semantic.ring` → `semantic.primary` (+ `primaryForeground`)
- bordure du bloc warning `brand.darker.border` → `feedback.warning.border`
- breakpoint Small ajouté (colonne centrée, boutons empilés, classes `sm:`)

### Tokens used
`overlay` · `surfaceRaised` · `primary`/`primaryForeground` ·
`feedback.destructive.subtle`/`.text` (cancel destructif) · `feedback.warning.border`/`.text` ·
`shadows.lg` · `radius.xl` · titre `display-xs` serif.

## Sprint / Explos

- Établi pré-kit (3402:3576), realigné 24/09 sur le set 1:78 / 2759:16913 /
  7005:45447. Cible d'adoption : les petites confirmations hand-roll
  (JPRationaleModal, FicheCabinetModal…) - classement :
  `.context/steward-review/MODAL-CLASSIFICATION.md`.

## Proto demo

`/ui-kit/c/AlertDialog`
