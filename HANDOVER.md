# Handover — prototype Norma / Plato

Point d'entrée pour la personne qui reprend le prototype. Mis à jour le
23/09/2026 (branche `eastermeggg/install-skills-zip`, kit ds-* v3 installé).

## En une phrase

**La plateforme Plato Design System** (playground intégré, façon Storybook) est
le point d'entrée (`/`) ; le proto produit vit sur `/app` (entrée « Proto » dans
la nav). Tokens uniques, fiches `.md` par composant (7 champs, source des docs),
garde-fou unique `ds:doctor` (délègue fiches + frontières), régression visuelle
Playwright multi-pages (baselines CI-only), dark mode. C'est l'outil de travail
de toute la team Plato (design, product, dev).

## Où est quoi

| Sujet | Fichier |
|---|---|
| Règles agents (source unique) | `AGENTS.md` (`CLAUDE.md` = renvoi + spécificités Claude Code) |
| Config du set de skills DS | `ds.manifest.json` (fait foi sur les chemins) |
| Skills DS v3 (10 skills scriptées) | `.claude/skills/ds-*` + `_shared/conventions.md` + `templates/` |
| Tokens (source unique) | `src/design-system/tokens.js` |
| Miroir Tailwind (généré) | `tailwind.config.js` |
| Garde-fou unique | `scripts/ds-doctor.mjs` → `npm run ds:doctor` (délègue `ds-check-docs` + `ds-check-boundaries` ; l'ancien `ds-gaps` y est absorbé) |
| État du DS + issues | `scripts/ds-audit.mjs` (rapport `docs/audits/<date>.md`, `--create-issues`, `--harvest`) |
| Changelog par composant | `scripts/ds-changelog.mjs` (+ commentaire de PR auto : `.github/workflows/ds-changelog.yml`) |
| Régression visuelle | `playwright.config.mjs` + `tests/visual/kitchen-sink.spec.mjs` → `npm run ds:visual` · baselines : label `ds-baselines` en CI, jamais en local · doc `docs/ds-tooling.md` |
| CI | `.github/workflows/ds.yml` · `ds-changelog.yml` · `ds-visual.yml` |
| Vérité par surface (Figma vs code) + 4 règles d'arbitrage | `docs/design-truth.md` |
| Relevé du thème Figma (v2) | `docs/figma-theme-releve.md` |
| Dark mode | `docs/dark-mode.md` |
| Migration couleurs → tokens | `DECISIONS-HEX.md` |
| Dettes assumées | `ECARTS.md` |
| Catalogue composants + tokens (statut/Figma/notes) | `src/data/designSystemInventory.json` · UI : `/ui-kit/inventory` · section tokens régénérée par `npm run ds:tokens` |
| Composants canoniques + fiches | `src/components/ui/` (`CLAUDE.md` + `<Nom>.md`) → `src/data/componentDocs.json` (`npm run ds:docs`) |
| Carte du système | `llms.txt` |

## Ce qui a été fait

**22/09** : skills v1 + manifeste ; `ds-doctor` (remplace `lyse audit`, mort) ;
hex → tokens 2656 → 0 (`DECISIONS-HEX.md`) ; dark mode var() AA ;
réconciliation Figma (72 tokens synchro, 3 dérives délibérées).

**23/09 — kit v3** :
1. **10 skills v3** (35-50 lignes, doctrine « une règle = un script, ou rien »)
   remplacent les 13 v1 ; `_shared/conventions.md` + `templates/`.
2. **Doctor délégué** : `ds:doctor` = hex + manifeste + fiches
   (`ds-check-docs`, adapté inventaire JSON + checks ex-ds-gaps absorbés) +
   frontières (`ds-check-boundaries`). `ds-gaps.mjs` supprimé.
3. **41 fiches migrées** au format 7 champs (`package`/`source`/`demo`/`status`
   v3) ; démo `Stepper` créée ; catalogue tokens complété (cream, doc,
   composer, dropzone).
4. **AGENTS.md source unique** (10 règles dures + carte), `CLAUDE.md` réduit au
   renvoi ; détail shell/nav dans conventions §9 ; 4 règles d'arbitrage Figma
   dans `docs/design-truth.md`.
5. **Régression visuelle multi-pages** : `data-demo` posé par `DemoCanvas`,
   spec itérant `componentDocs.json` (light + dark), baselines CI-only
   (`ds-visual.yml` + label `ds-baselines`).
6. **Warnings doctor → 0** puis verrouillage `emoji` / `em-dash` en bloquant.

## Vérifier / lancer

```bash
npm start          # dev server
npm run ds:doctor  # garde-fou unique (doit sortir 0, 0 warning)
npm run build      # build de prod
npm run ds:visual  # diffs visuels locaux (baselines en CI seulement)
```

## Décisions qui restent à la steward (pas des dettes — voir le plan v3)

- [ ] **Passe visuelle avant/après** : artefact side-by-side + checklist dans
      `.context/steward-review/` (routes chaudes de SIGNALEMENTS). Revue ~15 min.
- [ ] **`tokens.js` / `tailwind.config.js` (protégés) édités** sur cette
      branche (2 tokens + architecture dark + rampes 23/09). À confirmer au merge.
- [ ] **Backlog de promotion** : ~34 esquisses `ui-kit/previews.jsx` non promues,
      visibles dans l'inventaire et `ds-audit`. Promotion = décision steward
      (`ui/CLAUDE.md`).
- [ ] **Arbitrages design ouverts** de SIGNALEMENTS (§11 conflits internes au
      Figma, §12 crans typo / tokens focus, §13 primitives à créer).
- [ ] **Licence de la fonte serif** `RL Para Trial Central` (Trial) à valider
      avant prod — encodée dans `fonts` du manifeste.
- [ ] **Sort des labs `/ui-kit`** (`ECARTS.md` #7) et **`App.js` monolithe**
      (`ECARTS.md` #3) : dettes assumées documentées.
- [ ] **Baselines visuelles** : après ouverture de la PR, poser le label
      `ds-baselines` (la CI génère et committe les baselines sur la branche).
