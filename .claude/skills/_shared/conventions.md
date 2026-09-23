# Conventions `ds-*` — référence

Ne pas lire en entier : chaque skill renvoie à la section utile. Une règle
partagée vit ici une seule fois. Les règles dures sont dans le fichier de
règles du repo (`paths.rules` du manifeste — ici `AGENTS.md`).

## §1 Manifeste

Les skills ne contiennent rien du projet. Tout se lit dans `ds.manifest.json`
(modèle : `ds.manifest.example.json`). Manifeste absent : défauts ci-dessous,
**et le signaler**. Fichier d'inventaire ou de règles introuvable : s'arrêter.

| Clé | Défaut |
|---|---|
| `ds.version`, `ds.versioning` | —, `lockstep` |
| `ds.role` | `consumer` (app) · `producer` (repo DS) |
| `owner` | rôle steward + contact |
| `packages` | absent = mono-package (§4) |
| `paths.rules` | `CLAUDE.md` |
| `paths.inventory` | `src/app/design-system/demos/index.ts` |
| `paths.docs` | `docs/design-system.md` (tokens, compositions, conventions) |
| `paths.docsComponents` | `docs/components/` |
| `paths.theme` | `ds-theme.json` |
| `paths.kitchenSink` | `/design-system` |
| `paths.protected` | `src/components/ui`, `src/app/globals.css`, `ds-theme.json`, `src/app/design-system/page.tsx` |
| `commands.pm` | détecté par lockfile — écrit `<pm>` dans les skills |
| `fonts` | token, famille, rôle, licence |
| `figma.mode` | `none` (§6) |

## §2 Écarts

| Fichier | Qui écrit | Durée | Contenu |
|---|---|---|---|
| `SIGNALEMENTS.md` (gitignoré) | l'agent | jusqu'au merge | ce qu'il n'a pas le droit de corriger |
| Issues `ds-gap` + `triage` | `ds-audit` | jusqu'à résolution | tout signalement qui doit survivre au merge |
| `ECARTS.md` (committé) | le steward seul | permanent | dettes assumées |

Avant le merge d'une branche avec `SIGNALEMENTS.md` non vide :
`node scripts/ds-audit.mjs --harvest --create-issues`. Un agent n'écrit jamais
dans `ECARTS.md` : il prépare un bloc que le steward committe.

## §3 Chemins protégés

