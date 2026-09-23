---
name: Alert
type: shadcn
status: pending
usage: Bandeau de message inline non bloquant - icône + titre + description, 4 variants sémantiques
description: >
  Alerte inline (padding 16, gap 12, radius 8) : icône 16px, titre body-medium,
  description body, action lien-bouton optionnelle. Quatre variants du set
  Figma : default, destructive (texte rouge sur fond blanc), info (fond bleuté),
  warning (fond warning.subtle). Couleurs d'icônes relevées des SVG du set.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2813-9373
file: src/components/ui/Alert.js
inventoryId: Alert
variants: [default, destructive, info, warning]
states: [default, with-action, no-icon, title-only, description-only]
tokens: [colors.semantic.card, colors.semantic.border, colors.semantic.foreground, colors.semantic.mutedForeground, colors.feedback.destructive, colors.feedback.info, colors.feedback.warning, radius.lg, typography.scale.body, typography.scale.body-medium, typography.scale.caption-medium]
lastValidated: 2026-09-23
---

# Alert

> **Type** shadcn · **Status** Pending (built 2026-09-23) · **Usage** message inline non bloquant
> **Figma** [2813:9373](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2813-9373) (set `152:2375`) · **File** `src/components/ui/Alert.js`

Bandeau de message contextuel dans le flux de la page. Non bloquant, non
fermable par défaut - il documente un état, il n'interrompt pas.

## Pattern / Variants / Examples

### When to use
- Signaler un état contextuel dans une page ou un panneau : information, avertissement, erreur de zone.
- Compléter un formulaire ou une section avec un message persistant (pas un toast).
- Avec `actionLabel` : offrir une sortie inline (« Réessayer », « Voir le dossier »).

### When NOT to use
- **Confirmation bloquante** - `AlertDialog` (modale centrée).
- **Statut compact sur une rangée** - `Badge`.
- **Bandeau promotionnel du rail** - `NavPromoBanner`.
- **Erreur de champ** - états `error` / `warning` de `Input` / `InputGroup`.

### Variants (4)
| Variant | Fond | Bord | Icône | Titre | Description |
|---------|------|------|-------|-------|-------------|
| `default` | card | border | foreground | foreground | mutedForeground |
| `destructive` | card | border | destructive.base | destructive.base | destructive.base |
| `info` | info.bg | info.border | info.text | foreground | mutedForeground |
| `warning` | warning.subtle | warning.border | warning.base | warning.text | warning.text |

Action lien-bouton (icône 12 + caption-medium) : info.text (default, info) ·
destructive.text · warning.text.

### Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `default \| destructive \| info \| warning` | `default` | |
| `title` / `description` | string | - | chacun optionnel |
| `icon` | composant lucide | `AlertTriangle` | remplaçable (`Info`, `CircleAlert`…) |
| `hideIcon` | bool | `false` | |
| `actionLabel` / `actionIcon` / `onAction` | - | - | lien-bouton sous le texte (variant Figma Button=True) |
| `children` | node | - | contenu libre sous la description |
| `className` / `style` | - | - | échappatoires |

### Dimensions clés (Figma)
Largeur fluide (391px dans le set) · padding 16 · gap icône/corps 12 · icône 16 (wrapper pt2) · gap titre/description 4 · titre 14/20 medium · description 14/20 · radius 8.

### Examples
```jsx
import Alert from '../ui/Alert';
import { Info, ArrowLeft } from 'lucide-react';

<Alert title="Titre" description="Ceci est la description de l'alerte" />
<Alert variant="destructive" title="Import impossible"
  description="Le bordereau contient des pièces en double." />
<Alert variant="info" icon={Info} title="Synchronisation en cours"
  description="Les pièces arrivent au fil de l'eau." />
<Alert variant="warning" title="Boîte non connectée"
  actionLabel="Connecter la boîte" actionIcon={ArrowLeft} onAction={connect} />
```

### Tokens used
`colors.semantic.card` / `border` / `foreground` / `mutedForeground` · `colors.feedback.destructive.base/.text` · `colors.feedback.info.bg/.border/.text` · `colors.feedback.warning.subtle/.border/.base/.text` · `radius.lg` · `typography.scale['body-medium']` / `body` / `caption-medium`.

### Écarts tokens relevés (pas corrigés)
- Fond Info Figma = `rgba(223,232,245,0.4)` (≈ #f2f6fb sur blanc) → mappé sur `colors.feedback.info.bg` (#eef3fa), token le plus proche ; pas de nouveau token créé.
- Couleurs d'icônes relevées dans les SVG du set (stroke) : default #292524, destructive #991b1b, info #1e3a8a, warning #bd6c1a - mappées 1:1 sur les tokens feedback.

## Sprint / Explos

- Le set Figma expose Title=False / Description=False / Button=True : couverts par les props optionnelles (`title`, `description`, `actionLabel`).
- À ne pas confondre avec les bannières gradient app (`colors.banner.*`) : l'Alert DS est plate, tokens feedback.

## Proto demo

`/ui-kit/c/Alert` - sandbox : 4 variants x action / sans icône / titre seul.
