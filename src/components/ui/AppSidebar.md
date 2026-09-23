---
name: AppSidebar
package: plato
type: layout
status: draft
usage: LE shell de navigation canonique (rail gauche) - composer, jamais re-rouler
description: >
  Le rail de navigation de Plato. Le shell ne change jamais : header (logo +
  wordmark serif + chip) · groupes à point brand · items (liseré orange + icône
  brand sur l'actif) · footer optionnel. Composé partout (playground DS, proto,
  sous-rail settings) via AppSidebar / SidebarBrand / SidebarGroup / SidebarItem.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36097-42882
file: src/components/ui/AppSidebar.js
source: src/components/ui/AppSidebar.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: AppSidebar
variants: [AppSidebar, SidebarBrand, SidebarGroup, NavItem, NavSectionHeader]
railStates: [ouverte, masquee, peek]
states: [item-default, item-hover, item-active, recent, create, see-all]
tokens: [colors.semantic.background, colors.semantic.borderStrong, colors.semantic.cream, colors.brand.DEFAULT, colors.semantic.mutedForeground]
---

# AppSidebar

> **Type** Layout · **Status** Pending · **Usage** le rail de nav canonique
> **Figma** [Sidebar & Navigation](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=36097-42882) · doctrine App Shell [Plato---Design 4127:30731](https://www.figma.com/design/09fvZrDgcY83Js7y864E4v/Plato---Design?node-id=4127-30731) · comportement `src/components/shell/NAV-BEHAVIOR.md`
> **File** `src/components/ui/AppSidebar.js`

Le shell de navigation **ne change jamais**. Il est donc UN composant, documenté
une fois, composé partout - on ne re-roule JAMAIS un rail inline.

**Ne réinvente rien** : les pièces existaient déjà, battle-testées par le proto
(`src/components/shell/NavItem.js`, `NavSectionHeader.js`). `AppSidebar` les
**compose** et les **ré-exporte** - une seule porte d'import. La nouveauté était
seulement le *chrome* du rail (header + scroll + footer), qui vivait inline.

## Pattern / Variants / Examples

### When to use
- Tout rail de navigation gauche : la plateforme DS, le proto, le sous-rail des
  paramètres. Toujours composer `AppSidebar` + ses sous-composants.

### When NOT to use
- Un panneau de propriétés / d'outils à droite → ce n'est pas une nav ; utiliser
  un `<aside>` dédié (cf. le rail Controls du playground).
- Une barre d'onglets horizontale (nav dossier V2) → c'est la Top Bar / Niveau 3
  Strip (cf. `shell/NAV-BEHAVIOR.md`), pas ce rail.

### Anatomie (invariante)
- **Rail** : largeur fixe (défaut 264, nav finale 37416:1376), fond `background`, bord droit `border`, colonne pleine hauteur. Pas de filet entre les groupes de contenu (opt-in `divider` sur SidebarGroup) ; items en gap 2 ; liseré actif 3×15.
- **Header** (h-48) : `SidebarBrand` (logo + wordmark serif + chip optionnel) + **bouton collapse** (`PanelToggleIcon dir="collapse"`, via `onCollapse`) à droite - la barre glisse au survol (aperçu du repli), clic = masque la nav.
- **Groupes** (`SidebarGroup`) : label à point brand (IBM Plex Mono 11 uppercase), séparés d'un filet ; `last` retire le filet du bas.
- **Items** (`NavItem`, du proto) : 4 variantes - `destination` (icône + liseré orange + icône brand sur l'actif), `recent` (avec `trail` = dossier de rattachement), `create` (bouton en tête de liste), `see-all` (pied de section).
- **Footer** optionnel.

> **Pas de rail d'icônes réduit.** Le mode Reduced/Collapsed (48px, icônes
> seules) est `Generation=Legacy` dans Figma et **n'est pas utilisé** : le proto
> appelle toujours le rail déployé. Le seul « repli » est la **masquée** (largeur
> 0, rien ne subsiste) - cf. les 3 états ci-dessous. La prop `collapsed` de
> `NavItem` reste donc un vestige legacy, à ne pas employer.

### API
L'exemple canonique est **la nav du proto Plato** (pas la nav du playground DS) :
destinations produit + sections récentes + pied profil. C'est le rail que le
proto tourne (le playground DS n'est qu'un autre consommateur du même shell).

```jsx
// Une seule porte : NavItem / NavSectionHeader / SidebarUserInfo ré-exportés.
import { AppSidebar, SidebarBrand, SidebarGroup, NavItem, NavSectionHeader, SidebarUserInfo } from '../ui/AppSidebar';

<AppSidebar
  header={<SidebarBrand onClick={goHome} />}            {/* proto : pas de chip */}
  footer={<SidebarUserInfo name="Meghan" org="Cabinet Hexa" avatar={<Avatar/>} onClick={openMenu} />}
>
  {/* Destinations produit - sans en-tête de section */}
  <NavItem icon={Home}          label="Accueil"           active={page==='home'}          onClick={goHome} />
  <NavItem icon={FolderOpen}    label="Mes dossiers"      active={page==='dossiers'}      onClick={goDossiers} />
  <NavItem icon={MessageCircle} label="Mes conversations" active={page==='conversations'} onClick={goConversations} />
  <NavItem icon={Settings}      label="Paramètres"        active={page==='settings'}      onClick={goSettings} />

  <SidebarGroup label="Dossiers récents">
    <NavItem variant="create" icon={FolderPlus} label="Nouveau dossier" onClick={createDossier} />
    <NavItem variant="recent" icon={FolderOpen} label="Martel / AXA" onClick={openMartel} />
    <NavItem variant="see-all" label="Voir tout" onClick={goDossiers} />
  </SidebarGroup>
  <SidebarGroup label="Conv. récentes" last>
    <NavItem variant="create" icon={MessageCirclePlus} label="Nouvelle conversation" onClick={newConv} />
    <NavItem variant="recent" label="Préavis - fin de contrat" trail="Martel / AXA" onClick={openConv} />
  </SidebarGroup>
</AppSidebar>
```

| Composant | Rôle / props |
|---|---|
| `AppSidebar` | chrome du rail : `header`, `footer`, `width` (264), `children`, `onCollapse` (rend le bouton collapse dans le header) |
| `SidebarBrand` | header : `chip`, `onClick`, `title` (« Plato ») |
| `SidebarGroup` | `label`, `action` (bouton créer), `last`, `children` — enveloppe `NavSectionHeader` |
| `NavItem` (shell) | `variant` (destination/recent/create/see-all), `icon`, `label`, `trail`, `active`, `collapsed`, `onClick` |
| `NavSectionHeader` (shell) | `label`, `action` |

### Comportement - repli / peek
- **Ouverte ↔ masquée** : 264 → 0 en flux (300 ms cubic-bezier(.22,1,.36,1), fondu 200 ms). Masquée, **rien ne subsiste** (aucun rail d'icônes) ; `⌘\` bascule partout. État de session, non persisté (`shell/NAV-BEHAVIOR.md`).
- **Auto-collapse sur entrée dossier** *(règle produit)* : **entrer dans un dossier (« matter ») replie automatiquement la nav org.** On plonge dans le travail du dossier ; le breadcrumb de la Top Bar + le contrôle « Menu » (peek au survol) suffisent à se repérer et à ressortir. L'utilisateur peut la rouvrir (la préférence vaut ensuite pour la session), mais **chaque nouvelle entrée dans un dossier la replie de nouveau**. Implémenté dans `openDossier` (`setNavHidden(true)`), câblé aussi dans `NAV-BEHAVIOR.md`. Ne concerne QUE l'entrée dossier - Accueil / Conversations / Paramètres respectent la préférence de session.
- **Peek** : nav masquée, survol du contrôle « Menu » → overlay complet (le contenu ne reflue pas), seule situation où le rail porte une ombre.

### Contextes du rail
- **Nav org** (défaut) : Accueil / Mes dossiers / Mes conversations / Paramètres + récents.
- **Settings** (`Context=Settings`, Figma 36641:50716) → **`SettingsSidebar`** (`src/components/shell/SettingsSidebar.js`) : dans les réglages, ce sous-rail **REMPLACE** la nav org (« le sous-rail EST la nav ») - groupes « Votre compte » / « Organisation ». Composé sur AppSidebar, jamais re-roulé. Visible dans le block **Paramètres** (`/ui-kit/b/parametres`).

### Gabarit / dimensions
Rail **à largeur fixe**, `flex-shrink-0`, première colonne de la rangée de contenu
(à gauche du contenu qui prend `flex-1`) :
| Propriété | Valeur |
|---|---|
| Largeur | `264px` (prop `width`, défaut 264 - Figma 37416:1376) |
| Fond / bord | `background` + bord droit `borderStrong` |
| Padding items | `px-2 pt-3` (groupe nav), groupes espacés `pt-5 pb-2` |

Le rail vit dans un **slot de nav** piloté par le shell (ouvert / masqué / peek) - une page
ne gère pas son état, elle passe juste son contenu (`NavItem`, `SidebarGroup`). Masqué, il
disparaît et le contenu s'étend pleine largeur (« Menu » via `NavExpandControl`). Contrat de
page complet : fiche block **`/ui-kit/b/shell`**.

### Tokens used
`background` (fond), `borderStrong` (bord droit + filets), `cream` (item actif / hover), `brand.DEFAULT` (liseré + point + icône active), `mutedForeground` (labels de groupe). Zéro valeur en dur.

## Sprint / Explos

- Comportement complet (états, transitions, collapse/peek, nav dossier V2) :
  `src/components/shell/NAV-BEHAVIOR.md` + lab `/ui-kit/nav-system`.
- Pièces canoniques dans `src/components/shell/` (NavItem, NavSectionHeader) :
  **ré-exportées par AppSidebar**, plus de doublon. Les autres pièces shell
  (NavPromoBanner, NavExpandControl, Niveau3Strip…) restent des compléments.
- **Consommateur migré** : la nav de la plateforme DS (`App.js / renderDSSidebar`)
  compose AppSidebar avec les vraies pièces NavItem.
- **Consommateurs à migrer sur le chrome AppSidebar** (ils utilisent déjà NavItem,
  mais assemblent le rail inline) : la nav du proto (`renderUnifiedSidebar`) et le
  sous-rail des paramètres (`renderSettingsPage`). Chantier staged - à faire avec
  soin (états dossier/collapse/peek/promo/footer).

## Proto demo

`/ui-kit/c/AppSidebar` — la fiche ; le rail lui-même est visible en permanence à
gauche de la plateforme (dogfooding).
