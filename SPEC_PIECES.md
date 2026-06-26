# Spec — Pièces (ingestion, découpage choisi à l'ingestion, ajustement & fusion)

**Statut** : v1 (drop-first, découpage choisi à l'ingestion)
**Auteur** : Meg
**Périmètre** : Cycle de vie d'une pièce dans un dossier — du dépôt au bordereau : modale de dépôt (création & ajout) avec choix de découpage par document, ingestion en arrière-plan, éclatement des piles, ajustement du découpage depuis le panneau, fusion de plusieurs documents, détection de doublons, préférence de découpage.

---

## 1. Contexte

Plato est **drop-first** : l'avocat dépose ses fichiers, l'agent extrait, découpe, classe — le bordereau se remplit tout seul.

Un fichier déposé est souvent une **pile** : une liasse homogène de N documents scannés ensemble (ex. un PDF de 40 pages = 9 factures + 1 rapport). Il faut la séparer en pièces distinctes.

Avant : la pile détectée surgissait dans la zone « À vérifier » sous forme de **carte de décision** (Garder en 1 pièce / Éclater / Ajuster), pilotée par une préférence cabinet `group / explode / ask`. Deux problèmes :

- **L'« identification de pile » est un concept système exposé à l'utilisateur** — l'avocat n'a pas à arbitrer un découpage qu'il n'a pas encore vu.
- **C'est une étape de friction** sur le chemin critique du dépôt.

Maintenant : **le découpage se décide à l'ingestion, document par document, dans la modale de dépôt** — pas via une carte de décision par pile a posteriori. Chaque document de la liste porte un interrupteur **« Ne pas découper » / « Découper »** (découpage activé par défaut), doublé d'un interrupteur maître **« Tout découper »**. L'éclatement est donc *automatique par défaut* mais *révocable d'un geste*, avant même le traitement. L'avocat affine ensuite *après coup*, seulement s'il le souhaite, depuis le panneau du document (« Modifier le découpage »). La zone « À vérifier » ne sert plus qu'aux cas qui exigent vraiment son attention (échec d'analyse, doublon).

---

## 2. Comportement

### 2.1 La modale de dépôt (création & ajout)

Une seule modale — `renderDropFirstModal`, pilotée par `dropModal.mode` — couvre les deux points d'entrée du dépôt :

- **Création** (`mode: 'create'`, titre « Nouveau dossier ») : champ **« Référence du dossier »** en tête, grande zone de dépôt, CTA **« Créer le dossier »**. Tant qu'aucun fichier n'est déposé, le pied propose **« Créer manuellement »** (bascule vers le wizard infos victime + fait générateur).
- **Ajout** (`mode: 'add'`, titre « Ajouter des pièces ») : pas de champ référence (cible le dossier ouvert), zone de dépôt compacte, CTA **« Ajouter les pièces »**. Déclenché par « Ajouter » dans le bordereau ou un drag & drop sur l'onglet Pièces.

Dès qu'au moins un document est présent, la liste s'affiche avec, **par document** :

- icône (trombone, corbeille au survol) + nom du fichier ;
- un **interrupteur segmenté** — **« Ne pas découper »** / **« Découper »** (champ `splitEnabled`), **découpage activé par défaut** (`splitDocsEnabled: true`).

Au-dessus de la liste, une barre d'outils regroupe :

- le compteur **« N documents ajoutés »** ;
- un champ de **recherche** (dès 2 documents) filtrant par nom de fichier ou type détecté (insensible aux accents/casse) ;
- un interrupteur maître **tri-state « Tout découper »** (coché / indéterminé / décoché) + infobulle : « Active ou désactive le découpage pour tous les documents à la fois. Réglez-le ensuite document par document dans la liste. »

**Préférences de nommage** : dès qu'au moins un document est réglé sur « Découper », un encart **« Préférences de nommage des pièces découpées »** apparaît (révélé en fondu + slide) — un textarea pré-rempli avec la consigne par défaut (`DEFAULT_SPLIT_PROMPT`), éditable, qui guide le nommage des pièces issues du découpage. Les pièces découpées **doivent** être renommées ; la consigne s'applique par défaut, est modifiable, ou chaque pièce peut être renommée individuellement après import.

Le choix de découpage est ainsi **fait en amont, document par document**, et committé ligne par ligne (`splitChoice` sur chaque item du traitement) au lancement — il n'y a **pas** de carte de décision par pile a posteriori.

### 2.2 Ingestion en arrière-plan

- Le dépôt lance un **traitement en arrière-plan** ; la progression est visible dans le chat, pas dans le bordereau.
- La zone « À vérifier » n'affiche **jamais** de carte « en cours » — uniquement les cas à arbitrer (voir §3).
- Chaque document analysé est classé par type et atterrit directement comme ligne du bordereau.

### 2.3 Éclatement des piles selon le choix de l'avocat

