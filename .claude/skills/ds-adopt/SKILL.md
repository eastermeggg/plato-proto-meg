---
name: ds-adopt
description: Apprend le design system à une codebase existante — migre une app, un prototype ou un repo vers les tokens, composants et conventions du DS, sans tout réécrire. À utiliser dès qu'un utilisateur dit "brancher le DS sur…", "migrer vers le design system", "aligner cette codebase", "adopter le DS", "apply our design system to this repo", "onboarder ce projet", ou pointe un repo/dossier qui n'utilise pas encore le DS. Produit un plan de migration par ordre de levier et l'exécute par lots vérifiables. Ici on transforme, on n'audite pas.
compatibility: Nécessite ds.manifest.json à la racine du projet et le script ds:doctor. La skill officielle shadcn/skills est recommandée si disponible — sinon la mécanique CLI est couverte par CLAUDE.md.
---

# ds-adopt — apprendre le DS à une codebase

> **Conventions communes** — chemins, `ds.manifest.json`, `SIGNALEMENTS.md` / `ECARTS.md`, commandes (`<pm>`), `ds:doctor`, mode Figma : lire `_shared/conventions.md` avant d'agir. Si `shadcn/skills` est installée, elle porte la mécanique CLI ; sinon voir `CLAUDE.md` et le §7 des conventions.

Le cas courant : une app ou un prototype existe déjà, avec ses couleurs en dur,
ses boutons maison et son propre CSS. L'objectif n'est **jamais** de réécrire :
c'est de faire converger, par lots, en gardant l'app fonctionnelle à chaque
étape.


## Install ou adopt ?

Cette skill est pour une codebase qui a **déjà** un système de style à
remplacer : couleurs en dur, composants maison, CSS propre. Un repo vierge ou
fraîchement scaffoldé n'a rien à migrer : c'est `ds-install`, beaucoup plus
court. Le test est dans `ds-install` ; en cas de doute, le faire d'abord.

## Prérequis

Le DS de référence est le repo du DS déclaré dans `ds.manifest.json` (`ds.repo`). En
avoir sous la main : `ds-theme.json`, `src/components/`, `CLAUDE.md`,
`docs/design-system.md`. S'ils ne sont pas accessibles, s'arrêter — on ne
migre pas vers un système qu'on ne peut pas lire.

## Étape 0 — Cartographier sans rien toucher

Produire `docs/ds-adoption-plan.md` avant tout changement. Quatre inventaires :

**1. Couleurs et valeurs en dur.**
```bash
grep -rnoE "#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(" src | sort | uniq -c | sort -rn
grep -rnoE "\b(bg|text|border)-(gray|slate|zinc|neutral|stone|red|green|blue|amber)-[0-9]+" src | sort | uniq -c | sort -rn
```
Chaque valeur → nombre d'occurrences → token sémantique cible proposé.

**2. Composants maison.** Lister tout ce qui ressemble à un composant d'UI
(`Button`, `Card`, `Modal`, `Input`…) avec fichier, nombre d'usages, et
verdict : équivalent DS direct / équivalent + variant / composition / vraiment
spécifique / à supprimer.

**3. Stack.** Tailwind (version), shadcn déjà présent ou non, framework, gestion
des styles (CSS modules, styled-components, inline…). Le chemin de migration
dépend entièrement de ça.

**4. Dépendances redondantes.** Deux librairies d'icônes, deux systèmes de
composants, deux façons de styler : chaque doublon est un lot de migration.

Le plan classe les lots **par levier décroissant** : ce qui débloque le plus
avec le moins de risque en premier.

## Étape 1 — Poser la fondation (un seul lot, sans toucher aux écrans)

Dans l'ordre, et rien d'autre dans ce lot :

