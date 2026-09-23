---
name: RadioPricing
type: shadcn-extended
status: pending
usage: Radio card option for licence / pricing choices
description: >
  Carte-option radio (radio shadcn étendu) : toggle 16px + icône + libellé +
  description dans une carte bordée radius 12. États Default / Hover /
  Active-selected / Disabled.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36915-6122
file: src/components/ui/RadioPricing.js
inventoryId: RadioPricing
states: [default, hover, selected, disabled]
tokens: [colors.semantic.border, colors.semantic.borderStrong, colors.semantic.background, colors.semantic.primary, radius.xl, radius.full, shadows.xs, typography.scale.body-medium, typography.scale.caption]
lastValidated: 2026-09-23
---

# RadioPricing

> **Type** shadcn-extended · **Status** Pending (2026-09-23) · **Usage** carte-option radio (licences / pricing)
> **Figma** [36915:6122](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36915-6122) · **File** `src/components/ui/RadioPricing.js`

Carte-option radio pour les choix de licence : le RadioGroup shadcn nu ne
porte pas la carte (bord, fond, ombre, icône, description) - d'où cette
extension. Sélectionnée : fond background + bord fort + ombre xs.

## Pattern / Variants / Examples

### When to use
- Choix **exclusif** entre quelques options riches (licences PRO/MAX/MAX+,
  formules, destinations de facturation).
- Onboarding `/welcome` (étape licence) et réglages billing.

### When NOT to use
- **Choix multiple** → checkboxes.
- **2 états on/off** → `Switch`.
- **Longue liste d'options simples** → select/dropdown, pas une pile de cartes.

### Props
| Prop | Rôle |
|---|---|
| `label` / `description` | libellé 14 medium + description 12 muted (une ligne) |
| `icon` | lucide, défaut `Receipt` |
| `selected` / `onSelect` | état radio (géré par le parent) |
| `disabled` | opacité 50 %, non cliquable |
| `pinHover` | force le visuel hover (démos) |
| `width` | défaut '100%' (Figma : 409) |

### Examples
```jsx
import RadioPricing from 'src/components/ui/RadioPricing';

<RadioPricing label="Licence PRO" description="Usage individuel - 1 poste"
  selected={choice === 'pro'} onSelect={() => setChoice('pro')} />
<RadioPricing label="Licence MAX" description="Cabinet - postes illimités"
  selected={choice === 'max'} onSelect={() => setChoice('max')} />
```

### Tokens used
`radius.xl` (carte 12) · `radius.full` (toggle) · `colors.semantic.border` /
`borderStrong` (sélection - NB : le Figma câble #d6d3d1, le token du repo est
#cbc7c4, dérive délibérée documentée dans tokens.js) · `background` (fond
hover/sélection) · `primary` (point du toggle) · `shadows.xs` ·
`typography.scale['body-medium']` / `caption`

## Sprint / Explos

- Épic pricing (licences PRO/MAX/MAX+ + jauge d'usage hebdo) : LicencePicker
  (`src/components/billing/LicencePicker.js`) devra composer cette carte.

## Proto demo

`/ui-kit/c/RadioPricing` — sandbox live : états + presets licence.