- À la détection d'une pile, le simulateur applique **le choix du document** (`item.splitChoice`, défini dans la modale) :
  - **« Découper »** → la pile est enregistrée **éclatée** (`mode: 'exploded'`) : ses segments deviennent immédiatement N lignes du bordereau, classées par type. Chaque segment porte un **badge « auto-découpé »** transitoire (≈ 8 s) : signal discret que le découpage est appliqué et ajustable.
  - **« Ne pas découper »** → la pile est conservée en **une seule ligne** (`mode: 'bundle'`), sans badge ; ses points de coupe internes restent disponibles pour un découpage ultérieur depuis le panneau.
- **Aucune carte de décision** pour le split — le choix a déjà été fait dans la modale, pas de passage par « À vérifier ».
- À défaut de choix par document (flux qui n'en fournissent pas explicitement), on retombe sur le **défaut niveau-dossier** (`splitDocs` / `splitDocsEnabled`).
- Une ligne de segment a un id synthétique `pileId::segmentId` ; cliquer dessus ouvre le panneau du document.

### 2.4 AAU je peux ajuster le découpage depuis le panneau

L'ajustement est **post-hoc**, accessible depuis le document, jamais imposé.

- Cliquer une pièce issue d'une pile → ouvre **le panneau document** en mode **aperçu** (`view`).
- Le panneau expose **« Modifier le découpage »** → bascule en mode **ajustement** (`adjust`) dans la même surface (pas de saut de layout) :
  - **Couper** — entre deux pages d'un même document, une jonction fantôme révèle au survol une pastille **« Couper »** qui insère une frontière.
  - **Recoller** — entre deux documents, la frontière est un trait pointillé qui révèle au survol **« Recoller »** (fusionne les deux segments).
  - **Renommer** un segment (nom personnalisé qui prime partout : carte, sommaire, fil d'ariane).
  - **Consigne de découpage** éditable + **« Relancer »** (ré-analyse simulée).
  - Boutons d'en-tête : **« Garder en 1 pièce »** (bundle) / **« Découper »** (exploded) — bascule le mode en direct, sans zone de revue.
- `Cmd/Ctrl+Z` annule pas à pas. Fermer (✕ / Échap / clic hors panneau) **commit** les segments en cours.

### 2.5 AAU je peux fusionner plusieurs documents

- Sélection de **2 documents entiers ou plus** dans le bordereau → la barre de sélection affiche un bouton libellé **« Fusionner »**.
- Le bouton est masqué si la sélection contient un dossier ou un segment de pile éclatée (ceux-ci se recollent via « Recoller », pas via la fusion en masse).
- Ouvre **`FusePiecesModal`** : titre serif « Fusionner N documents », champ **nom de la pièce fusionnée**, liste des documents (trombone + nom), CTA **« Fusionner (N docs) »**.
- Résultat : **une pièce** dont chaque document source devient une partie (pages bout à bout), re-séparable à tout moment via « Modifier le découpage ».

### 2.6 Doublon possible

- À l'ingestion, un document quasi identique à un document déjà présent est signalé comme **doublon possible**.
- Surface : une **carte dans « À vérifier »** (`new ≈ existing`) → **« Garder les deux »** / **« Ignorer »** / **« Voir »** (le document existant).
- La carte se résout après une courte fenêtre (auto-commit), avec **« Annuler »** pendant ce délai.

### 2.7 Préférence « Consigne de découpage »

- Dans Mémoire & préférences, le slot **« Préférences découpage documents »** ne contient plus que la **consigne en langage naturel** (le prompt qui guide l'éclatement, pré-remplit le panneau d'ajustement et alimente le textarea de la modale de dépôt).
- La même consigne par défaut (`DEFAULT_SPLIT_PROMPT`) est éditable **directement dans la modale de dépôt** (champ `renamePattern`, voir §2.1), pour ce dépôt précis, sans toucher au défaut cabinet.
- Le réglage `Garder / Éclater / Me demander` (`group / explode / ask`) a été **retiré** : le découpage se choisissant désormais par document à l'ingestion, il n'avait plus d'objet.

---

## 3. La zone « À vérifier »

Bandeau au-dessus du tableau du bordereau, **sans conteneur** : juste une pile de cartes compactes (une même coque blanche partagée). Elle ne surface que ce qui demande l'attention de l'avocat :

| Carte | Quand | Actions |
|-------|-------|---------|
| **Traitement en cours** | Documents en cours d'analyse | (indicateur agrégé, aucune action) |
| **Échec d'analyse** | L'analyse d'un document a échoué | Réessayer · Ignorer |
| **Doublon possible** | Document quasi identique détecté | Garder les deux · Ignorer · Voir |

La carte **split** (Garder / Éclater / Ajuster) **n'existe plus dans ce flux** — son composant (`SplitReviewCard`) est conservé pour un futur usage (ex. split piloté par le chat) mais n'est plus câblé.

---

## 4. Modèle de données

- **`dropModal`** (état de la modale de dépôt) : `{ files, mode: 'create' | 'add', reference, splitDocsEnabled, renamePattern, docSearch, rapportFileId }`.
  - Chaque entrée de `files` : `{ id, name, fakeSize, guessedType, status, splitEnabled }` — `splitEnabled` = choix de découpage par document.
  - `splitDocsEnabled` : défaut niveau-dossier appliqué aux nouveaux fichiers et piloté par l'interrupteur maître « Tout découper ».
  - `renamePattern` : consigne de nommage (pré-remplie via `DEFAULT_SPLIT_PROMPT`), n'apparaît qu'en présence d'au moins un document « Découper ».
- **Item de traitement** (`buildStagedProcessingItems`) : porte `splitChoice` (copie de `splitEnabled`) ; c'est lui qui décide `mode` à la détection de pile.
- **`piles`** : `pileId → { id, originalName, pileType, aggregate, segments, mode, autoApplied, badgeUntil }`
  - `mode` : `'exploded'` (N lignes) ou `'bundle'` (1 ligne) — piloté par le choix de découpage de la modale (`'exploded'` si « Découper », `'bundle'` sinon).
  - `pileType` : `'split'` (pile détectée) ou `'fusion'` (créée par fusion de documents).
  - `segments[]` : `{ id, label, date, pages, pageStart, pageEnd, _customName?, _split?, _merged?, _fused?, _anomaly? }`.
- **Ligne de bordereau d'un segment** : id synthétique **`pileId::segmentId`** ; émise au rendu par `dropFirstAsBordereauPieces` quand `mode === 'exploded'`.
- **`dropFirstPieces`** : chaque pièce issue d'une pile porte `_pileId` (lien vers l'objet pile).
- **Doublon** : flags `_doublonOf`, `_doublonOfName`, `_doublonResolved` sur la pièce.
- **`pendingPileReviews`** : conservé mais **toujours vide** (plus aucune pile n'y entre ; purgé à la restauration de session).
- **`globalSplitRule`** : conservé comme défaut inerte (`'group'`), non configurable, lu uniquement par le panneau d'ajustement pour le bouton recommandé.

---

## 5. Cas limites

- **Document simple (non-pile)** : ingéré comme une pièce normale, sans badge ni segments.
- **Re-fusionner une pièce déjà éclatée** : passe par « Recoller » dans le panneau, pas par la fusion en masse (bouton « Fusionner » masqué si la sélection contient un segment).
- **Fusion d'une pile « gardée en 1 pièce »** : la pile est aplatie en une seule partie (ses points de coupe internes ne sont pas repris dans la fusion en v1).
- **Sessions enregistrées avant ce changement** : d'éventuels `pendingPileReviews` hérités sont purgés à la restauration — aucune carte de décision ne ressurgit.
- **Onglet Pièces legacy (non drop-first)** : hors de ce flux ; l'auto-découpage et la fusion ne s'y appliquent pas (la fusion n'est câblée que côté drop-first).

---

## 6. Hors-périmètre v1

- **Split piloté par le chat** — le composant carte existe mais n'est pas branché.
- **Fusion côté onglet Pièces legacy** — non câblée (moteur de fusion drop-first uniquement).
- **Reprise des points de coupe internes lors d'une fusion** — une pile « gardée en 1 pièce » fusionnée est aplatie.
- **Réglage cabinet `group / explode / ask`** — retiré ; le découpage se choisit par document à l'ingestion (modale), avec ajustement a posteriori depuis le panneau.

---

## 7. Surfaces / composants

- `App.js → renderDropFirstModal` — la modale de dépôt (création & ajout) : champ référence, zone de dépôt, liste des documents, choix de découpage par document, préférences de nommage. Helpers : `TriStateCheckbox` (interrupteur maître « Tout découper »), `SplitSegmentedControl` (« Ne pas découper » / « Découper » par document), `buildStagedProcessingItems` (porte `splitChoice`), `handleDropFirstCreate` / `confirmAddPieces` / `handleAddMorePieces`.
- `components/pieces/PileReviewBanner.js` + `reviewCards/` (`CardShell`, `LoadingCard`, `ErrorCard`, `DoublonCard`, `SplitReviewCard`) — zone « À vérifier ».
- `components/pieces/PileAdjustSheet.js` — panneau aperçu/ajustement (couper / recoller / renommer / consigne).
- `components/pieces/FusePiecesModal.js` — fusion de documents.
- `components/pieces/BordereauTable.js` — barre de sélection (bouton « Fusionner »), rendu des lignes de segments.
- `components/preferences/PreferenceSlots.js` — slot « consigne de découpage ».
- `data/piecesModel.js` — `dropFirstAsBordereauPieces` (émission des lignes exploded/bundle).
