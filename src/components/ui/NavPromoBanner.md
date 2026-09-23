---
name: NavPromoBanner
package: plato
type: composite
status: draft
usage: Bandeau promo contextuel du rail (mail non connecté / parrainage)
description: >
  Bandeau plein-largeur du rail, dégradé info-blue horizontal + icône/texte
  info-text + chevron. Deux emplacements : edge=top (sous le header) ou
  edge=bottom (pied de nav).
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37471-1271
file: src/components/shell/NavPromoBanner.js
source: src/components/shell/NavPromoBanner.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: NavPromoBanner
variants: [top, bottom]
tokens: [colors.feedback.info.subtle, colors.feedback.info.text, colors.semantic.border]
---

# NavPromoBanner

> **Type** Composite · **Status** Pending · **Usage** bandeau promo du rail
> **Figma** [Sidebar Promo](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37471-1271) · **File** `src/components/shell/NavPromoBanner.js`

## Pattern / Variants / Examples

### When to use
- Un push contextuel dans le rail : « Connectez votre boîte mail » (top),
  parrainage « -10% » (bottom).

### When NOT to use
- Un message d'état pleine largeur d'app → bannière trial / bandeau dossier.

### Props
| Prop | Type | Rôle |
|---|---|---|
| `icon` | Lucide | icône de tête |
| `label` | string | libellé |
| `edge` | `top \| bottom` | filet bas (top) ou haut (bottom) |
| `onClick` / `title` | — | interaction |

### Tokens used
`colors.feedback.info.subtle` (dégradé), `colors.feedback.info.text` (icône +
texte + chevron), `colors.semantic.border` (filet).

## Sprint / Explos

- Surfacé le 22/09. Lié à l'épic connexion boîtes mail. Voisin : `AppSidebar`.

## Proto demo

Visible en contexte : sous le header du rail (mail) et en pied (parrainage).
