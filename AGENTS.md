# Agents

This file is read by AI coding assistants. Front door : `CLAUDE.md` (racine).

## Project & toolchain

Norma is a design prototype built with **Create React App** (React 18, JavaScript — not TypeScript) and **Tailwind CSS v3**. Config files that define the toolchain in scope:

- `package.json` — dependencies and scripts (`npm start`, `npm run build`, `npm run ds:doctor`, `npm run ds:docs`)
- `tailwind.config.js` — Tailwind theme extension (couleurs = `var(--token)`, généré depuis tokens.js)
- `postcss.config.js` — PostCSS pipeline for Tailwind
- `scripts/ds-doctor.mjs` — garde-fou DS (`npm run ds:doctor`). Remplace `lyse audit`, mort (paquet npm disparu ; fichiers lyse supprimés).

### Design system

- `src/design-system/tokens.js` — canonical color / spacing / type tokens (single source of truth ; `colors.X` renvoie `var(--token)`, theme-aware light/dark)
- `src/index.css` — global styles ; les variables de thème sont injectées par `src/design-system/theme.js`
- `src/components/ui/` — composants **canoniques** (+ `CLAUDE.md` + fiche `.md` par composant = source de doc). `src/components/ui-kit/previews.jsx` = esquisses non promues.
- `src/data/designSystemInventory.json` — catalogue tokens + composants (surfacé dans `/ui-kit`)
- `llms.txt` (repo root) — top-level map of the design system

### Conventions

- No emojis in UI; prefer hyphens over em-dashes in copy.
- Use design tokens from `tokens.js` rather than hardcoded hex/spacing values.
- Run **`npm run ds:doctor`** before shipping (exit 0). Après édition d'une fiche composant : `npm run ds:docs`.

### Shell, nav & barres - toujours composer, jamais re-rouler

Le chrome de navigation est **canonique et invariant**. On ne ré-invente JAMAIS un
rail, une barre de tête, un en-tête de page ou une barre de contexte inline. On
**compose** toujours les composants existants (import depuis `src/components/ui/`) :

| Besoin | Composant - jamais inline |
|---|---|
| Rail de navigation gauche | `AppSidebar` (+ `SidebarBrand`, `SidebarGroup`, `NavItem`, `NavSectionHeader`, `SidebarUserInfo`) |
| Barre de tête fixe (breadcrumb + onglets de vue + outils) | `TopBar` |
| En-tête de page (titre serif + action + onglets) | `PageHeader` |
| Barre de contexte niveau 3 (poste / acte / JP) | `Niveau3Strip` |
| Contrôle « Menu » (nav masquée) | `NavExpandControl` |

**Un nouvel ONGLET, une nouvelle PAGE, une nouvelle destination = du nouveau
CONTENU passé à ces composants (un `NavItem` de plus, un `tab` de plus, un slot
`left`/`right`), jamais une nouvelle barre `h-12 border-b` ou un `border-r flex-col`
à la main.** Si le besoin ne rentre dans aucun composant, c'est une évolution du
composant (fiche + `ds-decide`), pas un re-roll local. Vitrine vivante : `/ui-kit/shell`
(« Les surfaces du shell ») ; comportement : `src/components/shell/NAV-BEHAVIOR.md`.

### Figma - source de vérité mixte

Le fichier Figma de référence est `Plato---Design` (`0eKtlRkT1Hbjh8Nqd47Woy`). La vérité est **mixte, décidée par surface** - le registre complet est dans `docs/design-truth.md` :

- **Figma fait foi** pour les surfaces portées pixel-perfect depuis une frame : ex. PreviewPanel V2, nav dossier V2 (frame 4046), panneau document.
- **Le code fait foi** pour les surfaces code-first ; ce qui existe dans Figma en est au mieux un export du code (ex. page Labour 2668:24241, exportée depuis le relevé d'heures).

Avant d'arbitrer un écart Figma/code : chercher la surface dans le registre. Absente du registre ou en cas de doute : question pour la steward - jamais une correction automatique dans un sens ou dans l'autre.

#### Arbitrage Figma - les 4 règles (quand on porte un nœud « pixel-perfect »)

1. **Le NŒUD fait foi pour la géométrie et la typo** (dimensions, paddings, gaps,
   tailles/tracking). Les **descriptions de composants Figma** documentent
   l'intention et l'usage - JAMAIS les mesures : elles sont souvent rédigées
   depuis d'anciennes versions du code et dérivent (ex. vécu : description
   « h48 px32 » quand le nœud dessine px-12/16). Nœud > description, toujours.
2. **Les COULEURS et OMBRES viennent des tokens, jamais des hex du nœud.**
   Les variables Figma et `tokens.js` divergent délibérément (bordures
   assombries d'un demi-cran, cf. `DECISIONS-HEX.md`) : on mappe la variable
   Figma vers le token de même rôle (`--border` → `colors.semantic.border`),
   on ne transcrit pas la valeur. « Pixel-perfect » = géométrie du nœud +
   couleurs des tokens.
3. **Un composant du nœud = un composant du code.** Si le nœud est composé
   d'atomes (KindIcon, MetaChip…), le code les expose aussi - jamais un
   monolithe qui redessine les atomes inline.
4. **Le DS en code et en prod est LA source.** Les composants naissent et
   évoluent en code (vibecoding) ; le Figma sert de cible d'intention au moment
   du portage, puis le DS établi (composants + tokens tels qu'ils tournent en
   prod) fait foi (régime `docs/figma-reference.md`). Un écart découvert APRÈS
   portage n'est pas un bug du code : question steward.

### Skills design system (`.claude/skills/ds-*`)

Le set de skills `ds-*` (build, decide, review, variant, explore, figma-*, install, adopt, promote) est installé dans `.claude/skills/`. Il est générique : il lit la configuration du projet dans `ds.manifest.json` à la racine - qui adapte les chemins à cette codebase (rules → `AGENTS.md`, theme → `src/design-system/tokens.js`, inventaire → `src/data/designSystemInventory.json`) et documente la doctrine Figma ci-dessus (`figma.note`).

La commande de vérification est **`npm run ds:doctor`** (`scripts/ds-doctor.mjs`, zéro dépendance) : hex en dur hors tokens (bloquant), validation du manifeste (bloquant), émojis et tirets cadratins dans l'UI (avertissements). `--report` compte sans échouer, `--json` pour la sortie machine. Elle remplace `lyse audit`, cassé (le paquet npm `lyse` n'existe plus) - voir `ECARTS.md`. Les dettes assumées sont dans `ECARTS.md` (steward) ; les constats d'agents vont dans `SIGNALEMENTS.md` (local, gitignoré). Lire `_shared/conventions.md` avant d'agir, puis ce manifeste ; en cas de conflit entre les défauts des conventions et le manifeste, le manifeste fait foi.

## Validate design-system conformance

> L'ancien bloc « Lyse audit » est supprimé : le paquet npm `lyse` n'existe plus
> (fichiers lyse supprimés du repo). Le garde-fou est désormais `ds-doctor`.

```bash
npm run ds:doctor            # 0 hex en dur hors tokens + validation du manifeste
npm run ds:doctor -- --report  # compte sans échouer (état des lieux)
```

Exit codes : `0` pass · `1` constat(s) bloquant(s). CI : `.github/workflows/ds.yml`.
