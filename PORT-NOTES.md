# PORT-NOTES — Plato « Assistant & Navigation »

Suivi du port du modèle du proto (specs dans `.context/attachments/`). Étapes livrées : **1 (shell)** et **2 (composer)** du plan de livraison, + fondations (store de threads, service agent mocké). Nav de référence : **B**.

## Table de correspondance surface → composant

| Surface (inventory) | Implémentation | Statut |
|---|---|---|
| Application frame (4 états) | `App.js` : `renderAssistantSurface` (home + conversation centrale), return final (dossier), `renderDossierListPage` / `renderConversationsIndexPage` / `renderSettingsPage` (index) | fait |
| Context bar (top) | `renderConversationTopBar` - conversation centrale seulement ; supprimée partout ailleurs (jamais vide) | fait |
| Org navigation | `renderUnifiedSidebar` (créations, destinations, récents, compte) | fait |
| Nav collapse & peek (spec `5-nav-collapse-and-peek.md`) | `renderNavSlot` (ouverte ↔ disparue, 300ms `cubic-bezier(.22,1,.36,1)` + fondu 200ms + visibility retardée - AUCUN rail d'icônes), `renderNavExpandControl` (extrême gauche de la barre / du header, absolu sur les surfaces sans barre), `renderNavPeek` (overlay 80vh centré, ombre `14px 0 34px`, slide 260ms, nom du dossier répété en tête, footer « ⌘\ pour rouvrir ») ; verrou 600ms post-masquage, bord gauche ≤6px + 180ms (annulé au-delà de 28px), grâce de fermeture 220ms, Escape, navigation ferme, entrer en dossier force l'ouverture, jamais au tactile ; état de session non persisté. Écart : largeur 264px (frame Figma) au lieu des 276px de la spec - le fonctionnement est celui de la spec, la métrique celle du Figma. | fait |
| Dossier navigation | **Décision 08/09 (capture du proto) : le modèle B est abandonné.** La sidebar org RESTE dans le dossier ; les cinq vues = rangée d'onglets sous le nom du dossier (« Informations · Chiffrage · Pièces n · Actes · JP », diamants de diff portés, un clic ferme le drawer JP). `renderDossierNav` supprimée ; le « force open » du §5 de la spec nav (motivé par B) est retiré - la préférence ouverte/masquée vaut pour la session. | fait |
| Workspace header (dossier) | `renderDossierWorkspaceHeader` (nom + switcher, statut, menu terminé/reprendre, réouverture du rail) | fait |
| Conversation rail (nouveau composant sanctionné 1/3) | rail existant (`renderChatSidebar`) évolué : header = `src/components/shell/ConversationSwitcher.js` (fils du dossier uniquement) | fait |
| Composer (nouveau composant sanctionné 2/3) | `src/components/assistant/` : `AssistantComposer` (orchestrateur), `RichInput` (contentEditable + tokens insécables), `ComposerMenu` (@ et /, palette + inline), `ComposerToolbar`, `ScopeChip`, `ComposerSystemHeader`, `InlineToken`. Monté en 3 points : home (hero), conversation centrale, rail (standard). Lab : `/ui-kit/assistant-composer` | fait |
| Sas d'import (nouveau composant sanctionné 3/3) | non porté (étape 5) - l'Import V2 existant reste la porte de création | à venir |
| Message list (centrale) | `renderCentralMessage` (user / ai + sources + « ce que j'ai lu » / system / marker) | fait |
| Attachment marker | message `{type:'marker'}` posé par `useThreads.attachThreadToDossier`, rendu dans la centrale | fait (rendu rail à venir) |
| Dossier switcher | `src/components/shell/DossierSwitcher.js` (change le workspace, jamais le périmètre) | fait |
| Index Tous les dossiers | `renderDossierListPage` repensée : colonnes Domaine / Stade / Dernière activité / Prochaine action, création en header | fait |
| Index Conversations | `renderConversationsIndexPage` : filtres Toutes / Sans dossier, contrôle Rattacher, badge Archivée (30 j dérivés), reçu « Déplacé dans X » ; aucun renommage / épinglage / suppression | fait |
| Demande dockée | le bloc userAsk existant, re-docké au-dessus du composer du rail (une seule à la fois) | partiel (la désambiguïsation agent = étape 6) |
| Cards agent (nudges), reçus « ce qui a été fait », désambiguïsation | interface `detectSignals`/`shouldEmit` livrée + testée, aucune UI branchée | à venir (étape 6) |

## Modèle de données

- **`src/hooks/useThreads.js`** - store localStorage `plato_threads` (Thread du data contract §2 : scope, lastActivity ISO, attachedAt/movedFrom, messages). Archivage 30 j dérivé, jamais de suppression. Seed premier lancement : 1 fil par dossier existant.
- **Pont fil actif ↔ `chatMessages`** (App.js) : `chatMessages` reste la variable de travail de tous les flows scriptés ; deux effets la synchronisent avec le fil actif (`activeThreadId`, persisté dans `LS_GLOBAL`). Aucune migration : les messages n'étaient jamais persistés avant.
- **Dossiers** : champs pilotage ajoutés (`domaine`, `stade`, `lastActivity`, `nextAction`), normalisés au restore pour les anciens enregistrements.

## Service agent (interface nommée)

`src/services/assistantAgent.js` (+ tests, 19 verts) : `getCatalog(scope, data)`, `detectSignals(text, scope, dossiers, nudgeHistory)`, `shouldEmit`, `respond`. Tous les seams du data contract y sont marqués `// ⚠ seam (§N)` - rien n'est codé en dur dans un composant. Hors dossier le catalogue ne sérialise **aucun** nom de pièce ; aucune intention destructive n'est jamais renvoyée.

## Écarts assumés avec le proto / la spec

- **Dark mode = opt-out auto-dark (08/09, « bcp de pbm sur les boutons en dark mode »)** : l'app est light-only mais ne déclarait pas de `color-scheme` - en dark mode l'auto-dark du navigateur/OS inversait les fonds sombres des boutons primaires / primaires surélevés en fonds clairs tout en gardant le texte blanc = libellés invisibles. Ajout de `<meta name="color-scheme" content="light">` (public/index.html) + `:root { color-scheme: light; }` (src/index.css) : rendu forcé tel que dessiné quel que soit le thème OS.

- **Élévation composer standard adoucie (08/09, « more subtle elevation »)** : `AssistantComposer` variante `standard` (conversation centrale + rail) - ombre réduite au bord `#d6d3d1` + une seule ombre courte `0 1px 2px @0.04` (le lift `0 4px 6px -4px` est retiré).

- **Contrôles démo repliables (08/09, « make collapsible and collapse by default »)** : le bloc Vue / État / Quota du pied du sous-rail Paramètres est derrière un en-tête « DÉMO » repliable (`demoControlsOpen`, chevron), **replié par défaut**.

- **Sous-rail Paramètres = fond beige + repliable (08/09, « background beige aussi et collapsable possible aussi »)** : `renderSettingsPage` - le sous-rail des paramètres passe de `bg-white`/`border-border` au **fond beige `#f8f7f5` + `border-border-strong`** (comme la nav org), reçoit un **glyphe de repli** dans son en-tête (`PanelToggleIcon dir="collapse"` → `hideNav`) et est enveloppé dans `renderNavSlot` : il se replie avec le MÊME état `navHidden` que la nav principale (contrôle « Menu » `renderNavExpandControl` posé en absolu dans le contenu). Item actif = crème + bord (aligné sur la nav). Pas de peek sur cette surface (settings hors `NAV_SURFACES`) : réouverture au clic.

- **Ancien layout « Info Dossier » (legacy grid) SUPPRIMÉ (08/09, « old layout, delete »)** : l'onglet Informations d'un dossier avait DEUX rendus - le layout streaming mono-colonne (drop-first) et un **« legacy grid »** (grid-cols-3 : cartes Informations victime / Fait générateur / Commentaire d'expertise + encart Chiffrage sticky) qui s'affichait pour les dossiers non-drop-first (dont les dossiers de démo). Le garde `if (dropFirstActive || dropFirstPieces.length > 0)` est retiré et le bloc legacy supprimé : le **layout streaming est désormais le rendu unique** de l'onglet Informations (l'encart Chiffrage de droite disparaît de cet onglet - il vit sur l'onglet Chiffrage).

- **Pills de démarrage home alignées sur le composer (08/09, « aligne avec le inner »)** : la rangée de pills sous le composer de la home reçoit `px-2.5` (10px) pour que leur bord gauche s'aligne sur la carte blanche du composer (le halo crème fait 10px), au lieu de déborder sur le bord du halo. + pills dé-« pilulées » plus tôt (`rounded-full`→`rounded-lg`).

- **Nav masquée = contrôle « Menu » (frame 09fvZrDgcY83Js7y864E4v 3757:30888) - FAIT (08/09, « when menu collapse it should look like this »)** : `renderNavExpandControl` porte désormais le libellé **« Menu »** à côté du glyphe (logo Plato + `PanelToggleIcon dir="expand"` + « Menu »). Dans le dossier, ce contrôle est rendu en **bande dédiée en tête du workspace** (`renderDossierWorkspaceHeader`, ligne propre `px-8 pt-3` au-dessus du nom du dossier - jamais en ligne avec lui). Sur les autres surfaces (home, index, conversation centrale) il reste ancré en haut à gauche (absolu / dans la barre).

- **Nav « Sidebar Plato » (frame 09fvZrDgcY83Js7y864E4v 3735:32022) - FAIT (08/09, « recent conv + matters in nav, elevated CTAs »)** : (1) **CTA « Nouveau dossier » ré-élevé en bouton PRIMAIRE sombre** (`bg-foreground`/`text-white`, icône blanche, ombre `0 1px 2px rgba(26,26,26,.16)`) - annule la décision « les deux en blanc bordé » du point ci-dessous, sur la base de cette frame plus récente ; « Nouvelle conversation » reste la carte blanche bordée (icône passée de l'orange brand au foreground pour matcher la frame). (2) **Seed de démonstration au premier lancement** (`buildDemoSeed`, App.js + `useThreads.seedThreads`) : le proto démarrait vide (onboarding) donc les sections Dossiers récents / Conv. récentes DISPARAISSAIENT (gate `.length > 0`). On sème désormais 4 dossiers corporel ouvrables (chargent les données baseline) + 3 conversations libres droit-social titrées, uniquement quand `LS_GLOBAL` est absent (jamais par-dessus des données réelles ; `?capture` et `?demo=social` court-circuitent avant). Vider le localStorage réinitialise à cet état.

- **La frame Figma « Plato - Design » 3735:32021 supersède le behaviour map sur la home** (décision utilisateur, 07/09/2026) : la home porte un eyebrow mono orange + question serif, le composer halo (max 690), et DEUX colonnes de récents (« Dossiers récents » / « Conv. récentes » + Voir tout) sous le composer - le « greeting + composer et rien d'autre » du behaviour map ne tient plus. Sidebar : « Nouveau dossier » AVANT « Nouvelle conversation » (les deux en boutons blancs bordés `outline` depuis la frame 3746:40696 - le primaire dark est abandonné), libellés « Mes dossiers » / « Mes conversations », 264px sur fond canvas, sections de récents à en-têtes mono, pas de cartes promo (le connecteur email garde ses autres touchpoints), UI Components déplacé dans Paramètres › Développement. Conversation centrale : colonne max 690.

- **Le composer « ne bouge pas » (§3.1)** : à la home il est centré sous la salutation ; au premier envoi il s'ancre en bas de la même colonne. Même composant, même conteneur, pas de re-montage - mais un déplacement visuel existe (pattern standard). À re-trancher si gênant.
- **Dépôt hors dossier** : version minimale (chips « document de travail » au-dessus de l'input, envoyés en pièces jointes du message). Panneau latéral, plafond de 5, expiration 30 j, transvasement = étape 5.
- **Rattachement** : version shell (migration du fil + marqueur + flash du chip + reçu dans l'index + modale centrée de choix). Bandeau de transvasement fusionné et card 2 champs = étape 4.
- **`⌘←` (remonter d'un cran)** : non fait (TODO), la hiérarchie a déjà une seule remontée par cran.
- **Hover-peek de la sidebar repliée** : non fait (question ouverte du discard §C).
- **Commandes démo du rail** (`/tp-*`, `/redaction-*`…) : la palette dédiée a été retirée avec l'ancien composer ; les commandes marchent toujours en tapant `/commande` + Entrée (le menu `/` laisse passer l'envoi quand rien ne matche). Outillage interne, pas un comportement produit.
- **Boutons « Pièces / Modèles »** de l'ancien composer : non portés - remplacés par le menu `@` (tokens inline) ; les tokens pièce/modèle sont re-mappés en docs attachés à l'envoi pour que les flows de rédaction existants continuent de marcher.
- **Niveau 3 - FAIT (08/09, suite à l'audit)** : en-tête d'objet normé (§1.4) livré pour poste / poste-IV / acte dans `renderContentSubHeader`. **Restylé le 08/09 sur la frame Figma 3752:44432 (« breadcrumb strip ») :** bande à filet bas (`border-b`, ~54px, px-8) au lieu de la pose nue sur canvas ; retour NOMMÉ via `breadcrumbReturn` = petit bouton carré 26px (fond secondaire `#eeece6`) portant `ArrowLeft` + libellé « Retour au chiffrage » / « Retour aux actes » (unique retour du cran) ; code en **badge fond secondaire** (`#eeece6`/`#44403c`) au lieu du pill blanc bordé ; libellé + montant ; **filet vertical avant l'action primaire** ; précédent/suivant avec compteur « n / N » parmi les frères (`effectivePostes`, `allIvPostes`, actes non-bordereaux-appairés) conservé (absent du Figma mais fonctionnel). PairTabs acte/bordereau conservés. `namedReturn` supprimée (plus d'appelant).
- **Hiérarchie du header dossier au niveau 3 - TRANCHÉ (09/09, « choisissons la meilleure solution UX »)** : l'acte/poste ouvert ne monte PAS dans les breadcrumbs du haut (le titre resterait dupliqué dans le strip qui ancre badge/date/PairTabs/Télécharger, et le retour deviendrait double - la règle « un seul retour nommé par cran » tient). Modèle : bande du haut = sortir du dossier (Menu | ‹ Mes dossiers, filet bas + hairline vertical entre Menu et le fil), onglets = nav de vue (l'onglet reste allumé au niveau 3), strip §1.4 = l'objet + ses outils. En contrepartie le cran dossier se COMPACTE au niveau 3 (`isSubLevel` dans `renderDossierWorkspaceHeader`) : paddings resserrés, badge d'état et note « Créé depuis une conversation » masqués - le nom reste pour le switcher.
- **Icône de collapse nav & rail - FAIT (08/09)** : nouvelle icône « panel » de la lib système (glyphe `custom/panel-collasped|expanded`). **Composant `PanelToggleIcon` (SVG inline, géométrie EXACTE de Plato---System 37425:19556 : rect 18×18 rx3 stroke 1.33 + barre verticale ; déplié = barre à DROITE x16.62, replié = barre à GAUCHE x7.35, delta 9.27).** L'animation « très spécifique » = la barre GLISSE horizontalement (transition transform 300ms `cubic-bezier(.22,1,.36,1)`) au survol du bouton (`group`/`group-hover`) : `dir="collapse"` (header nav) repose à droite et glisse à gauche (aperçu du repli) ; `dir="expand"` (`renderNavExpandControl`) l'inverse. Remplace `ListCollapse` (plus de flip `-scale-x-100`). Le rail chat en dossier garde lucide `PanelRight` (`renderChatSidebar`, panneau à droite). Aucune donnée de keyframe côté Figma - courbe/durée choisies pour matcher la signature de la nav.
- **Nav « latest » (frame Plato---Design 3757:24758) - FAIT (08/09, « use exactly the new nav »)** : le rail suit désormais la frame à la lettre. (1) Fond **beige `#f8f7f5`** (canvas) - le `card`/blanc de la frame a été écarté à la demande (« background should be beige »), on garde la décision « fond canvas ». (2) **Bandeau « Connectez votre boîte mail »** en HAUT sous le header (dégradé bleu `#e3e7f2`→transparent 59.5%, icône mail + chevron, `#1e3a8a`), affiché tant qu'aucune boîte connectée - supersède « pied compact » (l'email n'est plus une promo de pied). (3) Item actif = fond crème + **bord `#d6d3d1` + ombre 2xs**. (4) Rangées **« Voir tout »** sous Dossiers récents / Conv. récentes (→ pages index). (5) Pied = **bandeau parrainage** « -10% à chaque parrainage » (même dégradé bleu, gift + chevron, clic → modale) PUIS **PlanCard pleine** (`renderWeeklyQuotaCard` variant `full` + trial) - remplace les anciennes lignes de promo compactes + la ligne de quota. Ancienne mécanique `promos`/`mailPromoHidden.nav`/ligne quota supprimée du rail (le dismiss croix n'existe plus ; `parrainagePromoHidden` garde le gate). Écart mineur restant : logo header = icône `logo-plato.png` + « Plato » serif (au lieu du wordmark VECTO unique) - équivalent visuel.

## TODO(question) - ne pas trancher seul

- `TODO(question)` verticale par défaut des fils libres (constante `DEFAULT_FREE_VERTICAL`, App.js) - héritée du workspace ?
- Routage par mots-clés de la home : construit nulle part (device de démo, discard §C1).
- Décisions épinglées lisibles hors dossier (portefeuille) ou contenu de dossier ? Le service les traite comme lisibles (spec actuelle).
- Journaliser les lectures croisées A→B (audit invisible) ?
- Plafond de 5 documents de travail : règle produit ou quota provisoire ?

## Seams encore mockés (⚠ data contract)

- §1 : `stade`, `nextAction` rédigés, pas dérivés.
- §3 : `respond()` = réponses en conserve (ordre réponse-d'abord respecté) ; `readStatement` écrit, pas généré du read set.
- §4 : catalogue d'intentions statique, filtrage par verticale minimal, aucun entitlement réel.
- §5 : NER heuristique (tokens normalisés + préfixe), confiance fixée ; NudgeState non persisté (aucune UI ne le consomme encore).
- §7-§8 : documents de travail sans expiration réelle ; import inchangé (Import V2 existant).

## Componentisation shell (09/09, préparation handoff Figma)

Les briques de la nav sont extraites d'App.js en composants purs (`src/components/shell/`) : `NavItem` (variants destination / recent+trail / create / see-all, états hover-actif documentés), `NavSectionHeader`, `NavPromoBanner` (edge top/bottom), `NavExpandControl` (« Menu »), `PanelToggleIcon` ; + `SuggestionPill` (`src/components/assistant/`, pills de la home). `renderUnifiedSidebar` / `renderNavExpandControl` restent dans App.js mais ne font plus que composer ces composants (aucun changement visuel). Comportement/motion de la nav spécifiés dans `src/components/shell/NAV-BEHAVIOR.md` ; brief agents Figma dans `.context/figma-handoff-nav.md`.

Deuxième passe (même jour, parité complète avant Figma) : `BreadcrumbBand` (bande h-12 Menu | hairline | ‹ Mes dossiers), `DossierTab` (onglet avec compteur / diamant de diff / point streaming), `ConversationTopBar` (fil « Mes conversations / titre » + renommage, slots leading + modale), `Niveau3Strip` (+ `BreadcrumbReturn`, `SiblingNav`, `CodeBadge`, `StripDivider` - les trois bandes poste / poste-IV / acte les composent ; cascade et PGPA gardent leurs bandes blanches legacy), `PlatoAssistantButton`, `PlatoIcon`, `ConversationsIndexPage` (la page entière, shell passé en slots). `renderDossierWorkspaceHeader` / `renderContentSubHeader` restent dans App.js en pure composition ; imports lucide orphelins (`ArrowLeft`, `MessageSquare`) retirés.

## Nettoyage restant

- États morts de l'ancien composer du rail dans App.js (`mentionQuery`, `attachMenuOpen`, `chatInputValue`…) - warnings lint, sans effet.
- `npm run build` compile (le repo a ~130 warnings pré-existants ; `CI=true` n'a jamais été vert ici).
