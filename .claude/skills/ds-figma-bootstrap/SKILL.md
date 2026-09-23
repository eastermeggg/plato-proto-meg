---
name: ds-figma-bootstrap
description: Crée un design system complet en code depuis un fichier Figma — scaffold, tokens (ds-theme.json), garde-fous agentic, tri des composants écran par écran, démos, fiches et handoff. À utiliser quand un utilisateur dit "crée un design system depuis ce Figma", "bootstrap le DS depuis la maquette", "build a design system from this Figma file", "pars du Figma pour monter le système". Orchestrateur en phases : ds-figma-releve → réconciliation validée → scaffold → règles → tri a/b/c → ds-figma-component pour les rares customs. Jamais en un seul prompt "recrée le DS depuis le Figma" — chaque phase produit un artefact validé par un humain avant la suivante. Si un DS existe déjà et qu'il faut l'installer ou le migrer ailleurs, c'est ds-install ou ds-adopt.
compatibility: Nécessite ds.manifest.json à la racine du projet et le script ds:doctor. La skill officielle shadcn/skills est recommandée si disponible — sinon la mécanique CLI est couverte par CLAUDE.md.
---

# ds-figma-bootstrap — d'un Figma à un DS agentic

> **Conventions communes** — chemins, `ds.manifest.json`, `SIGNALEMENTS.md` / `ECARTS.md`, commandes (`<pm>`), `ds:doctor`, mode Figma : lire `_shared/conventions.md` avant d'agir. Si `shadcn/skills` est installée, elle porte la mécanique CLI ; sinon voir `CLAUDE.md` et le §7 des conventions.

Le point non négociable : on ne « recrée » jamais un design system depuis un
Figma en un prompt. Un agent en autonomie encoderait le désordre de la
maquette — 40 tokens au lieu de 35 aliasés, des customs pour des composants
qui existent. Chaque phase produit un artefact, chaque artefact est validé
avant la suivante.

Dans le repo DS de référence, le détail vit dans
`docs/playbook-design-system-agentic.md` — le lire s'il existe. Cette skill
en est la version exécutable et autoportante.

## Mode Figma — vérifier avant tout

Lire `figma.mode` dans `ds.manifest.json` :

| Mode | Cette skill |
|---|---|
| `none` | **Refuse de tourner.** Répondre : le projet est code-first sans Figma ; la demande passe par `ds-explore` / `ds-build`. |
| `intent` | Tourne normalement : le Figma est une intention datée, le code reste la vérité. |
| `mirror` | Cette skill sert au démarrage (le mode est encore `intent`). Une fois le DS livré, la steward choisit le mode cible dans le manifeste — `mirror` n'est pas disponible dans ce set (à l'étude, set v2). |

## Les trois principes verrouillés

- **shadcn/ui est la source des composants.** Le Figma est la source du
thème et des rares customs, rien d'autre.
- **Le code est la source de vérité dès le jour 1.** Le Figma devient une
référence d'intention (régime recommandé : références de nœuds datées dans
les fiches — `docs/figma-reference.md`).
- **Tout est versionné et transmissible** : zéro dépendance à
l'environnement local, le thème est un artefact (`ds-theme.json`), pas un
geste manuel.

## Phase 0 — décisions (humain, pas d'agent)

- **Stack** : défaut Next.js 15 App Router + React 19 + Tailwind v4 +
shadcn/ui + lucide-react ; package manager libre, déclaré dans le manifeste. Si un repo produit existe, sa stack
écrase tout — récupérer `package.json` et `globals.css` avant de décider.
- **Structure** : repo séparé = implémentation de référence portable
(composants React + Tailwind + Radix pur, zéro `next/*` dans
`components/`).
- **Audit express du Figma** : Variables ou valeurs en dur ? Ça détermine la
méthode de relevé (étape 0 de `ds-figma-releve`). Ne pas nettoyer le Figma.

## Phase 1 — scaffold

```bash
<pm> create next-app@latest [nom] --typescript --tailwind --eslint --app --src-dir
```

- `ds-theme.json` à la racine (type `registry:style`, schema
`ui.shadcn.com/schema/registry-item.json`) : le thème entre dans le
système **une fois**, comme artefact. Puis `npx shadcn@latest init ./ds-theme.json`.
La publication sur un registry shadcn est à l'étude (set v2) ; en attendant,
les apps installent par copie encadrée (`ds-install`).
- Arborescence : `src/components/ui/` (vanilla, jamais édité),
`src/components/custom/`, `src/app/design-system/{page.tsx,demos/}`,
`docs/`. La page kitchen-sink importe `demos/index.ts` et ne contient
aucune démo — c'est l'anti-conflit clé de la phase 4.
- Vérifier `<pm> build` et `<pm> dev`. Commit + tag `v0-scaffold`.

