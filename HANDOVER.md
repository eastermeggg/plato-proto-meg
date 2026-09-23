# Handover — prototype Norma / Plato

Point d'entrée pour la personne qui reprend le prototype. Rédigé le 22/09/2026
(branche `eastermeggg/install-skills-zip`, **rien n'est encore commité**).

## En une phrase

**La plateforme Plato Design System** (playground intégré, façon Storybook) est
le point d'entrée (`/`) ; le proto produit vit sur `/app` (entrée « Proto » dans
la nav). Tokens uniques, fiches `.md` par composant (source des docs), garde-fous
(`ds:doctor` + `ds:gaps`), snapshots Playwright opt-in, dark mode. C'est l'outil
de travail de toute la team Plato (design, product, dev).

## Où est quoi

| Sujet | Fichier |
|---|---|
| Règles agents & conventions | `AGENTS.md` |
| Config du set de skills DS | `ds.manifest.json` |
| Tokens (source unique) | `src/design-system/tokens.js` |
| Miroir Tailwind (généré) | `tailwind.config.js` |
| Garde-fou (0 hex en dur) | `scripts/ds-doctor.mjs` → `npm run ds:doctor` |
| Flagger de manques | `scripts/ds-gaps.mjs` → `npm run ds:gaps` · agrégat `npm run ds:check` |
| Snapshots visuels (opt-in) | `playwright.config.mjs` + `tests/visual/` → `npm run test:visual` · doc `docs/ds-tooling.md` |
| CI | `.github/workflows/ds.yml` |
| Vérité par surface (Figma vs code) | `docs/design-truth.md` |
| Relevé du thème Figma (v2) | `docs/figma-theme-releve.md` |
| Dark mode | `docs/dark-mode.md` |
| Migration couleurs → tokens | `DECISIONS-HEX.md` |
| Dettes assumées | `ECARTS.md` |
| Skills DS | `.claude/skills/ds-*` |
| Catalogue composants (statut/Figma/notes) | `src/data/designSystemInventory.json` · UI : `/ui-kit/inventory` |
| Composants canoniques + fiches | `src/components/ui/` (`CLAUDE.md` + `<Nom>.md`) |
| Fiches composants (source) | `src/components/ui/*.md` → `src/data/componentDocs.json` (`npm run ds:docs`) |
| Carte du système | `llms.txt` |

## Ce qui a été fait (22/09/2026)

1. **Set de skills `ds-*` installé** + `ds.manifest.json` adapté au repo (chemins, mode Figma `intent`, doctrine « vérité mixte par surface »).
2. **Garde-fou `ds-doctor`** (zéro dépendance) qui remplace `lyse audit` (mort). Bloque tout hex en dur hors whitelist. Verrouillé en CI.
3. **Couleurs hex → tokens : 2656 → 0.** Migration mécanique + snaps ΔE CIEDE2000 + 2 tokens promus (`accents.ochre`, `accents.meadow`). Détail : `DECISIONS-HEX.md`.
4. **Dark mode** cohérent, contraste AA, via architecture `var()` (bascule tout l'app sans toucher les fichiers). Toggle en bas-gauche.
5. **Réconciliation Figma** contre les vraies Variables : code quasi parfaitement synchro (72 tokens identiques, 3 dérives délibérées, pas de dérive brand).

## Vérifier / lancer

```bash
npm start          # dev server
npm run ds:doctor  # garde-fou (doit sortir 0)
npm run build      # build de prod
```

## Décisions qui restent à la propriétaire (steward)

- [ ] **Passe visuelle avant/après** : ~2400 remplacements de couleurs + le dark mode. Points chauds listés dans `SIGNALEMENTS.md`.
- [ ] **`tokens.js` / `tailwind.config.js` (protégés) ont été édités** sur cette branche (2 tokens + architecture dark). À confirmer au merge.
- [ ] **Sort des labs `/ui-kit`** (`ECARTS.md` #7) : garder comme doc vivante, archiver, ou supprimer.
- [ ] **`App.js` monolithe** (~26k lignes, `ECARTS.md` #3) : découper avant handover ou assumer comme dette documentée.
- [ ] **Dark Figma** : le mode dark existe dans les Variables Figma (50 tokens) ; le dark en code est *dérivé*. Screenshoter le groupe « dark » pour l'aligner sur les vraies valeurs (optionnel).
- [ ] **Nettoyage émojis / em-dashes** : 664 avertissements non bloquants (`ds:doctor --json`), en partie dans des données de démo. Passe de triage à part.
- [ ] **Inventaire composants désynchronisé** : `Button`, `DropZone`, `Input` sont `status: "missing"` / `exists: false` dans `designSystemInventory.json` alors que les fichiers existent (avec fiches). Revalider via `/ui-kit/c/<id>`. Voir l'avertissement dans `src/components/ui/CLAUDE.md`.
- [ ] **Fiches composants incomplètes** : 4 primitives promues dans `ui/` (Badge, Button, DropZone, Input, toutes documentées) ; les ~15 autres primitives vivent encore en preview inline dans `ui-kit/previews.jsx` (non promues, non documentées). Promotion = décision propriétaire (règles `ui/CLAUDE.md` : demander avant de créer/promouvoir).
- [ ] **Commit** : rien n'est commité. `chore(ds): doctor + hex→0 + dark mode + reconciliation + component docs` quand la passe visuelle est validée.
