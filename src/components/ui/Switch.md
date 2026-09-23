---
name: Switch
package: plato
type: primitive
status: draft
usage: Bascule on/off d'un réglage à effet immédiat
description: >
  Bascule 36x20, pouce 16px. ON = piste foreground, OFF = piste cream, pouce
  white (élévation shadows.xs). Remplace les toggles CSS inline peer-checked
  (App.js ×6, ReleveHeuresLab).
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-30732
file: src/components/ui/Switch.js
source: src/components/ui/Switch.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: Switch
states: [off, on, disabled]
tokens: [colors.semantic.foreground, colors.semantic.cream, colors.semantic.white, shadows.xs]
lastValidated: 2026-09-24
---

# Switch

> **Type** Primitive · **Status** Pending (2026-09-24) · **Usage** bascule on/off immédiate
> **Figma** [2819:30732](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-30732) · **File** `src/components/ui/Switch.js`

Bascule 36x20. Promu depuis `previews.jsx`, tokenisé.

## Pattern / Variants / Examples

### When to use
- Activer/désactiver un réglage avec **effet immédiat** (pas de submit).

### When NOT to use
- **Sélection dans un formulaire à valider** → `Checkbox`.
- **Choix exclusif** → `RadioGroup`.

### Props
| Prop | Défaut | Rôle |
|------|--------|------|
| `checked` | `false` | état on |
| `label` | - | libellé cliquable |
| `disabled` | `false` | désactivé |
| `onChange` | - | `(next: boolean) => void` |

### Examples
```jsx
import Switch from 'src/components/ui/Switch';

<Switch checked={v} label="Jour chômé" onChange={setV} />
```

### Tokens used
`colors.semantic.foreground` (ON) · `colors.semantic.cream` (OFF) ·
`colors.semantic.white` (pouce) · `shadows.xs` (élévation pouce).

## Sprint / Explos

- Promu le 24/09/2026 depuis `ui-kit/previews.jsx`, tokenisé (l'ombre inline du pouce passe au token `shadows.xs`). Cible d'adoption : 6 toggles `peer-checked` d'App.js (audit DS cat. 2).

## Proto demo

`/ui-kit/c/Switch`