`paths.protected` ne se modifie que sur `main`, par le steward. Ailleurs :
signaler. La CI (`protected-paths`) refuse le diff, sauf labels `ui-ok` (ajout
ou retrait délibéré d'un composant) et `page-tsx-ok`. `globals.css` ne change
qu'avec `ds-theme.json` dans le même commit. Les divergences voulues sur le
vanilla shadcn passent par la clé `css` de `ds-theme.json`.

## §4 Packages

```json
"packages": [
  { "name": "ui-product",   "path": "packages/ui-product",   "role": "source" },
  { "name": "ui-marketing", "path": "packages/ui-marketing", "role": "extension", "dependsOn": ["ui-product"] }
]
```

- Un package n'importe que son `dependsOn`. Le source n'importe jamais une extension.
- Un seul thème, dans le source. L'extension étend en `--mkt-*`, ne redéclare rien.
- Dans l'extension : chercher dans le source d'abord.
- Chaque package a son inventaire, ses fiches, sa section de kitchen-sink.
- Vérifié par `ds-check-boundaries` (délégué par `ds:doctor`).

`lockstep` : une version pour tout. `independent` : décision steward dans `ECARTS.md`.

Vers les apps : copie encadrée (`ds-setup`) tant que `ds.registry` est `null`.

**Coexistence** : deux implémentations d'un même composant ne survivent pas à
la PR qui introduit la nouvelle. Migration et suppression dans la même PR.

## §5 Outils

| Commande | Quand |
|---|---|
| `<pm> run ds:doctor` | après chaque `shadcn add`, avant de rendre la main, en CI. `--report` compte sans échouer. Sortie `fichier:ligne — règle — correctif` : la recopier telle quelle. |
| `<pm> run ds:visual` | voir les diffs visuels en local. Baselines : **jamais en local** (le rendu dépend de l'OS) — label `ds-baselines` sur la PR, la CI régénère. |
| `node scripts/ds-changelog.mjs --component <nom>` | historique d'un composant (15 j). En CI : commentaire de PR automatique. |
| `node scripts/ds-audit.mjs` | état du DS, issues. |

`ds:doctor` délègue : `check:tokens`, `check:duplicates`, `ds-check-docs`,
`ds-check-boundaries`. Il vérifie aussi couleurs Tailwind brutes, `next/*`
dans `src/components/`, piège `cn` du CLI shadcn.

`shadcn add` : sur `main` uniquement, puis `ds:doctor`.

## §6 Figma

| Mode | Doctrine | Skills Figma |
|---|---|---|
| `none` | code-first, le kitchen-sink est la seule référence | refusent |
| `intent` | la maquette est une intention datée ; **le code est la vérité** ; un écart est une question, pas un bug | tournent |
| `mirror` | non disponible | refusent |

Toujours un nœud précis (`?node-id=`), jamais un fichier entier. Une valeur
Figma hors échelle prend le token le plus proche ; l'écart se note, ne se
corrige pas. Charger `figma-design-to-code` avant `get_design_context` si
disponible. Playbook de démarrage : `docs/playbook-figma-bootstrap.md`.

## §7 Fiche composant

`docs/components/<nom>.md`, depuis `templates/component.md`. Sept champs,
vérifiés par `ds-check-docs` :

`name` · `package` · `status` (`draft` · `beta` · `stable` · `deprecated`) ·
`usage` (une ligne) · `source` · `demo` · `replacedBy` (si `deprecated`)

Tokens, dates et historique se **dérivent** du code et de git, ils ne s'écrivent
pas. Une fiche par entrée d'inventaire, et inversement. Corps : quand
l'utiliser, quand l'éviter, exemple.

Chaque démo porte `data-demo="<package>/<nom>"` (régression visuelle).

## §8 Règles pour agents

Une seule source de règles ; l'autre fichier y renvoie. Le sens dépend du
repo : ici `AGENTS.md` est la source (canonique, lu par tous les assistants)
et `CLAUDE.md` = `@AGENTS.md` + les seules spécificités Claude Code. En
monorepo, un fichier de règles de package précise sans répéter.

## §9 Shell, nav & barres (Plato) — composer, jamais re-rouler

Le chrome de navigation est canonique et invariant. On ne ré-invente JAMAIS un
rail, une barre de tête, un en-tête de page ou une barre de contexte inline. On
compose les composants existants (import depuis `src/components/ui/`) :

| Besoin | Composant - jamais inline |
|---|---|
| Rail de navigation gauche | `AppSidebar` (+ `SidebarBrand`, `SidebarGroup`, `NavItem`, `NavSectionHeader`, `SidebarUserInfo`) |
| Barre de tête fixe (breadcrumb + onglets de vue + outils) | `TopBar` |
| En-tête de page (titre serif + action + onglets) | `PageHeader` |
| Barre de contexte niveau 3 (poste / acte / JP) | `Niveau3Strip` |
| Contrôle « Menu » (nav masquée) | `NavExpandControl` |

Un nouvel onglet, une nouvelle page, une nouvelle destination = du nouveau
CONTENU passé à ces composants (un `NavItem` de plus, un `tab` de plus, un slot
`left`/`right`), jamais une nouvelle barre `h-12 border-b` ou un `border-r
flex-col` à la main. Si le besoin ne rentre dans aucun composant, c'est une
évolution du composant (fiche + `ds-decide`), pas un re-roll local. Vitrine
vivante : `/ui-kit/shell` ; comportement : `src/components/shell/NAV-BEHAVIOR.md`.
