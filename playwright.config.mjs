// Config Playwright — snapshots visuels du design system (opt-in dev).
// Prérequis une fois : `npx playwright install chromium`.
// Lancer : `npm run test:visual` · mettre à jour : `npm run test:visual:update`.
// Le webServer démarre le CRA dev server sur 4173 (ou réutilise s'il tourne).
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/visual',
  fullyParallel: false,
  timeout: 60_000,
  expect: {
    // Petites tolérances : antialiasing / fontes locales.
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' },
  },
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1280, height: 900 },
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'BROWSER=none PORT=4173 npm start',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 180_000,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
});
