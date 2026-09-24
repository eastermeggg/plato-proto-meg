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

`src/components/ui/<Name>.md` (chemin réel : `paths.docsComponents` du
manifeste), depuis `templates/component.md`. Rien d'autre.

**Frontmatter** : `name`, `package`, `status`, `usage`, `source`, `demo`,
`replacedBy`, `figma` (optionnel). Aucun autre champ.

**Statut** :
- `draft` : pas encore utilisable hors de sa PR.
- `beta` : utilisable, avec une dette connue → une ligne + un numéro d'issue.
- `stable` : aucune dette ouverte.
- `deprecated` : `replacedBy` obligatoire.
Un composant avec une dette documentée n'est jamais `stable`.

**Corps** : intro · When to use · When NOT to use · Props · Examples. Rien d'autre.

**Langue** : anglais (frontmatter + corps). Français conservé pour le
vocabulaire produit (pièce, acte, JP, bordereau…) et la copy UI citée verbatim.
Étalon : `Badge.md`.

**Interdit dans une fiche**, parce que ça se déduit ou vit ailleurs :
- liste de tokens → le code ;
- dates de validation → git et `ds-changelog` ;
- états → la démo ;
- valeurs en px ou en hex → les tokens ;
- en-tête qui répète le frontmatter ;
- dette ou notes d'exploration → une issue `ds-gap`, la fiche y renvoie en une ligne ;
- route de démo → dérivée de `data-demo`.

Vérifié par `ds-check-docs`.

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

## §10 Élévation — échelle `shadows` par rôle

Jamais de chaîne `box-shadow` rgba inline : classe `shadow-2xs…shadow-4xl` ou
token `shadows.*`. Le cran se choisit par le **RÔLE** de l'élément, pas par la
valeur d'origine — une ombre inline improvisée est souvent sous- ou
sur-dimensionnée ; le rôle prime sur la géométrie brute.

| Niveau | Cran | Rôle |
|---|---|---|
| **L0** | `2xs` · `xs` | Contrôles — boutons, toggles, poignées, chips, thumbs |
| **L1** | `sm` · `md` | Cards & surfaces — cartes de contenu, panneaux ancrés au flux, en-têtes |
| **L2** | `lg` | Menus, dropdowns, popovers, context menus, command palettes |
| **L3** | `2xl` | Panneaux flottants — toasts, panneaux ancrés, feuilles, notifications |
| **L4** | `4xl` | Dialogs — modales centrées |

Règles d'arbitrage :
- **Le rôle décide le niveau ; la géométrie ne sert qu'à départager dans un
  niveau.** Une modale porte L4 même si son ombre d'origine était petite ; un
  dropdown porte L2 même si sa valeur rgba tombait géométriquement sur `md`.
- **Teinte neutralisée** : les ombres hors échelle (stone chaudes 28,25,23 /
  41,37,36) reprennent la teinte du cran (26,26,26). L'opacité ne départage pas.
- `xl` et `3xl` sont des crans intermédiaires hérités, **hors grille par rôle** :
  ne pas les viser pour les 5 rôles ci-dessus.
- **Pendant dark — tranché 24/09/2026** : AUCUN fork dark des crans. Les 9
  valeurs sont identiques light/dark ; en dark l'élévation se lit par la
  SURFACE (doctrine B) : L0/L1 → `card`, L2 → `popover`, L3/L4 →
  `surfaceRaised`. Ne jamais opacifier une ombre « pour le dark ».
- **Hors élévation** (glows, focus rings via `:focus-visible`, keyframes de
  pulsation, insets, illustrations in-code) : ne passent JAMAIS par l'échelle —
  ce ne sont pas des ombres de profondeur. Focus : tokens dédiés
  `shadows.focusRing` / `focusRingError` (halo 3px borderHover 50 % / accent
  erreur 40 %, bord `ring`) — jamais un halo local ; Button et ParamPill
  gardent leurs états Figma propres (outline 2px / halo background).
- **Tiroirs horizontaux** (`-20px 0 …`) : aucun cran dans l'échelle actuelle,
  `[a-dessiner]` en attendant une spec drawer + token dédié.

Échelle source : `src/design-system/tokens.js` (`shadows`, 2xs→4xl) ; miroir
Tailwind `tailwind.config.js`. Le doctor signale toute chaîne rgba inline
(`shadow-inline`).
