// Config Playwright — régression visuelle du DS (`npm run ds:visual`).
// Prérequis une fois : `npx playwright install chromium`.
// Les baselines sont générées en CI (Linux) UNIQUEMENT : le rendu des fontes
// diffère selon l'OS — label `ds-baselines` sur la PR (voir ds-visual.yml).
// Le webServer démarre le CRA dev server sur 4173 (ou réutilise s'il tourne).
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/visual',
  snapshotPathTemplate: 'tests/visual/__snapshots__/{arg}{ext}',
  fullyParallel: false,
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.001, animations: 'disabled' },
  },
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1280, height: 900 },
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'BROWSER=none PORT=4173 npm start',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
