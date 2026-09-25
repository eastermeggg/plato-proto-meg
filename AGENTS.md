# AGENTS.md — règles projet canoniques (Norma / Plato)

Source unique des règles, lue par tous les assistants (`CLAUDE.md` y renvoie).
Repo : prototype design-system-first — CRA, React 18, JavaScript, Tailwind v3.
Le playground DS `/ui-kit` est le cœur ; le produit vit à `/app`. Les chemins
DS font foi dans `ds.manifest.json`.

## Design system — règles dures

1. **Un composant absent de l'inventaire n'existe pas.** Inventaire :
   `src/data/designSystemInventory.json` (UI : `/ui-kit/inventory`). Avant d'en
   créer un : `ds-decide`.
2. **Tokens sémantiques uniquement** (`src/design-system/tokens.js` → `var()`,
   theme-aware) : zéro hex brut, zéro `bg-[#…]`, zéro couleur Tailwind brute.
   Token manquant → `SIGNALEMENTS.md`. Pas d'émojis dans l'UI ; tirets simples
   plutôt que cadratins (« — » seul = placeholder toléré).
3. **Pas de `className` pour ajuster un composant DS.** Un ajustement récurrent
   est un variant (`ds-variant`).
4. **Fichiers protégés** (`paths.protected` : `src/design-system/tokens.js`,
   `src/index.css`) : jamais édités sans validation steward — signaler.
5. **Une seule action primaire par écran.** Le reste en `secondary`, `outline`
   ou `ghost`.
6. **Cinq états** pour tout écran de données : vide, chargement, erreur,
   partiel, idéal.
7. **Ne JAMAIS re-rouler le shell / la nav / une barre.** Rail, barre de tête,
   en-tête de page, barre de contexte = composants canoniques (`AppSidebar`,
   `TopBar`, `PageHeader`, `Niveau3Strip`, `NavExpandControl`). Un nouvel
   onglet / une nouvelle page = du CONTENU passé à ces composants, jamais une
   barre inline. Détail + tableau : conventions §9 ; vitrine : `/ui-kit/shell`.
8. **Packages** : mono-package aujourd'hui ; si extension un jour, le source
   n'importe jamais une extension (conventions §4, `ds-check-boundaries`).
9. **Tout composant a sa fiche** (`src/components/ui/<Nom>.md`, 7 champs,
   conventions §7), sa démo jouable (`componentDemos.jsx`, `data-demo`) et son
   entrée d'inventaire. Après édition d'une fiche : `npm run ds:docs`.
10. **Avant de rendre la main** : `npm run ds:doctor && npm run build`
    (le doctor délègue fiches + frontières + éléments bruts ; 0 constat bloquant).
11. **Imiter `/ui-kit`, jamais `App.js`.** Pour un nouvel écran ou une nouvelle
    surface, la référence à copier est un **block du playground**
    (`/ui-kit/blocks`, code `src/components/ui-kit/blocks.jsx`) - en premier le
    block **Écran-gabarit** (`/ui-kit/b/ecran-gabarit` : shell + PageHeader +
    table + Dropdown de ligne + Dialog création + Drawer modification +
    AlertDialog + les 5 états) et le block **Shell** (gabarit de page + valeurs
    canoniques). **Ne JAMAIS cloner un écran d'`App.js`** : le proto porte des
    anti-patterns hérités (éléments bruts, barres inline, valeurs en dur) que
    la migration résorbe progressivement - le copier, c'est les propager. Les
    blocks sont l'état cible ; `App.js` est l'existant en cours d'alignement.

**Vérité Figma mixte par surface, jamais globale** — registre + 4 règles
d'arbitrage : `docs/design-truth.md` (+ `figma.note` du manifeste). Surface
absente du registre ou doute : question steward, jamais de correction
automatique. **Régime de création (25/09) : le Figma est le socle (thème +
surfaces héritées), la création de nouvelles surfaces est agent-first, en
code** — pas de page Figma requise ; en échange : tokens only, systématisation
sur l'existant, fiche + démo + inventaire `pending`, rendu light/dark dans la
PR (détail : design-truth §Régime de création). La validation steward reste
le seul chemin vers `validated`.

Écarts : dettes assumées → `ECARTS.md` (steward seul) ; constats d'agents →
`SIGNALEMENTS.md` (local, gitignoré) puis `ds-audit --harvest` (conventions §2).

## Carte

| Besoin | Fichier |
|---|---|
| Config skills `ds-*` (chemins, Figma, protégés) | `ds.manifest.json` (fait foi) |
| Référence des conventions `ds-*` | `.claude/skills/_shared/conventions.md` (lire la section citée) |
| Tokens (source de vérité) | `src/design-system/tokens.js` · doc générée `docs/tokens.md` (`npm run ds:tokens`) |
| Composants canoniques + fiches | `src/components/ui/` (+ `CLAUDE.md` du dossier) ; esquisses non promues : `ui-kit/previews.jsx` |
| Registre de vérité Figma | `docs/design-truth.md` |
| Dark mode (architecture var()) | `docs/dark-mode.md` · thème injecté par `src/design-system/theme.js` |
| Tables (custom, pas shadcn) | `docs/table-system.md` |
| Migration hex → tokens | `DECISIONS-HEX.md` |
| Commencer ici (handover) | `HANDOVER.md` |
| Carte top-level du DS | `llms.txt` |

## Commandes

- `npm start` · `npm run build` (CRA)
- `npm run ds:doctor` — garde-fou DS (hex, manifeste, fiches, frontières, éléments bruts) · `--report` / `--json`
- `npm run ds:docs` · `npm run ds:tokens` — régénèrent docs composants / catalogue tokens
- `npm run ds:visual` — diffs visuels Playwright (baselines : jamais en local, label `ds-baselines` en CI)
- `node scripts/ds-audit.mjs` · `node scripts/ds-changelog.mjs` — état du DS · changelog par composant

CI : `.github/workflows/ds.yml` (doctor) · `ds-changelog.yml` · `ds-visual.yml`.
