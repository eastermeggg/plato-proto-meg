# Architecture Plato - la carte produit pour construire un flow

> À lire AVANT de créer un nouveau flow ou un nouvel écran (règle 11
> d'`AGENTS.md`). Le block Écran-gabarit donne le squelette d'UN écran ;
> ce document donne ce qui l'entoure : la nav, le shell, les objets métier,
> et l'endroit où un flow se branche. Tout est vérifiable dans le code -
> chaque section pointe ses fichiers.

Dernière mise à jour : 25/09/2026.

## 1. Deux mondes

| Monde | Route | Code | Rôle |
|---|---|---|---|
| Plateforme DS | `/` (= `/ui-kit`) | `src/components/ui-kit/` | L'outil de travail de la team : inventaire, fiches, blocks, labs |
| Proto produit | `/app` | `src/App.js` + `src/components/<domaine>/` | Le prototype Plato (assistant juridique) |

`App.js` est un monolithe (~25 000 lignes) en résorption : il porte l'état
global, le routing et les écrans historiques. Les composants en sont extraits
progressivement vers `src/components/<domaine>/`. On ne le clone JAMAIS
(règle 11) ; on s'y branche (section 6).

Domaines extraits : `shell/` (nav, barres), `assistant/`, `jp/`
(jurisprudence), `pieces/`, `redaction/` (actes), `preview/` (PreviewPanel),
`connectors/` (boîtes mail), `social/` (relevé d'heures, cotisations),
`billing/`, `preferences/`, `ui/` (le DS).

## 2. Les routes

Routing custom dans `App.js` (`pathToPage` / `pageToPath`, ~l. 1460) - pas de
react-router pour les pages, l'URL est un miroir de l'état :

| Route | Page |
|---|---|
| `/app` | Accueil produit (hero assistant « Hey John ») |
| `/dossiers` | Index des dossiers |
| `/dossier` | LE dossier ouvert (vue single-dossier : le dossier actif vit dans l'état, pas dans l'URL) |
| `/conversations` · `/conversations/:id` | Index + fil de conversation assistant |
| `/settings` | Paramètres (boîtes mail, licences, usage) |
| `/welcome` | First-run (login, essai, licence) |
| `/ui-kit/<slug>` | Sections plateforme (`UI_KIT_SUBSECTION_SLUGS`) et labs (`UI_KIT_DEDICATED_PAGES`) |
| `/ui-kit/c/<id>` · `/ui-kit/b/<id>` | Fiche composant · block |

## 3. Le shell - trois niveaux de navigation

Spec de référence : `src/components/shell/NAV-BEHAVIOR.md` (comportements,
transitions, états au pixel). Vitrine : `/ui-kit/shell`. À retenir :

**Niveau 1 - le rail** (`AppSidebar`, 264px). Trois états : ouverte, masquée
(contrôle « Menu » `NavExpandControl`), peek (overlay au survol). **Entrer
dans un dossier replie automatiquement la nav** - on plonge dans le travail,
le breadcrumb suffit pour ressortir.

**Niveau 2 - la barre du dossier** (48px, `renderDossierWorkspaceHeader` +
`TopBar`) : `Mes dossiers / Nom-du-dossier | onglets … Plato Assistant · ⋮`.
Le nom du dossier en serif est l'ancre. Les onglets d'un dossier :
**Dossier · Chiffrage · Pièces · Actes · Jurisprudence** (`tabsConfig`,
App.js ~l. 3425). Le titre de page et ses actions descendent DANS le contenu
(en-tête sticky), jamais dans le chrome.

**Niveau 3 - l'objet ouvert** (`Niveau3Strip`) : poste de chiffrage, acte,
décision JP. La pile de navigation est un stack (`navStack`) : dossier →
onglet → objet.

**La règle des retours : deux retours, jamais empilés.** « Mes dossiers »
(dans la barre) = quitter le dossier ; « ← Retour au chiffrage » (dans la
page) = remonter d'un cran. Deux plans différents, zéro ambiguïté.

Interdit partout : re-rouler une barre (`AGENTS.md` règle 7 + ratchet
`ds-check-raw-elements`). Un nouvel onglet = une entrée de plus dans
`tabsConfig` + un contenu ; une nouvelle destination = un `NavItem` de plus.

## 4. Les objets métier

| Objet | C'est quoi | Modèle / seed |
|---|---|---|
| **Dossier** (matter) | Le conteneur de travail. Typé à la création : dommages corporels ou droit social. Statut ouvert/fermé | état App.js (`dossiers`, `victimeData`, `faitGenerateur`) |
| **Pièce** | Document du dossier. Camp `nous` / `adverse`, type de doc, date, catégorie hiérarchique (numérotation I / I-A / I-A-1), flag `inclureDansBordereau` | `src/data/piecesModel.js` (+ `piecesSeed`, `pilesSeed`) |
| **Bordereau** | La liste numérotée des pièces communiquées qui accompagne un acte. Organisation PROPRE (sections + numéros), découplée de l'arbre des pièces. Citation dans un acte : `[pièce:N:intitule:date]` | `src/data/bordereauModel.js` |
| **Acte** | Assignation, conclusions… Rédigé dans l'ActCanvas, cite pièces et JP inline pour chaque fait / argument | `src/components/redaction/`, `src/data/redactionScenarios.js` |
| **JP** (jurisprudence) | Décisions. Deux périmètres étanches : JP du cabinet (org) et JP du dossier - jamais mélangées en liste, le cabinet remonte via la recherche | `src/components/jp/`, `src/data/mockDecisions.js` |
| **Poste de chiffrage** | Ligne du chiffrage (préjudice) ; ouvre un niveau 3 | état App.js (`allPostes`) |
| **Conversation** | Fil assistant. L'assistant est OMNIPRÉSENT (bouton `PlatoAssistantButton` dans la barre) ; les dossiers sont du contexte liable | `useThreads` (`src/components/assistant/`) |
| **Boîte mail** | Connecteur email (communes vs personnelles) ; l'import V2 « Récolte & Bordereau » constitue le dossier | `src/components/connectors/`, `src/data/emailSeed.js` |
| **Relevé d'heures · Cotisations** | Objets du dossier social | `src/components/social/`, `src/data/cotisationsSocial.js` |
| **Licence / usage** | Pricing par siège (PRO/MAX/MAX+) + jauge d'usage hebdo | `src/data/pricing.js`, `src/components/billing/` |

## 5. Les surfaces d'un flow - qui fait quoi

| Besoin | Surface | Règle |
|---|---|---|
| Créer un objet | `Dialog` (modale centrée) | header serif + body + footer ; UNE action primaire |
| Modifier / détailler | `Drawer` (panneau latéral master, sm 408 / wide 860) | s'ouvre à GAUCHE du chat (`--chat-offset`) : on continue de parler à l'assistant pendant qu'on regarde |
| Confirmer du destructif | `AlertDialog` | jamais un Dialog custom |
| Prévisualiser une source (pièce, JP, loi, email…) | `PreviewPanel` (7 kinds) | même règle chat-offset |
| Menu d'actions d'une ligne | `Dropdown` | pas de Popover custom |
| Feedback d'action | toast (avec « Annuler » si réversible) | le traitement de fond vit dans le CHAT, pas en cartes « en cours » |
| Tableau de données | système custom `DataTableCell` / `DataTableHeader` | `docs/table-system.md` - PAS shadcn |

## 6. Où se branche un nouveau flow

Trois points d'entrée, du plus courant au plus rare :

1. **Dans un dossier** (le cas normal) : un onglet de plus dans `tabsConfig`
   + son contenu, ou un objet de niveau 3 sous un onglet existant. Le chrome
   ne change pas.
2. **Une destination racine** : un `NavItem` dans le rail + une route dans
   `pathToPage`/`pageToPath` + un `PageHeader` dans le contenu.
3. **Un lab d'abord** (recommandé pour tout flow non trivial) : une page
   `/ui-kit/<slug>` (ajouter le slug à `UI_KIT_DEDICATED_PAGES`, le
   composant dans `src/components/ui-kit/`, l'entrée dans Sprint/Explos).
   Jouable, partageable par URL, jetable. Le port dans `/app` vient après
   validation - c'est le chemin qu'ont pris l'import V2, le relevé d'heures,
   les cotisations.

## 7. Le chemin type « nouveau flow », en 6 étapes

1. **Brief** : « construis <le flow> en imitant le block Écran-gabarit »
   (`/ui-kit/b/ecran-gabarit`). Le comment n'est pas tranché ? `ds-explore`
   d'abord.
2. **Lire cette carte** + la fiche des composants concernés
   (`src/components/ui/<Nom>.md`).
3. **Mock data** dans `src/data/<flow>Seed.js` - jamais de données en dur
   dans le composant.
4. **Construire en lab** (`/ui-kit/<slug>`), avec les 5 états (vide,
   chargement, erreur, partiel, idéal) et une action primaire.
5. **Manques** : composant absent → `ds-decide` ; token absent →
   `SIGNALEMENTS.md` ; jamais d'invention silencieuse (le ratchet la bloque
   de toute façon).
6. **Rendre la main** : `ds:doctor` 0 bloquant + `build` + section
   « Hors DS » de la PR remplie.

## 8. Pièges connus

- **Cloner App.js** : interdit, il porte les anti-patterns (c'est LA raison
  d'être du ratchet).
- **Serif partout** : le serif (`RL Para Trial Central`) = titres et ancres
  seulement. Georgia = montants. Inter = le reste.
- **`bg-white` en dur** : les surfaces UI prennent `bg-surface` (dark-ready) ;
  seuls les aperçus de documents papier restent blancs.
- **Deux actions primaires**, **une barre re-roulée**, **un compteur en
  double** (l'onglet dit « Pièces 26 », la barre ne le répète pas).
- **Cartes « en cours »** pour un traitement de fond : non - le chat montre
  le traitement, la zone « À vérifier » ne montre que erreurs / doublons /
  découpes.
