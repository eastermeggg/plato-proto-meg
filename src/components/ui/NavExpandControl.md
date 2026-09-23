---
name: NavExpandControl
package: plato
type: composite
status: draft
usage: Le contrôle « Menu » de réouverture du rail quand la nav est masquée
description: >
  Contrôle présentationnel visible UNIQUEMENT nav masquée : logo Plato 28 (→
  accueil) + bouton « Menu » h-32 px-12 r-8 (glyphe panel 16 + libellé 14
  medium muted). Survol = peek immédiat, clic = réouverture. `absolute` pour
  l'ancrer en haut à gauche des surfaces sans barre. Rendu par TopBar quand
  navCollapsed (nœud 37443:5796).
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37443-5724
file: src/components/shell/NavExpandControl.js
source: src/components/shell/NavExpandControl.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: NavExpandControl
states: [default, hover]
tokens: [colors.semantic.cream, colors.semantic.foregroundSecondary]
---

# NavExpandControl

> **Type** Composite · **Status** Pending · **Usage** réouverture du rail (nav masquée)
> **Figma** [Nav Collapse/Expand Control](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37443-5724) · **File** `src/components/shell/NavExpandControl.js`

## Pattern / Variants / Examples

### When to use
- Rendu par le parent quand `navHidden` : garde une ancre de marque + rouvre le rail.

### When NOT to use
- Le repli DE la nav (bouton du header ouvert) → `PanelToggleIcon` dans le header.

### Props
| Prop | Type | Rôle |
|---|---|---|
| `onExpand` | () => void | clic = réouverture |
| `onPeekEnter` / `onPeekLeave` | () => void | survol = peek |
| `onHome` | () => void | clic logo = accueil |
| `absolute` | bool | ancrage haut-gauche (surfaces sans barre) |

### Gabarit / placement
Rendu UNIQUEMENT quand la nav est masquée, pour rouvrir le rail. Deux emplacements
canoniques - jamais en overlay sur le titre :
- **Page avec `PageHeader`** (listing) : bande dédiée AU-DESSUS du titre, `px-8 pt-3 pb-1
  flex-shrink-0` ; le `PageHeader` reçoit alors `className="pt-3"`.
- **Page avec `TopBar`** (dossier) : la `TopBar` le rend elle-même en tête (via
  `navCollapsed`), suivi d'une hairline - ne pas le composer à la main.

Contrat de page complet : fiche block **`/ui-kit/b/shell`**.

### Tokens used
`colors.semantic.cream` (survol), `foregroundSecondary` (glyphe + libellé).

## Sprint / Explos

- Surfacé le 22/09. Voisins : `AppSidebar` (peek), `PanelToggleIcon` (glyphe).

## Proto demo

Visible en contexte : coin haut-gauche des surfaces du proto quand la nav est masquée.
