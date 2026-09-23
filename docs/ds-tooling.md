# Outillage du design system — pour les devs

Un garde-fou unique (`ds:doctor`, qui délègue), deux outils d'état
(`ds-audit`, `ds-changelog`) et la régression visuelle Playwright. Tout est
branché en CI (`.github/workflows/`).

## 1. Garde-fou unique — `npm run ds:doctor`

`scripts/ds-doctor.mjs` (zéro dépendance) vérifie en direct :
- **bloquant** : hex en dur hors sources de tokens (whitelist `ds-hex-ok:` +
  `doctor.pendingHex` du manifeste), manifeste invalide, émojis et tirets
  cadratins dans l'UI (verrouillés depuis le passage à 0), ombres inline ;
- et **délègue** (constats fusionnés dans sa sortie, doctrine kit v3) :
  - `scripts/ds-check-docs.mjs` — fiches 7 champs, fiche ↔ inventaire
    (borné aux entrées canoniques `src/components/ui/`), `exists` ↔
    filesystem, fraîcheur de `componentDocs.json`, démos manquantes (info),
    tokens non catalogués (info) — l'ancien `ds-gaps.mjs` est absorbé ici ;
  - `scripts/ds-check-boundaries.mjs` — frontières de packages (mono-package
    aujourd'hui : no-op).

`--report` compte sans échouer · `--json` sortie machine (un seul document,
constats délégués compris). CI : `.github/workflows/ds.yml`.

## 2. État du DS — `node scripts/ds-audit.mjs`

Agrège doctor + checks + heuristiques (deprecated encore importés, `className`
répété sur un composant DS = variant probable) → rapport `docs/audits/<date>.md`.
`--create-issues` ouvre les issues `ds-gap`/`triage` dédupliquées ;
`--harvest` transforme `SIGNALEMENTS.md` en issues avant merge.

## 3. Changelog par composant — `node scripts/ds-changelog.mjs`

Dérivé de git via les fiches (`--component <nom>`, `--days N`, `--pr`,
`--release`). En CI : commentaire de PR automatique
(`.github/workflows/ds-changelog.yml`).

## 4. Régression visuelle — `npm run ds:visual`

`playwright.config.mjs` + `tests/visual/kitchen-sink.spec.mjs`. Le spec est
**piloté par `componentDocs.json`** : il visite chaque page de détail
(`/ui-kit/c/<id>`), snapshote chaque `[data-demo]` (posé par `DemoCanvas`),
light **et** dark, plus les vues d'ensemble (tokens, inventaire). Ajouter une
fiche = gagner un snapshot.

**Baselines : jamais en local** (le rendu dépend de l'OS). Poser le label
`ds-baselines` sur la PR → `.github/workflows/ds-visual.yml` génère et committe
les baselines Linux sur la branche (relancer les workflows ensuite, limite
connue). En local, `npm run ds:visual` sert à *voir* les diffs.

```bash
npx playwright install chromium   # une fois (~120 Mo)
npm run ds:visual                 # échoue si le rendu dérive de la baseline CI
```

Le webServer démarre tout seul (port 4173) ou réutilise un serveur existant.
`test-results/` et `playwright-report/` sont gitignorés ; la baseline
(`tests/visual/__snapshots__/`) se committe (par la CI).

## Roadmap (posée, pas construite)

- **Histo composants** : fiche `.md` (source) + snapshots committés donnent déjà
  un historique par git (`git log --follow src/components/ui/Badge.md`, diff des
  .png). Un onglet « Historique » dans la fiche du playground pourrait le
  surfacer (lecture `git log` au build).
