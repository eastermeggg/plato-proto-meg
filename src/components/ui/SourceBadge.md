---
name: SourceBadge
package: plato
type: primitive
status: draft
usage: Pill INTERACTIVE de source - cliquer ouvre la source (pièce, JP, loi, email…)
description: >
  La seconde famille de pills (spec badge-rationalization) : identité par TYPE
  de source (icône + teinte de famille), interactive. Établie depuis le set
  custom Figma « Source Badge » (page Badge, ×60 = 10 sources × 2 tailles ×
  3 états). Le Badge générique reste pour statut/sévérité/catégorie.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2814-11330
file: src/components/ui/SourceBadge.js
source: src/components/ui/SourceBadge.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: SourceBadge
variants: [piece, jp, loi, code, modele, email, web, ligne, pass, assiette]
sizes: [sm, md]
states: [default, hover, selected]
tokens: [colors.accents, colors.feedback.info, colors.feedback.warning]
---

# SourceBadge

> **Type** Primitive · **Status** Pending · **Usage** pill interactive de source
> **Figma** [Source Badge (page Badge)](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2814-11330) · **File** `src/components/ui/SourceBadge.js`

La règle des deux familles : **STATUS / SEVERITY / CATEGORY → `Badge`** (non
interactif) ; **SOURCE TYPE → `SourceBadge`** (cliquable, ouvre la source dans
le PreviewPanel). `JPPill` est un SourceBadge de type `jp` avec ses slots de
citation.

## Pattern / Variants / Examples

### When to use
- Toute référence cliquable à une **source** : pièce, jurisprudence, loi,
  article de code, modèle, email, page web, ligne de calcul, PASS, assiette.
- Inline dans la prose de l'agent, dans les rails de citations, dans les actes.

### When NOT to use
- **Statut, sévérité, catégorie** (non cliquable) → `Badge`.
- **Action** → `Button`. Un SourceBadge *ouvre sa source*, il ne déclenche pas
  d'action métier.

### Types (identité = icône + teinte)
| Type | Icône | Famille |
|---|---|---|
| `piece` | FileText | info | · | `jp` | Gavel | violet |
| `loi` | Scale | indigo | · | `code` | BookOpen | sand |
| `modele` | LayoutTemplate | stone | · | `email` | Mail | emerald |
| `web` | Globe | slate | · | `ligne` | Table2 | warning |
| `pass` | Landmark | info | · | `assiette` | Calculator | sand |

Teintes traduites vers les tokens les plus proches - à réconcilier avec les
fills exacts du set Figma si besoin (relevé non fait).

### Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | un des 10 types | `piece` | identité |
| `size` | `sm \| md` | `sm` | |
| `selected` | bool | `false` | bord appuyé (source ouverte) |
| `showIcon` | bool | `true` | |
| `label` | string | — | libellé simple (ou `children` pour un contenu riche) |
| `children` | node | — | slots inline (cf. JPPill) |
| `onClick` / `onMouseEnter` / `onMouseLeave` | fn | — | interactif + hover cards |

### Examples
```jsx
import SourceBadge from '../ui/SourceBadge';

<SourceBadge type="piece" label="Pièce n°12 - Rapport d'expertise" onClick={openPiece} />
<SourceBadge type="loi" label="Art. L242-1 CSS" onClick={openLoi} />
<SourceBadge type="jp" selected>{/* slots de citation - voir JPPill */}</SourceBadge>
```

### Tokens used
Familles `colors.accents.*` et `colors.feedback.info/warning` (subtle = fond,
border = hover, text = icône/libellé/bord selected). Zéro valeur en dur.

## Sprint / Explos

- Spec « badge rationalization » : deux familles, règle de décision
  STATUS/SEVERITY/CATEGORY → Badge ; SOURCE TYPE → SourceBadge.
- La doc d'usage vit AUSSI dans le Figma (artboards `badge-usage-guide` +
  `source-badge-docs` de la page Badge).
- Premier consommateur : `JPPill` (type `jp`) - conteneur/identité délégués,
  slots de citation conservés.

## Proto demo

`/ui-kit/c/SourceBadge` — sandbox : 10 types × tailles × selected.
