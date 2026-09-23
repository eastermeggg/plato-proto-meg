# Outillage du design system — pour les devs

Trois outils prêts à l'emploi. Ils sont **à disposition** (les deux premiers
tournent en local et sont câblés en npm scripts ; le troisième est un scaffold
opt-in). Comment les brancher en CI : voir la dernière section.

## 1. Vérification lint — `npm run ds:doctor`

Le garde-fou du système (`scripts/ds-doctor.mjs`, zéro dépendance) :
- **bloquant** : hex en dur hors sources de tokens (whitelist `ds-hex-ok:` +
  `doctor.pendingHex` du manifeste), manifeste invalide ;
- **avertissements** : émojis, tirets cadratins dans l'UI.

`--report` compte sans échouer · `--json` sortie machine. Déjà branché en CI
(`.github/workflows/ds.yml`).

## 2. Flagger de manques — `npm run ds:gaps`

Le complément « complétude » (`scripts/ds-gaps.mjs`) : le doctor dit ce qui est
*interdit*, ds-gaps dit ce qui *manque* :

| Règle | Bloquant | Détecte |
|---|---|---|
| `fiche-manquante` | oui | composant `ui/*.js` sans fiche `.md` sœur |
| `docs-périmés` / `docs-absent` | oui | `componentDocs.json` plus vieux qu'une fiche (relancer `ds:docs`) |
| `inventaire-exists` | oui | entrée d'inventaire dont `exists` contredit le filesystem |
| `fiche-orpheline` | info | fiche `.md` sans composant |
| `inventaire-absent` | info | **nouveau composant émis** sans entrée d'inventaire |
| `demo-manquante` | info | composant sans démo (pas de Playground) |
| `token-non-catalogué` | info | hex de `tokens.js` absent du catalogue |

`--ci` : exit 1 sur les bloquants. **Agrégat : `npm run ds:check`** = doctor + gaps.

## 3. Snapshots visuels — Playwright (opt-in)

Scaffold prêt : `playwright.config.mjs` + `tests/visual/ds.spec.mjs`. Les specs
sont **pilotées par `componentDocs.json`** : chaque composant documenté gagne
automatiquement son snapshot de fiche (light **et** dark), plus la vue
d'ensemble, les tokens et l'inventaire. Ajouter une fiche = gagner un snapshot.

Mise en place (une fois) :
```bash
npx playwright install chromium     # télécharge le navigateur (~120 Mo)
npm run test:visual:update          # crée la baseline (committer les .png)
```
Puis en routine :
```bash
npm run test:visual                 # échoue si le rendu dérive de la baseline
```
Le webServer démarre tout seul (port 4173) ou réutilise un serveur existant.
`test-results/` et `playwright-report/` sont gitignorés ; la **baseline**
(`tests/visual/ds.spec.mjs-snapshots/`) se committe.

## Brancher en CI (quand l'équipe est prête)

`.github/workflows/ds.yml` lance déjà le doctor. Pour durcir :

```yaml
# dans le job ds-doctor, remplacer la dernière étape par :
      - run: node scripts/ds-doctor.mjs && node scripts/ds-gaps.mjs --ci

# job snapshots (optionnel — nécessite la baseline committée) :
  visual:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:visual
```

## Roadmap (posée, pas construite)

- **Histo composants** : le couple fiche `.md` (source) + snapshots committés
  donne déjà un historique par git (`git log --follow src/components/ui/Badge.md`,
  diff des .png). Un onglet « Historique » dans la fiche du playground pourrait
  le surfacer (lecture `git log` au build).
- **CI « nouveaux composants émis »** : `ds-gaps` flagge déjà `inventaire-absent`
  (un composant ajouté sans entrée). Passer cette règle en bloquant quand le flux
  d'inventaire est rodé.
