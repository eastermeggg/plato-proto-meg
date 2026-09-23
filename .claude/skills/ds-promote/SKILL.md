---
name: ds-promote
description: Fait remonter dans le design system ce qu'une feature ou une app a introduit en dehors de lui — composants locaux, variants improvisés, compositions non documentées, tokens manquants, ajustements récurrents. À utiliser dès qu'un utilisateur dit "remonte ça dans le DS", "promeus ce composant", "il faudrait que le DS ait…", "intègre ces nouveautés au design system", "on l'a fait trois fois, il faut le mettre dans le DS", ou en sortie de ds-build (section Nouveautés) et de ds-review (section À remonter au DS). Décide item par item : promouvoir, garder local, supprimer — et fait le travail dans le repo DS, jamais dans l'app.
compatibility: Nécessite ds.manifest.json à la racine du projet et le script ds:doctor. La skill officielle shadcn/skills est recommandée si disponible — sinon la mécanique CLI est couverte par CLAUDE.md.
---

# ds-promote — ce que l'app a inventé, le DS l'absorbe ou le refuse

> **Conventions communes** — chemins, `ds.manifest.json`, `SIGNALEMENTS.md` / `ECARTS.md`, commandes (`<pm>`), `ds:doctor`, mode Figma : lire `_shared/conventions.md` avant d'agir. Si `shadcn/skills` est installée, elle porte la mécanique CLI ; sinon voir `CLAUDE.md` et le §7 des conventions.

Une feature qui a dû sortir du DS révèle soit un manque du système, soit un
écart injustifié. Dans les deux cas, laisser l'écart dans l'app est la pire
issue : il sera copié. Cette skill tranche, puis exécute.


## Entrée

Une liste de nouveautés. Elle vient typiquement de :
- la section **Nouveautés introduites** d'un relevé `ds-build` ;
- la section **À remonter au DS** d'un rapport `ds-review` ;
- un constat direct : « ce pattern existe dans trois écrans ».

Sans liste, en construire une : `grep` des composants définis hors de
`components/`, des `className` d'ajustement sur des composants DS, des valeurs
arbitraires en dérogation, des recettes répétées.

## Étape 1 — Trancher, item par item

Trois issues possibles, et un critère chacune :

| Issue | Critère | Exemple |
|---|---|---|
| **Promouvoir** | Utilisé ou prévu à ≥ 2 endroits, ou porte une règle métier centrale, ou corrige un manque du DS | un `Badge.warning` improvisé dans deux écrans |
| **Garder local** | Vraiment spécifique à cet écran, un seul usage, pas de règle métier | une mise en page de rapport unique |
| **Supprimer** | Doublon d'un existant, ou contournement d'un token/variant qui existe | un `PrimaryCard` qui est une `Card` avec une bordure |

Pour chaque item promu, préciser **la forme** qu'il prend dans le DS :
- **Token** → `ds-theme.json` (jamais `globals.css` directement)
- **Divergence de thème** → clé `css` de `ds-theme.json` : c'est la forme
préférée pour tout ce qui s'exprime en CSS, elle survit aux régénérations
- **Variant** → via la procédure `ds-variant` (clé `css` du thème, cva dans
`custom/`, ou `SIGNALEMENTS.md` → bloc délimité appliqué par le steward sur `main` si `ui/`)
- **Composition** → `docs/design-system.md` → Compositions canoniques
- **Composant custom** → `components/custom/` avec son contrat, après `ds-decide`
- **Convention** (icône, densité, état) → `docs/design-system.md` → Conventions

Un item peut demander deux formes : un composant **et** le token qu'il exige. Le
token passe en premier.

## Étape 2 — Exécuter dans le repo DS, sur main

Le travail se fait **dans le repo du DS**, pas dans l'app. Promouvoir en copiant
le fichier de l'app dans `custom/` n'est pas une promotion, c'est un
déménagement : le composant garde ses classes d'ajustement et ses raccourcis.

Pour chaque item promu, dans l'ordre :
1. Tokens d'abord (`ds-theme.json` → régénération → vérification).
2. Composant ou variant, construit selon les règles du DS (cva, tokens, états,
portabilité), avec : sa démo dans `demos/`, son entrée dans `demos/index.ts`,
son contrat dans `docs/design-system.md` et **sa fiche dans
`docs/components/`** (+ index). Un item promu sans fiche n'est pas promu :
il est juste déplacé.
3. `<pm> run ds:doctor && <pm> run build`.
4. Incrémenter la version du DS (`ds.version` du manifeste) et mettre à jour
`HANDOFF.md`/changelog. Commit `feat(ds): promote [item] from [app]`.
5. Si `figma.mode` est `intent` et qu'un nœud Figma correspond à l'item promu :
préparer le bloc d'écart, prêt à coller dans `ECARTS.md` (la steward committe).

## Étape 3 — Nettoyer l'app

Une fois le DS publié à la nouvelle version :
1. Dans l'app, répercuter la nouvelle version du DS — copie encadrée depuis le
repo DS, le registry n'étant pas encore publié (§6 des conventions).
2. Remplacer les usages locaux par le composant DS.
3. **Supprimer** la version locale. Vérifier par `grep` qu'aucun import ne reste.

Deux implémentations qui coexistent « le temps de la transition » deviennent
permanentes. La transition, c'est cette PR.

Les items **supprimés** suivent le même chemin sans l'étape DS : remplacer par
l'existant, effacer le doublon.

Un écart avec une maquette Figma n'est **pas** en soi un item à promouvoir :
c'est une question. Soit le DS a un manque réel (alors l'item suit le parcours
normal), soit la maquette a dérivé (alors l'écart va dans `ECARTS.md`, section
« Divergences Figma non corrigées », et le code reste tel quel).

Les items **gardés locaux** sont documentés dans l'app (commentaire d'en-tête :
pourquoi local, pourquoi pas DS) pour qu'un prochain `ds-review` ne les
signale pas à nouveau.

## Livrable — le journal de promotion

Remplir `templates/promotion.md` (le set de skills le fournit ; ne pas le réécrire de mémoire).

Ce journal va dans le `HANDOFF.md` ou le changelog du DS : c'est l'historique
de ce que le produit a appris au système.
