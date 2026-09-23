# Conventions communes du set `ds-*`

Ce fichier est lu par toutes les skills. Il existe une fois. Une correction se
fait ici, jamais dans une skill — le set applique à lui-même la règle qu'il
impose au DS : pas de doublon.

## 1. Les skills sont génériques, le projet est décrit par `ds.manifest.json`

Les skills ne contiennent rien du DS ; elles le lisent dans le projet courant
via `ds.manifest.json` à la racine (modèle : `ds.manifest.example.json`). S'il
manque, appliquer les défauts ci-dessous **et le signaler** : un projet sans
manifeste n'a pas choisi son mode Figma ni son steward.

| Clé | Rôle | Défaut |
|---|---|---|
| `ds.name` | nom du DS consommé ou produit | — |
| `ds.version` | version consommée (app) ou publiée (repo DS) | — |
| `ds.registry` | namespace + URL registry shadcn — `null` tant que le DS n'est pas publié (installation par copie) | `null` |
| `ds.repo` | repo du DS de référence | — |
| `ds.role` | `producer` (repo DS) ou `consumer` (app) | `consumer` |
| `owner` | rôle steward + contact ; jamais un prénom seul | — |
| `paths.rules` | règles pour agents | `CLAUDE.md` |
| `paths.inventory` | index des démos = inventaire des composants légitimes | `src/app/design-system/demos/index.ts` |
| `paths.docs` | sémantique des tokens, compositions canoniques, contrats | `docs/design-system.md` |
| `paths.docsComponents` | une fiche .md par composant (+ index) | `docs/components/` |
| `paths.theme` | source de vérité du thème | `ds-theme.json` |
| `paths.kitchenSink` | route de la doc vivante | `/design-system` |
| `paths.protected` | fichiers modifiables uniquement sur `main` par la steward | `src/components/ui`, `src/app/globals.css`, `ds-theme.json`, `src/app/design-system/page.tsx` |
| `paths.doctorExclude` | chemins exemptés des checks de style de `ds:doctor` | `src/components/ui` |
| `commands.pm` | package manager (détecté par lockfile) | — |
| `commands.doctor` / `lint` / `build` | commandes de vérification | `<pm> run ds:doctor` / `lint` / `build` |
| `figma.mode` | `none` · `intent` · `mirror` (§5) | `none` |
| `figma.file` / `figma.libraryPage` | fichier et page de la librairie (mode mirror) | — |

Dans les skills, `<pm>` désigne `commands.pm` (`pnpm`, `npm`, `bun`, `yarn`).
Ne pas imposer un gestionnaire : le lockfile décide.

Si un fichier d'inventaire ou de règles manque et qu'aucun manifeste ne le
relocalise : **s'arrêter et le signaler**. Une skill qui tourne sans inventaire
produit des décisions sur un système inexistant.

## 2. Les deux fichiers d'écart — ne pas les confondre

| Fichier | Statut git | Durée de vie | Qui écrit | Contenu |
|---|---|---|---|---|
| `SIGNALEMENTS.md` | gitignoré, local au workspace | jeté au merge | l'agent | ce qu'il n'a pas le droit de corriger : token manquant, composant absent, besoin de toucher un fichier protégé, variant `ui/` à appliquer |
| `ECARTS.md` | committé, racine du DS | survit au handoff | la steward, seulement | dettes assumées : licence de fonte non validée, divergence Figma non corrigée, décision reportée, changement de `figma.mode` |

Un agent n'écrit **jamais** dans `ECARTS.md`. Quand une skill dit « préparer
l'entrée pour ECARTS », c'est un bloc prêt à coller que la steward committe.
Templates : `templates/` à la racine du repo.

## 3. Chemins protégés et `main`

`paths.protected` ne se modifie que sur `main`, par la steward. Dans un
workspace ou une branche : signaler, ne pas éditer. La CI (`.github/workflows/ci.yml`,
job `protected-paths`) refuse tout diff sur ces chemins dans une PR, avec deux
dérogations humaines par label : `ui-ok` (ajout/retrait délibéré d'un composant
du set — jamais une retouche de style) et `page-tsx-ok` (évolution délibérée de
la coquille du kitchen-sink). Un diff de `globals.css` n'est accepté que s'il
accompagne `ds-theme.json` dans le même commit — le CLI shadcn régénère
`globals.css` depuis le thème ; l'éditer seul est perdu à la régénération.

