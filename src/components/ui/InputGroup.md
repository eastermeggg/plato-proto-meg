---
name: InputGroup
type: shadcn
status: pending
usage: Champ avec addons accolés dans un même conteneur bordé (icône, préfixe, Kbd, bouton)
description: >
  Le champ à segments : un conteneur unique (h 36, radius 8, ombre xs) qui
  aligne des addons inline autour de l'input - icône 16, texte préfixe/suffixe,
  Kbd, coche, bouton. Type textarea avec rangées d'addons block au-dessus /
  en-dessous. États : enabled, focus (halo 3px), filled, disabled, error,
  warning, calculated. Se glisse dans le slot de Input (Field) pour recevoir
  label + helper.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=27510-119942
file: src/components/ui/InputGroup.js
inventoryId: InputGroup
variants: [text, textarea]
states: [enabled, focus, filled, disabled, error, error-focus, warning, calculated]
tokens: [colors.semantic.card, colors.semantic.input, colors.semantic.ring, colors.semantic.accent, colors.semantic.borderHover, colors.semantic.muted, colors.semantic.foreground, colors.semantic.mutedForeground, colors.feedback.destructive, colors.feedback.warning, colors.banner.error.accent, radius.lg, radius.md, radius.full, shadows.xs, typography.scale.body, typography.scale.body-medium, typography.scale.caption-medium]
lastValidated: 2026-09-23
---

# InputGroup

> **Type** shadcn · **Status** Pending (built 2026-09-23) · **Usage** champ avec addons accolés
> **Figma** [27510:119942](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=27510-119942) (set `29794:41968`) · **File** `src/components/ui/InputGroup.js`

Un seul conteneur bordé pour le champ ET ses segments : icône de recherche,
préfixe `https://`, raccourci ⌘, coche de validation, bouton d'envoi. Les
addons vivent DANS le bord du champ, jamais accolés à l'extérieur.

## Pattern / Variants / Examples

### When to use
- Champ avec préfixe/suffixe visuel : URL, montant, unité, domaine.
- Recherche avec icône et raccourci clavier (Kbd).
- Champ validé inline (coche) ou avec action embarquée (bouton d'envoi).
- Textarea avec barre d'outils / compteur (`blockStart` / `blockEnd`).
- Champ calculé en lecture seule (état `calculated`, fond accent).

### When NOT to use
- **Champ simple avec label + helper** - le slot par défaut de `Input` suffit.
- **Un label / une aide au-dessus du champ** - ne PAS les recoder : glisser l'InputGroup dans `Input` : `<Input label="…"><InputGroup … /></Input>`. (InputGroup ne compose pas Input : c'est Input, le Field-wrapper, qui nappe InputGroup via son slot `children` - même modèle que Select/Textarea.)
- **Composer / zone de chat** - `AssistantComposer`.
- **Groupe de boutons sans champ** - composer des `Button`.

### Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `type` | `text \| textarea` | `text` | |
| `leading` / `trailing` | node | - | addons inline avant / après le champ (type text) |
| `blockStart` / `blockEnd` | `{ left, right }` | - | rangées d'addons block (type textarea) |
| `error` / `warning` / `disabled` / `calculated` | bool | `false` | états du set |
| `value` / `defaultValue` / `placeholder` / `onChange` / `onFocus` / `onBlur` / `rows` / `inputProps` | - | - | pass-through champ |
| `className` / `style` / `width` | - | - | échappatoires |

Helpers exportés : `InputGroupText` (préfixe/suffixe 14 medium mutedForeground),
`InputGroupKbd` (alias de composition qui rend la primitive `Kbd` - zéro style
dupliqué), `InputGroupCheck` (pastille 16px foreground + coche inversée). Icônes : lucide 16px, color
mutedForeground, passées rendues dans `leading`/`trailing`. Bouton d'addon :
`Button` size `xs` / `icon-xs`.

### États (set Figma)
| État | Bord | Halo | Autre |
|------|------|------|-------|
| enabled / filled | input | - (ombre xs) | fond card |
| focus | ring | 3px borderHover 50% | |
| disabled | input | - | opacité 0.5 |
| error | destructive.base | focus : 3px banner.error.accent 40% | |
| warning | warning.base | 3px warning.subtle (permanent) | |
| calculated | input | - | fond accent, lecture seule |

### Dimensions clés (Figma)
Text : h 36, px 12, py 8, gap 8, radius 8, largeur de référence 280 ·
Kbd 20px (min-w 20, p 4, radius 6) · coche 16 (icône 12) · textarea : zone
p 12 (h 64 de référence), rangée block px 12, pt 12 / pb 6 (start) et
pt 6 / pb 12 (end), bouton d'envoi 28px.

### Examples
```jsx
import Input from '../ui/Input';
import InputGroup, { InputGroupText, InputGroupKbd, InputGroupCheck } from '../ui/InputGroup';
import Button from '../ui/Button';
import { Search } from 'lucide-react';
import { colors } from '../../design-system/tokens';

<InputGroup
  leading={<Search style={{ width: 16, height: 16, color: colors.semantic.mutedForeground, flexShrink: 0 }} strokeWidth={1.75} />}
  trailing={<InputGroupKbd>⌘K</InputGroupKbd>}
  placeholder="Rechercher une pièce" />

<Input label="Site web">
  <InputGroup leading={<InputGroupText>https://</InputGroupText>}
    trailing={<InputGroupCheck />} placeholder="plato.fr" />
</Input>

<InputGroup type="textarea" placeholder="Décrire le problème"
  blockEnd={{
    left: <InputGroupText>0/280 caractères</InputGroupText>,
    right: <Button size="icon-xs" icon={ArrowUp} title="Envoyer" />,
  }} />

<InputGroup calculated value="1 728,00 EUR" trailing={<InputGroupCheck />} />
```

### Tokens used
`colors.semantic.card` (fond) · `input` / `ring` (bords) · `accent` (calculated) · `muted` (Kbd) · `foreground` / `mutedForeground` (texte, addons) · `colors.feedback.destructive.base` + `colors.banner.error.accent` (erreur) · `colors.feedback.warning.base/.subtle` · `radius.lg` / `md` / `full` · `shadows.xs` · `typography.scale.body` / `body-medium` / `caption-medium`.

### Écarts tokens relevés (pas corrigés)
- Halo focus Figma `custom/focus` = rgba(163,163,163,0.5) → `color-mix(in srgb, colors.semantic.borderHover 50%, transparent)` (#a8a29e, token le plus proche ; pas de token halo dédié).
- Halo focus erreur Figma `--destructive-60` = rgba(220,38,38,0.4) → `color-mix` 40% sur `colors.banner.error.accent` (#dc2626, hex exact mais token « banner » - candidat à promotion en token focus).
- Fond Figma `--custom/bg-input-30` (blanc) → `colors.semantic.card`, comme Input.
- Boutons d'addon Figma X-Small h 24 / Icon x-small 24 vs `Button` xs h 24 / icon-xs 22 : 2px d'écart sur l'icon-only, assumé (pas de nouvelle taille de Button).

## Sprint / Explos

- Set relevé en entier : 17 variants Type x State x Error x Warning (+ `Calculated`, état Plato pour les champs calculés type cotisations), addons inline (6 types), addons block (Start / End), Input Group Button (6 types x 6 états x 4 tailles - couverts par composition avec `Button`).
- L'état `Spinner` d'addon = passer `Loader2` (lucide) avec l'anim existante, pas de composant dédié.

## Proto demo

`/ui-kit/c/InputGroup` - sandbox : text/textarea, tous états, addons composés.