## Phase 2 — tokens

1. `ds-figma-releve` → `docs/figma-theme-releve.md`.
2. **Réconciliation en deux temps** — le cœur de la phase :
- **ÉTAPE 1, analyse seulement** (aucun fichier modifié) : table
`token Figma | variable shadcn | valeur actuelle | valeur Figma | écart |
recommandation (aliaser / créer custom / ignorer)`. Signaler les valeurs
qui *ressemblent* à un token existant mais diffèrent légèrement : ce
sont des approximations du Figma, pas des tokens à créer. **Attendre la
validation humaine.**
- **ÉTAPE 2, après validation** : appliquer à `ds-theme.json` (jamais
`globals.css` directement — le CLI shadcn réapplique), et documenter
chaque token custom dans `docs/design-system.md` : nom à préfixe de
famille sémantique, à quoi il sert, à quoi il ne sert **pas**.

Commit + tag `v0-tokens`.

## Phase 3 — couche agentic, AVANT les composants

Les règles doivent exister avant que le volume de code arrive :

1. `CLAUDE.md` : règle d'or, tokens, portabilité, frontière RSC, les deux
fichiers d'écart (`SIGNALEMENTS.md` gitignoré pour les agents /
`ECARTS.md` committé pour le steward) + templates.
2. Garde-fou **mécanique** anti valeurs arbitraires (script `ds:doctor`
ou règle ESLint), **testé** : écrire un composant volontairement fautif
(`bg-[#ff0000]`, `p-[13px]`), vérifier que ça casse, supprimer le
fichier. Un garde-fou non testé est un garde-fou absent.
3. Copier les skills `ds-*` dans `.claude/skills/` — elles voyagent avec le
repo.

Commit + tag `v0-agentic-layer`. **La parallélisation n'est sûre qu'après le
merge de cette phase.**

## Phase 4 — composants : la boucle de tri

1. **Inventaire écran par écran** du Figma, verdict par élément — l'humain
arbitre, jamais de prompt global :

| Verdict | Part typique | Action |
|---|---|---|
| (a) shadcn thémé | ~80 % | `shadcn add`, vérifier le rendu aux tokens |
| (b) shadcn + variant | ~15 % | `shadcn add` + variant cva (`ds-variant`) |
| (c) vrai custom | ~5 % | `ds-figma-component` sur le nœud précis |

2. **Batch add sur `main`**, et seulement les composants du tri (15 utilisés
valent mieux que 45 dont 30 morts). Après **chaque** add, lancer
`<pm> run ds:doctor` : il détecte le piège `cn` (imports `from "cn"` et
paquet npm), entre autres.
3. **Familles en parallèle** (forms, overlays, data, feedback) : chaque lot
livre démo (tous variants, tous états), entrée `demos/index.ts` et fiche
`docs/components/`. Les écarts vont dans `SIGNALEMENTS.md` — personne ne
touche `globals.css` ni `ds-theme.json` hors de `main`.
4. **Fin de vague** : comparaison visuelle `get_screenshot` de la frame
Figma ↔ `/design-system`. Produire la liste des écarts, ne rien corriger
— l'humain tranche.

## Phase 5 — CI

`lint` + `ds:doctor` + `build` sur chaque PR (voir `.github/workflows/ci.yml`
de ce repo). Puis la steward fixe `figma.mode` : `none` (le Figma de départ est
archivé, le kitchen-sink est la seule référence) ou `intent` (le Figma reste
une référence d'intention ; la dérive se gère par `ds-figma-update`, sous
validation). Le mode `mirror` est à l'étude (set v2).

## Phase 6 — handoff

`HANDOFF.md` (état des lieux, gestes, pièges, chemin d'extraction),
références de nœuds Figma **datées** dans les fiches, et la preuve agentic :
demander en live « ajoute un écran de [cas réel] avec nos composants » pour
démontrer que `CLAUDE.md` + garde-fous tiennent sans leur auteur.

## Les trois règles anti-conflit (travail parallèle)

1. Un fichier de démo par composant dans `demos/`, jamais d'édition de
`page.tsx`.
2. `shadcn add` uniquement sur `main`, en batch, avant parallélisation.
3. Les agents **signalent** (`SIGNALEMENTS.md`) ; seul l'humain applique les
corrections de tokens, sur `main`.
