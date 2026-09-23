---
name: TopBar
package: plato
type: layout
status: draft
usage: La barre de tête fixe (nav dossier V2) - chrome à slots + contrôle nav intégré
description: >
  Chrome de barre de tête canonique (Figma « Navigation / Top bar » 37443:5796) :
  bande h-48 fond background, filet bas, padding 12 (nav ouverte) / 16 (masquée),
  gap 10, hairlines border-strong (TopBarHairline). Nav masquée : la bande rend
  ELLE-MÊME NavExpandControl + hairline (navCollapsed). Le contenu (breadcrumb,
  nom serif, onglets, outils) vient de la surface via les slots. Le titre +
  actions dans le contenu, c'est PageHeader (distinct), pas ceci.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37443-5796
file: src/components/ui/TopBar.js
source: src/components/ui/TopBar.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: TopBar
variants: [navCollapsed, leading, left, right]
tokens: [colors.semantic.background, colors.semantic.border, colors.semantic.borderStrong]
lastValidated: 2026-09-23
---

# TopBar

> **Type** Layout · **Status** Pending · **Usage** barre de tête fixe (nav dossier V2)
> **Figma** [Navigation / Top bar](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37443-5796) · comportement `shell/NAV-BEHAVIOR.md` §0 · **File** `src/components/ui/TopBar.js`

Une seule bande fixe (fini les 3 bandes empilées). On compose CECI pour toute
barre de tête (dossier, conversation, settings) - jamais une bande `h-12` bordée
inline.

## Pattern / Variants / Examples

### When to use
- La barre de tête d'une surface : breadcrumb + onglets à gauche, outils à droite.

### When NOT to use
- Le **titre de page + actions** (dans le contenu, sticky) → `PageHeader`.
- La **nav latérale** → `AppSidebar`.

### Props / Slots
| Prop | Contenu |
|---|---|
| `navCollapsed` | nav masquée → la bande rend NavExpandControl + hairline, padding passe à 16 |
| `onNavExpand` / `onNavHome` / `onNavPeekEnter` / `onNavPeekLeave` | handlers du contrôle « Menu » |
| `left` | breadcrumb 12px + nom serif 16 (-0.5) + onglets gap-16 (items-stretch : soulignement d'onglet actif au filet du bas), séparés par `TopBarHairline` |
| `right` | outils (Plato Assistant, menu ⋮…) - gap 12 |
| `leading` | échappatoire : élément(s) custom en tête du cluster gauche |

Export nommé : `TopBarHairline` - la hairline verticale du chrome (1x16, border-strong).

### Metrics (nœud 37443:5796)
h-48 · bg background · filet bas border · items centrés · gap 10px ·
px-12 (nav ouverte) / px-16 (nav masquée) · hairlines 1x16 border-strong ·
breadcrumb 12px muted (tracking 0.12) · nom serif 16 tracking -0.5 ·
onglets gap-16, indicateur 2px arrondi haut.

### Examples
```jsx
import TopBar, { TopBarHairline } from '../ui/TopBar';

<TopBar
  navCollapsed={navHidden}
  onNavExpand={expandNav} onNavHome={goHome}
  onNavPeekEnter={openPeek} onNavPeekLeave={schedulePeekClose}
  left={<><Breadcrumb /><TopBarHairline /><Tabs /></>}
  right={<><PlatoAssistantButton /><MoreMenu /></>}
/>
```

### Gabarit / dimensions
Bande **pleine largeur** en tête de la colonne de contenu, `flex-shrink-0` :
| Propriété | Valeur |
|---|---|
| Hauteur | `h-12` (48px) |
| Padding H | `px-3` (nav ouverte) · `px-4` (nav masquée) |
| Gap items | `gap-2.5` (10px) ; slot `right` `gap-3` |
| Fond / filet | `background` + `border-b border-border` |

Nav masquée (`navCollapsed`) : la bande rend ELLE-MÊME `NavExpandControl` + hairline
en tête - ne pas les composer à la main. Elle vient AVANT `PageHeader` / le contenu.
Aucun max-width ; contrat de page complet : fiche block **`/ui-kit/b/shell`**.

### Tokens used
`colors.semantic.background` (fond), `colors.semantic.border` (filet du bas),
`colors.semantic.borderStrong` (hairlines). Le reste est fourni par les slots.

## Sprint / Explos

- Établi le 22/09 depuis `renderDossierWorkspaceHeader` (proto) - le chrome était inline, extrait ici. Le proto le compose désormais.
- Comportement (nav dossier V2, un seul retour, onglets persistants) : `shell/NAV-BEHAVIOR.md` §0 + lab `/ui-kit/nav-system`.
- À suivre : `PageHeader` (titre + actions dans le contenu), même chantier.

## Proto demo

Visible en contexte : la barre de tête de tout dossier dans le proto.
