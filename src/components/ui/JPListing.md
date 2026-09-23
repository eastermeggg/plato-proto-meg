---
name: JPListing
package: plato
type: domain
status: draft
usage: Canonical JP decision card (4 contexts) + listing stack
description: >
  La carte de décision de jurisprudence canonique : en-tête juridiction/date/
  bookmark, profil, tags (Badge), bloc « Apport de la décision », pied n° +
  badges de postes. 4 contextes : detail, dropdown, added, tab.
figma: https://www.figma.com/design/09fvZrDgcY83Js7y864E4v/Plato---Design?node-id=2219-19197
file: src/components/jp/JPListing.js
source: src/components/jp/JPListing.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: JPListing
variants: [detail, dropdown, added, tab]
composes: [Badge, Button]
tokens: [colors.semantic.border, colors.semantic.borderHover, colors.semantic.borderAlt, colors.feedback.info, colors.accents.ochre, radius.md, typography.scale.body-medium, typography.scale.caption]
lastValidated: 2026-09-23
---

# JPListing

> **Type** Domain · **Status** Pending (2026-09-23) · **Usage** carte JP canonique + empilement
> **Figma** [2219:19197](https://www.figma.com/design/09fvZrDgcY83Js7y864E4v/Plato---Design?node-id=2219-19197) (fichier Plato---Design) · **File** `src/components/jp/JPListing.js`

La carte de décision JP, une seule anatomie pour 4 contextes produits. Le
contexte pilote ce qui s'affiche, jamais la structure.

## Pattern / Variants / Examples

### When to use
| Variant | Contexte produit |
|---|---|
| `detail` | Matter / page détail poste - carte complète, badges de pied au survol |
| `dropdown` | Org / dropdown « mémoire pref » - rangée compacte + bouton Ajouter |
| `added` | Org / mémoire pref ajoutée - carte complète |
| `tab` | Matter / onglet JP - carte complète, badges de pied toujours visibles |

### When NOT to use
- **Citation inline dans une phrase** → `JPPill`.
- **Mini-table de résultats dans le chat** → `JPListingChat` (chrome de carte +
  rangées denses).
- **Le drawer de lecture complet** → `DecisionDrawer`.

### Props
`variant` · `jurisdiction` · `date` · `numero` · `profile` · `tags`
(`[{ label, tone?: 'destructive' }]`) · `quantum` (`{ poste, value }`) ·
`note` / `noteTitle` (bloc apport) · `posteChips` · `saved` (bookmark ochre) ·
`onAdd` (dropdown) · `onClick` · `pinHover` · `width` · extensions app
(au-delà du nœud, 23/09) : `selected` (drawer ouvert - ring ochre + fond
brand subtle) et `onRemove`/`removeTitle` (X révélé au survol)

### Examples
```jsx
import JPListing, { JPListingStack } from 'src/components/jp/JPListing';

<JPListingStack>
  <JPListing variant="tab" note="Au titre des dépenses de santé actuelles…"
    tags={[{ label: 'Type fait générateur' }, { label: 'Décédé', tone: 'destructive' }]} />
  <JPListing variant="detail" note="…" />
</JPListingStack>

<JPListing variant="dropdown" onAdd={addToMemoire} />
```

### Tokens used
`radius.md` (carte 6) · `colors.semantic.border` (carte, pied) · Badge
secondary/destructive (tags) · `feedback.info.subtle/text` (badge quantum) ·
`accents.ochre` (bookmark) · mono 11 uppercase (n°, titre d'apport) ·
`colors.cream[400]` (filet du bloc apport, token promu 23/09) · divider
d'en-tête #d9d9d9 → `borderAlt` (le plus proche, assumé).

## Sprint / Explos

- Migration faite (23/09) : `JPListingPosteDetail` rend désormais cette carte
  (mapping Decision → props dans le wrapper). `JPRow` reste la rangée DENSE de
  la mini-table du chat (`JPListingChat`) - un autre composant Figma, pas un
  doublon de la carte.
- Séparation des scopes JP cabinet / matter : les variants `dropdown`/`added`
  servent la mémoire d'org, `detail`/`tab` le dossier.

## Proto demo

`/ui-kit/c/JPListing` — sandbox live : 4 variants + états.