1. Tailwind v4 si ce n'est pas le cas (`@tailwindcss/upgrade` puis vérification).
2. Installer le thème depuis l'artefact du repo DS :
`npx shadcn@latest init ./ds-theme.json` — les tokens arrivent
dans `globals.css` via `ds-theme.json` (pas de registry publié : voir `ds-install`). Si un `globals.css` existe, fusionner :
les anciennes variables deviennent des alias vers les tokens DS, pas des
concurrentes. Détail de la mécanique : `ds-install`, étapes 1 à 3.
3. `ds.manifest.json`, `CLAUDE.md` du DS adapté (nom du projet, chemins), skills
`ds-*` dans `.claude/skills/`, `scripts/ds-doctor.mjs` + script npm `ds:doctor`.
4. Lancer `<pm> run ds:doctor --report` — il va échouer partout, c'est normal :
c'est l'inventaire de ce qu'il reste à migrer. Ne pas le rendre bloquant en CI
avant la fin.
5. Ajouter la page `/design-system` (kitchen-sink) pour voir le thème rendu.

Commit : `chore(ds): fondation — tokens, conventions, garde-fou en mode rapport`.

À ce stade, l'app n'a pas changé d'apparence. C'est voulu.

## Étape 2 — Migrer les tokens (par lots de fichiers)

Remplacer les valeurs en dur par les tokens, en commençant par les plus
fréquentes (elles couvrent le plus d'écrans pour le moins de décisions).

Règles :
- Une couleur en dur qui n'a pas de token sémantique évident est une **décision**,
pas un remplacement mécanique : la remonter dans le plan, ne pas inventer un
token.
- Une valeur proche d'un token existant (`#6B7280` ≈ `muted-foreground`) devient
ce token. La différence de teinte disparaît, et c'est le but.
- `ds:doctor --report` sert de compteur : à chaque lot, le nombre de violations baisse.
Le noter dans le plan.

Commits par lot : `refactor(ds): tokens — [dossier ou domaine]`.

## Étape 3 — Remplacer les composants maison

Pour chaque composant de l'inventaire, dans l'ordre du plan :

1. Passer par `ds-decide` : équivalent direct, variant, composition ou custom
légitime. Le résultat est le bloc de décision, collé dans le plan.
2. Installer l'équivalent shadcn si absent (`npx shadcn@latest add …`).
3. Migrer les usages **un fichier à la fois**, en gardant l'ancien composant
jusqu'au dernier usage. Deux composants coexistent temporairement — c'est
acceptable ; ce qui ne l'est pas, c'est d'oublier de supprimer l'ancien.
4. Supprimer l'ancien composant, son fichier, ses styles. Vérifier qu'aucun
import ne subsiste (`grep`).

Un composant maison « vraiment spécifique » (palier 4 de `ds-decide`) rejoint
`components/custom/` avec son contrat documenté — il n'est pas une exception au
DS, il en devient une partie.

## Étape 4 — Rendre les garde-fous bloquants

Quand `ds:doctor` passe à zéro violation (ou que toutes les restantes sont
des dérogations documentées) :
- le rendre bloquant en CI ;
- ajouter le job `protected-paths` ;
- supprimer les dépendances redondantes devenues inutiles ;
- joindre au plan l'état final de `ds:doctor` (zéro violation ou dérogations documentées).

## Ce que cette skill refuse de faire

- Tout migrer en un seul commit. La migration par lots est ce qui permet de
revenir en arrière et de garder l'app livrable entre deux lots.
- Créer des tokens « de transition » pour absorber des couleurs orphelines. Une
couleur qui ne mappe sur rien est une décision produit, pas un token.
- Garder un composant maison « au cas où ». Un composant sans usage est de la
dette, et il finira réutilisé par erreur.
- Rendre le garde-fou bloquant avant la fin : bloquer une CI sur 300 violations
héritées pousse l'équipe à désactiver le garde-fou, ce qui est pire que ne pas
l'avoir.

## Livrable

`docs/ds-adoption-plan.md`, maintenu à chaque lot :

Remplir `templates/adoption-plan.md` (le set de skills le fournit ; ne pas le réécrire de mémoire).
