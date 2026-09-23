---
name: ds-install
description: Installe le design system dans une app ou un repo qui n'a PAS encore de système de style à migrer — nouveau projet, app fraîchement scaffoldée, prototype vierge. À utiliser dès qu'un utilisateur dit "installe le design system dans ce projet", "ajoute le DS à mon app", "branche le DS sur ce repo", "set up the design system here", ou démarre un projet qui doit consommer le DS. Si le repo a déjà ses propres couleurs, composants ou CSS à remplacer, c'est ds-adopt, pas ds-install.
compatibility: Nécessite ds.manifest.json à la racine du projet et le script ds:doctor. La skill officielle shadcn/skills est recommandée si disponible — sinon la mécanique CLI est couverte par CLAUDE.md.
---

# ds-install — poser le DS dans une app

> **Conventions communes** — chemins, `ds.manifest.json`, `SIGNALEMENTS.md` / `ECARTS.md`, commandes (`<pm>`), `ds:doctor`, mode Figma : lire `_shared/conventions.md` avant d'agir. Si `shadcn/skills` est installée, elle porte la mécanique CLI ; sinon voir `CLAUDE.md` et le §7 des conventions.


## Résolution des chemins

Cette skill lit le DS de référence et écrit dans le projet cible. Chercher
`ds.manifest.json` à la racine du projet cible ; sinon, défauts : `rules` →
`CLAUDE.md`, `inventory` → `src/app/design-system/demos/index.ts`, `docs` →
`docs/design-system.md`, `docsComponents` → `docs/components/`, `theme` →
`ds-theme.json`, `kitchenSink` → `/design-system`.

Elle fonctionne dans les deux sens :

- **Depuis le repo DS** : l'utilisateur donne le chemin du projet cible → copier vers ce chemin.
- **Depuis le projet cible** : l'utilisateur donne le chemin (ou l'URL git) du repo DS → cloner/lire et copier depuis.

Si aucun chemin n'est fourni, demander lequel des deux cas s'applique avant de commencer.

## Avant de commencer — install ou adopt ?

```bash
grep -rnoE "#[0-9a-fA-F]{3,8}\b" src 2>/dev/null | wc -l
ls src/components 2>/dev/null
```
Des couleurs en dur par dizaines ou un dossier de composants maison → il y a
quelque chose à **migrer** : passer à `ds-adopt`. Repo vierge ou quasi → on
installe, c'est cette skill.

## Prérequis du projet cible

- **React 19 + Tailwind v4** en place. Si Tailwind absent ou en v3 : installer
  `tailwindcss@^4` + `@tailwindcss/postcss` et créer `postcss.config.mjs`
  (`plugins: { "@tailwindcss/postcss": {} }`). Tailwind v4 n'a pas de
  `tailwind.config` obligatoire — tout vit dans `globals.css`.
- **Alias `@/*` → `./src/*`** dans `tsconfig.json`. Le vérifier, ne pas le
  supposer : tous les imports du DS en dépendent. Deux pièges vérifiés :
  TypeScript ≥ 6 déprécie `baseUrl` — déclarer `paths` seul, en chemins
  relatifs (`"@/*": ["./src/*"]`) ; et sous Vite, `paths` ne suffit pas au
  bundler — ajouter aussi `resolve.alias` dans `vite.config.ts`
  (`{ "@": path.resolve(import.meta.dirname, "./src") }`).
- `globals.css` importé à la racine de l'app (layout Next, `main.tsx` Vite…).
- **Détecter le package manager** (lockfile) et l'utiliser partout — ne pas
  imposer pnpm.
- **Ne rien écraser en silence** : si le projet a déjà un `globals.css`, un
  `components.json` ou un `src/components/ui/`, lister le conflit et demander
  avant de remplacer.
- Framework : les composants sont portables (React + Tailwind + Radix pur, zéro
  import `next/*`) — Next, Vite, Remix… tout convient. Seul le kitchen-sink
  (`src/app/design-system/`) est spécifique Next/App Router. Hors Next, placer
  `globals.css` là où vit la feuille de style racine et ajuster le chemin dans
  `components.json` (`tailwind.css`).

## Étape 1 — Dépendances

```bash
pnpm add radix-ui lucide-react class-variance-authority \
  clsx tailwind-merge tw-animate-css sonner next-themes
pnpm add -D shadcn
```

`shadcn` en dev est **requis**, pas optionnel : `globals.css` importe
`shadcn/tailwind.css`, et le CLI sert à régénérer les composants vanilla.
`sonner` et `next-themes` ne servent qu'au toast — ce sont des paquets React
autonomes, pas du Next. Versions de référence : voir `package.json` du repo DS
(`radix-ui ^1.6`, `shadcn ^4.16`, `lucide-react ^1.30`,
`class-variance-authority ^0.7`).

## Étape 2 — Copier les fichiers