Les divergences voulues sur le vanilla shadcn passent par la clé `css` de
`ds-theme.json` : elles survivent à toute régénération.

## 4. `ds:doctor` — un seul point d'entrée, pas six greps

`scripts/ds-doctor.mjs` (zéro dépendance) est la commande unique des skills.
Il **délègue** aux garde-fous historiques (`check:tokens` pour les valeurs
arbitraires, `check:duplicates` pour les doublons de rôle — la logique vit
là-bas, elle n'est pas dupliquée) et ajoute :

- couleurs Tailwind brutes (`bg-gray-100`) à la place des tokens sémantiques
- imports `next/*` dans `src/components/` (portabilité)
- piège `cn` du CLI shadcn : paquet npm `cn` et imports `from "cn"` (casse la
  fusion de classes **sans erreur**)
- validation de `ds.manifest.json`
- avec `--base <ref>` (opt-in, usage local) : chemins protégés modifiés,
  `globals.css` sans `ds-theme.json` — en CI, c'est le job `protected-paths`
  qui fait foi, avec ses labels de dérogation

`--report` compte sans échouer (mode adoption). Sans flag, exit 1 au premier
constat. Chaque constat sort en `fichier:ligne — règle — correctif` : le
recopier tel quel dans les rapports. `--json` pour la sortie machine.

À lancer : après chaque `shadcn add`, avant de rendre la main dans `ds-build`,
en étape 1 de `ds-review`, en CI.

## 5. Mode Figma

| Mode | Doctrine | Skills actives |
|---|---|---|
| `none` | Code-first sans Figma. Le kitchen-sink est la seule référence visuelle. | core + install/adopt/explore. Toute skill `ds-figma-*` refuse. |
| `intent` | Le Figma est une maquette d'intention, jamais arbitre. Le code est la vérité ; un écart maquette/rendu est une question pour la steward, pas un bug. Doctrine complète : `docs/figma-reference.md`. | core + `ds-figma-screen`, `ds-figma-component`, `ds-figma-releve`, `ds-figma-update` (dérive, validation requise), `ds-figma-bootstrap`. |
| `mirror` | Le Figma serait **généré depuis le code** à chaque version. **Pas disponible dans ce set** — le mode est à l'étude dans le set v2 expérimental ; y passer serait une décision steward consignée dans `ECARTS.md`. | — |

**Ce repo est en mode `intent`.** La dérive Figma → code se traite par
`ds-figma-update` : rapport de dérive, validation ligne à ligne par la steward,
application à `ds-theme.json` uniquement (régime C de `docs/figma-reference.md`).

## 6. Distribution : par copie, en attendant le registry

Le DS n'est pas encore publié sur un registry shadcn (`ds.registry: null`).
Les apps l'installent par **copie encadrée** via `ds-install` (composants +
`globals.css` + docs), migrent via `ds-adopt`, et remontent leurs nouveautés
via `ds-promote` — le travail de promotion se fait dans le repo DS, jamais
dans l'app. Le modèle registry + preset (`shadcn build`, items namespacés,
`ds-upgrade`) est en évaluation dans le set v2 ; le jour où il est adopté,
`ds.registry` se renseigne et `ds-install` bascule.

Deux implémentations d'un même composant qui coexistent « le temps de la
transition » deviennent permanentes : la transition, c'est la PR.

## 7. La mécanique shadcn

Si la skill officielle `shadcn/skills` est installée, elle porte la mécanique
CLI et registry (quand invoquer `add`, quels flags, structure d'un registry) —
avec un point où `ds-*` prime : elle encourage l'édition locale des composants
installés ; ici `ui/` est protégé (§3). Sans elle, la mécanique tient en deux
règles de `CLAUDE.md` : `npx shadcn@latest add <nom>` **sur `main` uniquement**,
puis la vérification anti-piège `cn` (couverte par `ds:doctor`).

## 8. Templates

Les blocs livrables sont dans `.claude/skills/templates/` : `decision.md`
(ds-decide), `composition.md` (ds-build), `variant.md` (ds-variant),
`review.md` (ds-review), `promotion.md` (ds-promote), `adoption-plan.md`
(ds-adopt). Les remplir, pas les réinventer. Les templates de `SIGNALEMENTS.md`
et `ECARTS.md` restent dans `templates/` à la racine du repo.
