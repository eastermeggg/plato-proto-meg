# Spec — Pièces (ingestion, découpage automatique, ajustement & fusion)

**Statut** : v1 (drop-first, découpage automatique)
**Auteur** : Meg
**Périmètre** : Cycle de vie d'une pièce dans un dossier — du dépôt au bordereau : ingestion en arrière-plan, éclatement automatique des piles, ajustement du découpage depuis le panneau, fusion de plusieurs documents, détection de doublons, préférence de découpage.

---

## 1. Contexte

Plato est **drop-first** : l'avocat dépose ses fichiers, l'agent extrait, découpe, classe — le bordereau se remplit tout seul.

Un fichier déposé est souvent une **pile** : une liasse homogène de N documents scannés ensemble (ex. un PDF de 40 pages = 9 factures + 1 rapport). Il faut la séparer en pièces distinctes.

Avant : la pile détectée surgissait dans la zone « À vérifier » sous forme de **carte de décision** (Garder en 1 pièce / Éclater / Ajuster), pilotée par une préférence cabinet `group / explode / ask`. Deux problèmes :

- **L'« identification de pile » est un concept système exposé à l'utilisateur** — l'avocat n'a pas à arbitrer un découpage qu'il n'a pas encore vu.
- **C'est une étape de friction** sur le chemin critique du dépôt.

Maintenant : **le découpage est automatique**. Toute pile est éclatée à l'ingestion ; l'avocat ajuste *après coup*, seulement s'il le souhaite, depuis le panneau du document. La zone « À vérifier » ne sert plus qu'aux cas qui exigent vraiment son attention (échec d'analyse, doublon).

---

## 2. Comportement

### 2.1 Ingestion en arrière-plan

- Le dépôt (drag & drop pleine page, ou ajout depuis le bordereau) lance un **traitement en arrière-plan** ; la progression est visible dans le chat, pas dans le bordereau.
- La zone « À vérifier » n'affiche **jamais** de carte « en cours » — uniquement les cas à arbitrer (voir §3).
- Chaque document analysé est classé par type et atterrit directement comme ligne du bordereau.

### 2.2 Éclatement automatique des piles

- Une pile détectée est enregistrée **déjà éclatée** (`mode: 'exploded'`) : ses segments deviennent immédiatement N lignes du bordereau, classées par type.
- **Aucune carte de décision** pour le split — pas de passage par « À vérifier ».
- Chaque segment auto-découpé porte un **badge « auto-découpé »** transitoire (≈ 8 s) : signal discret que le découpage est automatique et ajustable.
- Une ligne de segment a un id synthétique `pileId::segmentId` ; cliquer dessus ouvre le panneau du document.

### 2.3 AAU je peux ajuster le découpage depuis le panneau

L'ajustement est **post-hoc**, accessible depuis le document, jamais imposé.

- Cliquer une pièce issue d'une pile → ouvre **le panneau document** en mode **aperçu** (`view`).
- Le panneau expose **« Modifier le découpage »** → bascule en mode **ajustement** (`adjust`) dans la même surface (pas de saut de layout) :
  - **Couper** — entre deux pages d'un même document, une jonction fantôme révèle au survol une pastille **« Couper »** qui insère une frontière.
  - **Recoller** — entre deux documents, la frontière est un trait pointillé qui révèle au survol **« Recoller »** (fusionne les deux segments).
  - **Renommer** un segment (nom personnalisé qui prime partout : carte, sommaire, fil d'ariane).
  - **Consigne de découpage** éditable + **« Relancer »** (ré-analyse simulée).
  - Boutons d'en-tête : **« Garder en 1 pièce »** (bundle) / **« Découper »** (exploded) — bascule le mode en direct, sans zone de revue.
- `Cmd/Ctrl+Z` annule pas à pas. Fermer (✕ / Échap / clic hors panneau) **commit** les segments en cours.

### 2.4 AAU je peux fusionner plusieurs documents

- Sélection de **2 documents entiers ou plus** dans le bordereau → la barre de sélection affiche un bouton libellé **« Fusionner »**.
- Le bouton est masqué si la sélection contient un dossier ou un segment de pile éclatée (ceux-ci se recollent via « Recoller », pas via la fusion en masse).
- Ouvre **`FusePiecesModal`** : titre serif « Fusionner N documents », champ **nom de la pièce fusionnée**, liste des documents (trombone + nom), CTA **« Fusionner (N docs) »**.
- Résultat : **une pièce** dont chaque document source devient une partie (pages bout à bout), re-séparable à tout moment via « Modifier le découpage ».

### 2.5 Doublon possible

- À l'ingestion, un document quasi identique à un document déjà présent est signalé comme **doublon possible**.
- Surface : une **carte dans « À vérifier »** (`new ≈ existing`) → **« Garder les deux »** / **« Ignorer »** / **« Voir »** (le document existant).
- La carte se résout après une courte fenêtre (auto-commit), avec **« Annuler »** pendant ce délai.

### 2.6 Préférence « Consigne de découpage »

- Dans Mémoire & préférences, le slot **« Préférences découpage documents »** ne contient plus que la **consigne en langage naturel** (le prompt qui guide l'éclatement et pré-remplit le panneau d'ajustement).
- Le réglage `Garder / Éclater / Me demander` (`group / explode / ask`) a été **retiré** : le découpage étant systématiquement automatique, il n'avait plus d'objet.

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

- **`piles`** : `pileId → { id, originalName, pileType, aggregate, segments, mode, autoApplied, badgeUntil }`
  - `mode` : `'exploded'` (N lignes) ou `'bundle'` (1 ligne) — désormais `'exploded'` dès l'ingestion.
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
- **Réglage utilisateur du comportement de découpage** — retiré ; le découpage est automatique, ajustable a posteriori.

---

## 7. Surfaces / composants

- `components/pieces/PileReviewBanner.js` + `reviewCards/` (`CardShell`, `LoadingCard`, `ErrorCard`, `DoublonCard`, `SplitReviewCard`) — zone « À vérifier ».
- `components/pieces/PileAdjustSheet.js` — panneau aperçu/ajustement (couper / recoller / renommer / consigne).
- `components/pieces/FusePiecesModal.js` — fusion de documents.
- `components/pieces/BordereauTable.js` — barre de sélection (bouton « Fusionner »), rendu des lignes de segments.
- `components/preferences/PreferenceSlots.js` — slot « consigne de découpage ».
- `data/piecesModel.js` — `dropFirstAsBordereauPieces` (émission des lignes exploded/bundle).