```
src/components/ui/         ← shadcn vanilla (ne jamais éditer)
src/components/custom/     ← composants du produit (cva + tokens)
src/lib/utils.ts           ← cn() (clsx + tailwind-merge)
src/hooks/use-mobile.ts    ← requis par la sidebar
src/app/globals.css        ← TOUS les tokens (source unique)
components.json            ← config du CLI shadcn
ds-theme.json              ← source de vérité du thème
docs/design-system.md      ← sémantique des tokens et contrats
docs/components/           ← une fiche .md par composant (+ index)
CLAUDE.md                  ← règles pour les agents
ds.manifest.example.json   ← à renommer en ds.manifest.json (ds.role: consumer)
scripts/                   ← garde-fous : ds-doctor.mjs (point d'entrée), check-tokens, check-duplicates
.claude/skills/            ← les skills DS + _shared/ + templates/ (elles voyagent avec le code)
src/app/design-system/     ← kitchen-sink (recommandé : c'est la doc vivante)
```

N'installer que les composants que l'app va utiliser n'a pas de sens ici :
`ui/` et `custom/` se copient en bloc, et `ds:doctor` ne pénalise pas les
composants non utilisés. En revanche, ne pas copier de composant absent du DS
source « en avance ».

## Étape 3 — Polices

La typescale est déjà encodée en tokens `--text-*` dans `globals.css` — rien à
faire. Les familles, elles, doivent être chargées par le projet cible :

| Token | Famille | Rôle |
|---|---|---|
| `--font-sans` | Inter | UI |
| `--font-heading-sm` | Inter Display | heading-sm |
| `--font-heading` | RL Para Trial Central | titres serif |
| `--font-mono` | Menlo | code (police système, rien à charger) |

Charger par le moyen de la stack cible (fichiers locaux + `@font-face`,
`next/font` dans `src/app/` uniquement — jamais dans `src/components/`). Les
tokens retombent sur des fallbacks corrects si une famille manque.

⚠️ **« RL Para Trial Central » est une fonte d'essai (Trial)** : signaler à
l'utilisateur que la licence doit être validée avant tout usage en production
(voir `ECARTS.md` du repo DS, section licences).

## Étape 4 — Vérifier

```bash
pnpm lint && node scripts/ds-doctor.mjs && pnpm build
```

Puis le **test de portabilité**, qui est le vrai critère : « si on colle
`src/components/` + `globals.css` dans un projet Vite, est-ce que ça compile ? »
Si non, un couplage s'est glissé — c'est un bug, pas une adaptation.

Enfin, rendre un composant de chaque famille et comparer avec le kitchen-sink
du DS source. Identique = installé. Différent = un token ou une classe a dévié
pendant la copie.

## Étape 5 — Le contrat et les garde-fous

C'est ce qui rend les autres skills opérantes dans cette app :

1. `CLAUDE.md` copié, adapté au nom du projet et aux chemins. Garder intactes
   la règle d'or, les tokens, la portabilité, la frontière RSC.
2. Scripts npm : `ds:doctor` (+ `check:tokens`, `check:duplicates`, `verify`).
3. CI : refuser tout PR qui touche `src/components/ui/` ou
   `src/app/design-system/page.tsx` à la main ; n'accepter un diff de
   `globals.css` que s'il accompagne `ds-theme.json`.
4. Skills : `.claude/skills/` copié avec le reste — les skills DS voyagent
   avec le code (aussi téléchargeables en ZIP sur `/design-system/skills` du
   kitchen-sink). Alternative centralisée si l'équipe héberge un jour le
   marketplace : `/plugin install ds-skills` en scope `project`.

## Après chaque `shadcn add` — vérification obligatoire

Piège connu du CLI, silencieux :

```bash
<pm> run ds:doctor   # détecte les imports `from "cn"` (→ réécrire vers @/lib/utils)
                     # et le paquet npm `cn` dans package.json (→ le retirer)
```

Le paquet `cn` casse la fusion des classes sans lever d'erreur : les conflits
Tailwind cessent d'être résolus et les overrides ne s'appliquent plus, sans
message.

## Livrable

Commit `chore(ds): install design system v[x]` et une note dans le README de
l'app :

```
## Design system
Source : [repo DS] — version [x] — mode : copie
Tokens : ds-theme.json → globals.css. Ne jamais éditer globals.css à la main.
Divergences voulues : clé `css` de ds-theme.json (survit aux régénérations).
Conventions : CLAUDE.md · docs/design-system.md · docs/components/
Kitchen-sink : /design-system
Mise à jour : re-copier depuis le DS source à la version [y]
```

La ligne « version » permet à `ds-promote` de savoir ce que l'app consomme et à
l'équipe de savoir quand mettre à jour.

## Cette skill est canonique

Une seule version de cette skill doit exister : celle de `.claude/skills/` du
repo DS, copiée telle quelle dans chaque projet cible. Deux skills
d'installation qui divergent, c'est précisément le doublon que le DS interdit
chez lui. Une correction se fait dans le repo DS, puis se propage aux projets
par re-copie (ou via le marketplace si l'équipe en héberge un).
