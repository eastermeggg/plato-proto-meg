# Spec - Pricing : Mon usage, Collaborateurs (invitation), Plan et facturation

**Statut** : v1 (licences par utilisateur + quota hebdomadaire ; prototype UX uniquement)
**Auteur** : Meg
**Périmètre** : Les trois pages des Paramètres liées au nouveau modèle de tarification - « Mon usage » (compte perso), « Collaborateurs » + le flux d'invitation, et « Plan et facturation » (admin). Pour chacune : objectif, contenu, parcours.

---

## 1. Le modèle (rappel)

- **Licences par utilisateur** : Pro 150 €, Max 290 €, Max+ 590 € HT/mois. Multiplicateur de quota ×1 / ×2 / ×6.
- **Dossiers illimités** (fin du prix au dossier).
- **Quota IA hebdomadaire** : un budget de consommation affiché uniquement comme une **jauge 0-100 %** (jamais de tokens ni d'euros), qui **se recharge le lundi**. Le multiplicateur du plan donne plus de marge.
- **Une licence = un collaborateur** : elle est créée en **invitant** quelqu'un (licence choisie à l'invitation) ou en **attribuant** un plan à un membre existant. Pas de pool de sièges, pas de compteur « X/X », et **pas de licence réservée** (un invité en attente ne bloque aucune licence ; elle s'active quand il rejoint).
- **Sans licence = lecture seule**, gratuit.
- **Prototype = UX uniquement** : pas de backend. Tout est piloté par des bascules démo (persona admin/membre, état de facturation, niveau de quota).

---

## 2. Page « Mon usage » (groupe *Votre compte*)

**Objectif** : permettre à **chaque utilisateur** (admin comme membre) de voir **son** plan et **sa** consommation de la semaine, et de réagir quand le quota est atteint. C'est la vue personnelle.

Contenu :

- **Mon plan** : le nom du plan (ou « Lecture seule »), avec la période d'essai restante ou le multiplicateur de quota.
- **Jauge hebdomadaire** (carte) : un grand % utilisé, une barre, « se recharge lundi ». En période d'essai, l'en-tête de la carte devient un bandeau « Essai gratuit … expire dans X j ».
- **Quota atteint (100 %)** : une bande d'action apparaît sous la jauge. **Un utilisateur ne peut pas augmenter son plan lui-même** : le bouton **« Demander une mise à niveau »** envoie une **demande aux administrateurs** (e-mail), pour tout le monde (membre comme admin). C'est ensuite un administrateur qui ajuste la licence depuis **Collaborateurs**. Il n'y a **pas d'auto-upgrade** depuis la jauge.
- **Inclus dans votre plan** : la liste des fonctionnalités (dossiers illimités, utilisateurs illimités, agent IA, chiffrages, jurisprudence, bordereau + découpe auto, tamponnage, export PDF/Word). Sans licence : « Accès aux dossiers en lecture seule ».

---

## 3. Page « Collaborateurs » + flux d'invitation (groupe *Organisation*)

**Objectif** : gérer les membres de l'organisation et **leur accès** (rôle + licence). C'est **ici** qu'on attribue, modifie et retire les licences, collaborateur par collaborateur.

### 3.1 La liste

- En-tête + bouton **« Inviter un collaborateur »** (admin).
- **Récap licences** (admin) : pour chaque palier, le **nombre de licences actives** (= collaborateurs sur ce plan).
- **Tableau** : Nom (badges « Vous » / « Invité »), Rôle, Plan (ou « Lecture seule »), chevron. Cliquer une ligne (admin) ouvre le **panneau collaborateur**.

### 3.2 Inviter un collaborateur (modale)

- **E-mails** : un ou plusieurs (puces ; Entrée / virgule / collage).
- **Rôle** : contrôle segmenté **Membre / Admin**.
- **Licence** : Lecture seule (gratuit) / Pro / Max / Max+. Pour un plan payant, mention « + licence · X €/mois ». Légende : « La licence s'active dès que le confrère rejoint le cabinet. »
- **Valider** → les invités sont ajoutés avec un **statut en attente** (badge « Invité »), toast « N invitations envoyées ».

### 3.3 Statut en attente (pending)

Un invité reste **en attente** tant qu'il n'a pas finalisé son inscription / setup sur la plateforme. Dans son panneau :

- Bandeau **« Invitation en attente »** : « {Prénom} n'a pas encore finalisé son inscription sur la plateforme. »
- **Renvoyer l'invitation**, et (démo) **Marquer comme actif** pour simuler son arrivée.
- Le pied affiche **« Annuler l'invitation »** (au lieu de « Supprimer »).
- **Pas de licence réservée** : sa licence s'affiche comme celle des autres et reste modifiable.

### 3.4 Le panneau collaborateur (drawer latéral droit)

**Objectif** : consulter / gérer un membre. Sections à plat, séparées par des filets :

- **Licence** : plan + jauge hebdomadaire ; **« Modifier »** ouvre le sélecteur de licence.
- **Rôle** : segmented **Membre / Admin** (changement direct ; on ne peut pas changer son propre rôle).
- **Détail** : membre depuis, e-mail.
- Pied : **Supprimer** (ou **Annuler l'invitation** si le membre est en attente).

### 3.5 Changer la licence (sélecteur + impact tarifaire)

**« Modifier »** ouvre la modale **« Choisir une licence pour {nom} »** :

- Radio : Lecture seule / Pro / Max / Max+ (avec prix par palier).
- Dès qu'on choisit un palier différent du plan actuel, un **encart d'impact tarifaire** s'affiche dans la même modale :
  - **Upgrade** : « Vous serez facturé +X € HT/mois, au prorata sur votre prochaine facture. »
  - **Downgrade** : « Votre facturation diminue de X € HT/mois. »
  - **Retrait** : « La licence est retirée, {nom} repasse en lecture seule. »
  - plus le **nouveau total du compte**.
- **Confirmer** applique directement (le bouton reste désactivé tant que le choix n'a pas changé).

---

## 4. Page « Plan et facturation » (groupe *Organisation*, admin uniquement)

**Objectif** : donner à l'admin la vue du **plan du cabinet** et de la **consommation de l'organisation**, plus l'accès à la facturation. Un membre qui ouvre cette section est redirigé vers « Mon usage ».

Contenu (aligné sur le Figma `2628-32069`) :

- **Votre plan** : icône + « Plan {nom} ».
- **Jauge hebdomadaire** (carte) ; en essai, le bandeau devient **« Essai gratuit pour toute l'organisation … expire dans X j »**.
- **Inclus dans votre plan** : la liste des fonctionnalités.
- **Gérer mon abonnement** : liens Stripe (Mes factures, Changer de moyen de paiement) - affichés **uniquement quand l'org est sur un plan payant** (pas pendant l'essai).

**Différence avec « Mon usage »** : même type de contenu (plan + jauge + fonctionnalités) mais **cadré organisation** (essai « pour toute l'organisation », sous-titre « consommation de dossiers », accès facturation) et **réservé à l'admin**. Le détail *qui a quelle licence* vit dans **Collaborateurs**, pas ici - cette page n'affiche plus de tableau « abonnement du cabinet » par palier.

---

## 5. En tant qu'utilisateur, je peux…

- **Voir mon plan et ma consommation** de la semaine (jauge 0-100 %) depuis « Mon usage » ;
- **Demander une mise à niveau** quand mon quota est atteint : le bouton envoie une demande aux administrateurs. **Je ne peux pas augmenter mon plan moi-même** ;
- Modifier mes **informations de compte** (prénom, nom, e-mail) depuis « Général » ;
- *(Admin)* **inviter des collaborateurs** (un ou plusieurs e-mails) en choisissant leur **rôle** et leur **licence**, et voir l'impact tarifaire de la licence ;
- *(Admin)* suivre les **invitations en attente** (badge « Invité »), **renvoyer** ou **annuler** une invitation, ou marquer un invité comme actif ;
- *(Admin)* **changer le rôle** (Membre / Admin) et la **licence** d'un collaborateur depuis son panneau, avec l'**impact tarifaire** (+/- € / mois, nouveau total) affiché avant de confirmer ;
- *(Admin)* **renommer mon organisation** et consulter le **plan du cabinet**, sa **consommation** et la **facturation** (liens Stripe) depuis « Plan et facturation » ;
- *(Membre)* consulter **mon usage** sans voir la page « Organisation » ni la facturation du cabinet.

---

## 6. Bascules démo (toujours présentes)

- **Démo · vue** (sous-barre des Paramètres) : **Admin / Membre** - prévisualise les deux vues et le gating admin (Organisation, Plan et facturation).
- Sur « Mon usage » et « Plan et facturation » : pastilles **état de facturation** (actif / essai 5j / essai 1j / Ø licence) et **niveau de quota** (16 % / 63 % / 100 %) pour démontrer chaque état.
- Dans un panneau collaborateur en attente : **Marquer comme actif (démo)** simule l'acceptation de l'invitation.

---

## 7. Surfaces (proto)

- `renderSettingsUsage` - Mon usage.
- `renderSettingsUsers` + `renderInviteModal` + `renderMemberProfilePanel` + `renderPlanPickerModal` - Collaborateurs, invitation, panneau, sélecteur de licence.
- `renderSettingsBilling` - Plan et facturation.
- `renderWeeklyQuotaCard` - la carte de jauge partagée (option `org` pour le cadrage organisation).
- Modèle : `PRICING_PLANS`, `PLAN_FEATURES`, `quotaTone`, et l'état `workspaceMembers` (chaque membre porte `role`, `plan`, `pending`).

---

## 8. Hors-périmètre (proto)

- Pas de backend : les changements vivent en mémoire et sont réinitialisés au rechargement.
- Pas d'enforcement réel du quota, pas de paiement Stripe réel, pas de vérification d'e-mail.
- Le « plan de l'org » sur la page facturation utilise, dans la démo, le plan de l'admin courant comme substitut (pas d'objet organisation dédié).
