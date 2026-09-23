---
name: ds-figma-update
description: Met à jour le thème du DS depuis le Figma en trois temps — rapport de dérive (Variables Figma vs ds-theme.json), validation ligne à ligne par la propriétaire, application à ds-theme.json uniquement. À utiliser quand un utilisateur dit "update le DS depuis Figma", "le Figma a changé, répercute", "synchronise les tokens depuis la maquette", "le Figma a-t-il dérivé", "drift check", "est-ce que la maquette et le code sont encore synchro". Sans validation explicite dans la conversation, la skill s'arrête au rapport — c'est le régime C de docs/figma-reference.md, jamais une correction automatique. Le code reste la source de vérité : une dérive Figma n'est pas un bug du code. Pour une première extraction de thème (DS qui n'existe pas encore), ce n'est pas cette skill.
compatibility: Nécessite ds.manifest.json à la racine du projet et le script ds:doctor. La skill officielle shadcn/skills est recommandée si disponible — sinon la mécanique CLI est couverte par CLAUDE.md.
---

# ds-figma-update — répercuter le Figma, sous validation

> **Conventions communes** — chemins, `ds.manifest.json`, `SIGNALEMENTS.md` / `ECARTS.md`, commandes (`<pm>`), `ds:doctor`, mode Figma : lire `_shared/conventions.md` avant d'agir. Si `shadcn/skills` est installée, elle porte la mécanique CLI ; sinon voir `CLAUDE.md` et le §7 des conventions.


Trois temps : **rapport → validation → application**. Le deuxième est un
point d'arrêt dur. Sans validation, cette skill est un pur rapport de dérive
(régime C de `docs/figma-reference.md`, à la demande) ; avec validation,
c'est la réconciliation en deux temps de la phase tokens, appliquée à
`ds-theme.json`. Décider qui a raison reste le travail de la propriétaire —
et la doctrine donne la réponse par défaut : **le code**.

## Pré-conditions

- `ds-theme.json` existe et est appliqué. Sinon, il n'y a rien à mettre à
  jour : c'est un bootstrap, pas un update.
- Un nœud de référence des tokens dans le Figma — celui du dernier relevé,
  noté en tête de `docs/figma-theme-releve.md`. En son absence, le rapport
  le dit et se limite à ce que `get_variable_defs` expose sur les frames
  principales.
- Si les skills officielles Figma sont installées : charger
  `figma-design-to-code` avant tout `get_design_context`.
- **Qui déclenche** : la propriétaire du DS. Un agent qui tourne en
  autonomie (CI, workspace parallèle) livre le temps 1 et s'arrête — la
  validation du temps 2 doit venir d'un humain, dans la conversation.

## Temps 1 — le rapport de dérive

Relever léger : `get_variable_defs` sur le nœud de référence, plus
`get_design_context` sur les seules sections où le relevé précédent signale
des anomalies (cellules périmées, contrastes suspects). Pas de relevé
complet — on compare, on ne re-documente pas. Rappel d'arbitrage : **la
Variable résolue fait foi** sur le texte affiché d'une cellule.

Pour chaque token de `ds-theme.json` qui a une correspondance Figma :

| Token | Code (`ds-theme.json`) | Figma (résolu) | Écart | Lecture probable | Recommandation |
|---|---|---|---|---|---|

Les lectures possibles, à choisir avec prudence :

- **Identique** → RAS.
- **Le Figma a bougé après l'extraction** → dérive Figma, le cas le plus
  fréquent. Ce n'est pas un bug du code.
- **Le code a bougé** (le `git log` de `ds-theme.json` fait foi) →
  évolution actée côté DS.
- **Jamais réconcilié** → renvoyer aux décisions « en attente » du relevé,
  ne pas compter comme dérive.

Compter séparément : les tokens Figma **sans équivalent code** (nouveautés
côté design, candidates à une décision) et les tokens code **sans
équivalent Figma** — ce dernier cas est normal, le code déborde la
maquette ; ne pas le présenter comme un problème.

Recommandation par ligne, parmi quatre : **appliquer** au thème /
**documenter** comme divergence assumée / **resynchroniser le Figma** (geste
côté design) / **ignorer** (non réconcilié, bruit).

## Temps 2 — validation : point d'arrêt dur

Présenter la table et attendre. Trois issues :

- **Pas de validation** → la sortie est le rapport, rien d'autre. Si
  l'utilisateur veut une trace : `docs/figma-drift-[date].md`.
- **Validation partielle** → seules les lignes approuvées passent au
  temps 3, les autres restent au rapport.
- **Validation complète** → temps 3 sur tout.

« Applique ce qui te semble bien » n'est pas une validation : reproposer la
table avec une recommandation par ligne et demander un oui/non par ligne ou
par famille.

## Temps 3 — appliquer, uniquement ce qui est validé

1. Éditer **`ds-theme.json` seulement** — jamais `globals.css` directement,
   le CLI shadcn réapplique. Familles sémantiques et alias shadcn selon les
   conventions de nommage de `CLAUDE.md`.
2. Vérifier : `pnpm lint && pnpm ds:doctor && pnpm build`, puis le rendu
   sur `/design-system` — un token modifié se voit dans le kitchen-sink.
3. Mettre à jour les **références Figma datées** des fiches
   `docs/components/` touchées : nouvelle date, statut « conforme » ou
   « divergent » selon le sort de chaque ligne.
4. Pour les lignes **refusées mais réelles** : préparer l'entrée prête à
   coller pour la table « Divergences Figma non corrigées » d'`ECARTS.md` —
   c'est la propriétaire qui la committe, un agent n'écrit jamais dans
   `ECARTS.md`.
5. Si l'ampleur des changements le justifie (nouvelle famille, dark refait),
   recommander un re-relevé versionné complet plutôt que des retouches — le
   relevé (`docs/figma-theme-releve.md`) doit rester une photographie
   cohérente, pas un patchwork.

## Interdits

- Appliquer quoi que ce soit sans validation explicite dans la conversation.
- Toucher `globals.css`, `src/components/ui/` ou le Figma.
- Écrire dans `ECARTS.md` — réservé à la propriétaire ; un blocage passe par
  `SIGNALEMENTS.md`.
- Conclure « le Figma a raison » par défaut : la dérive n'est pas une erreur
  tant que personne ne l'a tranchée.
