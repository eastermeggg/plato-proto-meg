# CLAUDE.md — porte d'entrée agents

> Auto-chargé par Claude Code. Les **règles projet canoniques vivent dans
> `AGENTS.md`** ; ce fichier est la porte d'entrée + la carte, pas un doublon.
> En cas de conflit : le plus spécifique / le plus récent gagne, et
> `ds.manifest.json` fait foi sur les chemins du DS.

## Ce qu'est ce repo

Norma / Plato — un prototype **design-system-first** (React 18, Create React App,
Tailwind v3, JavaScript). **Le playground DS à `/ui-kit` est le CŒUR** : tokens,
fiches composants, sandboxes. Designers, PM et devs travaillent depuis là. Le
produit (« proto ») vit à côté, dans la même app.

## Non-négociables

1. **Tokens, jamais de valeur en dur.** Couleurs / espacements / radius / ombres
   viennent de `src/design-system/tokens.js` (→ variables CSS `var()`,
   theme-aware light/dark). Zéro hex brut, zéro `bg-[#...]`. Besoin d'une valeur
   absente → créer un token d'abord.
2. **Lancer le garde-fou : `npm run ds:doctor`** (PAS `lyse audit` — cet outil
   est mort, cf. `ECARTS.md`). Il doit sortir 0. CI : `.github/workflows/ds.yml`.
3. **Composants** : réutiliser depuis `src/components/ui/`. Chaque primitive a une
   fiche `.md` sœur = **la source de sa doc** ; la lire avant usage. Règles :
   `src/components/ui/CLAUDE.md`. Après édition d'une fiche : `npm run ds:docs`
   (régénère `src/data/componentDocs.json`, consommé par le playground).
4. **Pas d'émojis dans l'UI ; tirets simples plutôt que cadratins.**
5. **Vérité Figma mixte par surface** — registre : `docs/design-truth.md`. En cas
   de doute, question pour la steward, jamais de correction automatique.
6. **Ne JAMAIS re-rouler le shell / la nav / une barre.** Rail, barre de tête,
   en-tête de page, barre de contexte = composants canoniques (`AppSidebar`,
   `TopBar`, `PageHeader`, `Niveau3Strip`, `NavExpandControl`). Un nouvel onglet /
   une nouvelle page = du **contenu** passé à ces composants, jamais une barre
   inline. Détail + tableau : `AGENTS.md` § « Shell, nav & barres ». Vitrine :
   `/ui-kit/shell`.

## Carte

| Besoin | Fichier |
|---|---|
| Règles projet complètes | `AGENTS.md` |
| Principes DS (synthèse agents) | `docs/ds-principles.md` |
| Commencer ici (handover) | `HANDOVER.md` |
| Config des skills `ds-*` | `ds.manifest.json` |
| Tokens (source de vérité) | `src/design-system/tokens.js` |
| Doc d'usage des tokens | `docs/tokens.md` (généré : `npm run ds:tokens` ; usages dans `scripts/gen-token-docs.mjs`) |
| Carte des composants Figma | `docs/figma-components-map.md` |
| Tables (décision : custom, pas shadcn) | `docs/table-system.md` |
| Dark mode (architecture var()) | `docs/dark-mode.md` |
| Règles composants + fiches | `src/components/ui/CLAUDE.md`, `src/components/ui/*.md` |
| Registre de vérité Figma | `docs/design-truth.md` |
| Relevé du thème Figma | `docs/figma-theme-releve.md` |
| Migration couleurs → tokens | `DECISIONS-HEX.md` |
| Dettes assumées / constats agents | `ECARTS.md` / `SIGNALEMENTS.md` |
| Skills DS | `.claude/skills/ds-*` (lire `_shared/conventions.md` d'abord) |
| Inventaire composants + tokens | `src/data/designSystemInventory.json` · UI `/ui-kit/inventory` |

## Commandes

- `npm start` — dev server · `npm run build` — build de prod
- `npm run ds:doctor` — garde-fou DS (0 hex en dur) · `--report` / `--json`
- `npm run ds:docs` — régénère les docs composants depuis les fiches `.md`
- `npm run ds:tokens` — régénère le catalogue de tokens (usages) + `docs/tokens.md`
- `npm run ds:gaps` / `ds:check` — flagger de manques / agrégat doctor+gaps
