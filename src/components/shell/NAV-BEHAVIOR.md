# Nav Plato - comportement front, transitions & animations

Spec de référence du shell de navigation (sidebar org « Sidebar Plato »).
Composants : `NavItem`, `NavSectionHeader`, `NavPromoBanner`, `NavExpandControl`,
`PanelToggleIcon` (ce dossier) ; composition + état dans `App.js`
(`renderUnifiedSidebar`, `renderNavSlot`, `renderNavPeek`).

## 1. Les trois états de la nav

| État | Description |
|---|---|
| **Ouverte** | Rail 264px en flux (`NAV_WIDTH`), fond plat `#f8f7f5`, bord droit `border` `#e7e5e3` (nav finale 37416:1376 - le dégradé vertical est abandonné). Le contenu (workspace, rail chat) reflue à côté. |
| **Masquée** | Largeur 0, **rien ne subsiste** (ni rail d'icônes, ni liseré). Le contrôle « Menu » (`NavExpandControl` : logo Plato + glyphe panel + libellé) apparaît à l'extrême gauche de la barre de la surface - ou en absolu `left-3 top-3` sur les surfaces sans barre. |
| **Peek** | La nav complète en **overlay** plein-hauteur (100vh, 264px), ancrée en haut à gauche - son logo retombe exactement sur celui du contrôle « Menu » : la nav « se déplie du coin ». Le workspace ne reflue jamais. Seule situation où la nav porte une ombre : `14px 0 34px rgba(41,37,36,.16)`. |

L'état ouvert/masqué vaut pour la **session** (non persisté). Entrer dans un
dossier ne force plus l'ouverture (décision 08/09, abandon du modèle B).

## 2. Transitions

### Ouverte ↔ masquée (`renderNavSlot`)
La nav s'anime **en flux** (le slot rétrécit, le contenu reflue naturellement) :

- `width : 264 → 0` - **300ms `cubic-bezier(.22,1,.36,1)`** (la courbe signature de la nav)
- `opacity : 1 → 0` - **200ms ease** (le fondu finit avant la largeur)
- `visibility: hidden` **retardée de 300ms** au masquage (rien n'est focusable/cliquable une fois disparue), immédiate à la réouverture
- L'intérieur du slot reste à **largeur fixe 264px** pendant l'animation : le contenu ne s'écrase pas, il est *clippé* par le slot (`overflow-hidden`)

À la réouverture, mêmes valeurs en sens inverse.

### Apparition du peek
- Keyframe `nav-peek-slide` : `translateX(-24px) + opacity 0.4 → translateX(0) + opacity 1`
- **240ms `cubic-bezier(.32,.72,0,1)`** (arrivée douce, départ vif)
- Fermeture : disparition sèche (unmount) - pas d'animation de sortie

### Glyphe `PanelToggleIcon` (micro-interaction signature)
Rect 18×18 rx3 + barre verticale (géométrie exacte Plato---System 37425:19556).
Au **survol du bouton parent** (`group`), la barre **glisse horizontalement**
de 9.27px - transition transform **300ms `cubic-bezier(.22,1,.36,1)`** :
- `dir="collapse"` (header nav) : repos à droite (x 16.62) → glisse à gauche (aperçu du repli)
- `dir="expand"` (contrôle « Menu ») : repos à gauche (x 7.35) → glisse à droite (aperçu de l'ouverture)

## 3. Déclencheurs du peek

Le peek n'existe que **nav masquée**, sur une surface de `NAV_SURFACES`
(home, conversation, conversations, dossiers, list, dossier - jamais settings),
et **jamais au tactile** (`pointer: fine` requis).

| Déclencheur | Règle |
|---|---|
| Survol du contrôle « Menu » | Peek **immédiat** (mouseenter) |
| Bord gauche de l'écran | Curseur **≤ 6px pendant 180ms** → peek. Repasser **au-delà de 28px** avant l'échéance annule l'intention. Un simple passage ne l'ouvre jamais. |
| Verrou post-masquage | **600ms** après le clic de masquage, aucun peek ne peut s'ouvrir (le curseur est encore dans la zone - on n'ouvre pas ce que l'utilisateur vient de fermer). |

## 4. Fermeture du peek

- **Grâce de sortie 220ms** : quitter le peek (ou le contrôle) arme un timer de 220ms ; y revenir avant l'échéance annule la fermeture.
- **Escape** ferme immédiatement.
- **Toute navigation** (clic sur un item) ferme le peek (via `setTimeout(closePeekNow, 0)` pour laisser le clic aboutir).
- Depuis le peek, cliquer le glyphe du header = **épingler** : la nav se cale en place (pas de fermer-rouvrir).

## 5. Raccourcis & accessibilité

- **⌘\** : bascule ouverte ↔ masquée (partout). Rappelé dans les tooltips et en footer du peek (« ⌘\ pour rouvrir »).
- Slot masqué : `aria-hidden`, `visibility: hidden` (aucun focus piégé).
- Item actif : `aria-current="true"` ; tooltip `role="tooltip"` en mode collapsed.
- Glow/anim : `prefers-reduced-motion` respecté sur le glow du composer hero (pas d'équivalent nécessaire côté nav, les transitions sont courtes).

## 6. États des items (`NavItem`)

Typo alignée sur la nav FINALE (Plato---System 37416:1376, 09/09 soir) :
libellés 14px Regular `foreground` #292524, icônes `foreground-secondary`.

| Variante | Défaut | Hover | Actif |
|---|---|---|---|
| `destination` (h-32px, r-6) | texte `foreground` 14 Regular, icône `foreground-secondary` sw 1.75 | fond `cream` PLEIN `#eeece6` + **chevron-right 14px** en fin de ligne (fade-in 150ms) | fond `cream`, bord `border-strong`, texte `foreground` medium, icône `brand` sw 2, **liseré orange 2×15px** `#f47a2c` (left -1, coins droits r-2, glow `0 0 6px @0.38`) |
| `recent` (h-32px ; **44px avec trail**, r-6) | idem ; trail 12px `foreground-secondary` @70 | idem (chevron aussi) | idem destination |
| `create` (h-32px, r-6) | **bouton** : fond blanc, bord `border-strong`, ombre `0 1px 0.5px @0.03`, icône **brand** (folder-plus / message-circle-plus, sw 1.75 - « + » générique sw 2.25), libellé medium `foreground` | fond **dégradé** `#eeece6 → blanc 52.5%`, bord inchangé (le « + » générique pivote de 90°, 200ms ease-out) | - (jamais actif) |
| `see-all` (h-32px, r-6, 14px medium) | texte `foreground-secondary`, chevron fin | texte `foreground`, fond `cream` plein, **chevron glisse de 2px** vers la droite (150ms) | - |

- `trail` (recent) : 2e ligne `CornerDownRight` 10px `#a8a29e` + réf. dossier 11px `foreground-muted` - un fil rattaché montre son dossier.
- Mode `collapsed` (destination) : carré 32px icône seule + tooltip sombre à droite (`bg-foreground`, fade 150ms).
- **Jamais deux items actifs** : sur une surface conversation, c'est la ligne du fil (Conv. récentes) qui s'allume, pas la destination index en plus. Dans un dossier, seule la ligne du dossier s'allume (pas sa conversation).

## 7. En-têtes, bandeaux, pied

- `NavSectionHeader` : point brand 4px + label IBM Plex Mono 11 uppercase opacité 70. Action de section = petit bouton bordé (h-24px) avec « + » qui pivote au survol. Le « + » de « Dossiers récents » crée un dossier, celui de « Conv. récentes » une conversation (⌘⇧O / ⌘O).
- `NavPromoBanner` : dégradé bleu `#e3e7f2 → transparent 59.5%`, contenu `#1e3a8a`, chevron. `edge="top"` (connecteur mail, tant qu'aucune boîte) / `edge="bottom"` (parrainage). Hover : `brightness(.98)` sur le fond.
- Pied (nav finale) : bandeau parrainage → footer compte (avatar 24px · prénom 14 medium · cabinet 12 secondary · chevrons-up-down, hover `cream/60`). **Plus de carte de quota dans la nav** - le quota hebdomadaire vit dans Paramètres › Mon usage. Header : wordmark vectorisé `logo-plato-wordmark.svg` 75×24 (plus d'icône + « Plato » serif).

## 8. Contrôle « Menu » par surface (nav masquée)

| Surface | Pose |
|---|---|
| Home | Bande dédiée `px-6 pt-3` en tête de colonne |
| Conversation centrale | Dans la barre de contexte, à l'extrême gauche, avant « Mes conversations / titre » |
| Index (dossiers, conversations) | Bande `px-8 pt-3` au-dessus du titre de page |
| Dossier | Bande de tête h-48px (`renderDossierWorkspaceHeader`) : Menu **\| hairline verticale \|** « ‹ Mes dossiers » - jamais en ligne avec le nom du dossier |
| Settings | Absolu dans le contenu (surface hors `NAV_SURFACES` : pas de peek, réouverture au clic) |
