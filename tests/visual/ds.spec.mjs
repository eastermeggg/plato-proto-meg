// Snapshots visuels du design system — pilotés par componentDocs.json :
// chaque composant documenté (fiche .md) a automatiquement son snapshot de
// page détail. Ajouter une fiche = gagner un snapshot, zéro maintenance.
//
// Baseline : `npm run test:visual:update` (commit les .png générés).
// Vérif    : `npm run test:visual` — échoue si le rendu dérive de la baseline.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const docs = JSON.parse(readFileSync('src/data/componentDocs.json', 'utf8'));
const componentIds = Object.keys(docs.components || {});

test.describe('Plato DS — pages plateforme', () => {
  test('vue d\'ensemble (/)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Plato Design System');
    await expect(page).toHaveScreenshot('overview.png', { fullPage: false });
  });

  test('design tokens', async ({ page }) => {
    await page.goto('/ui-kit/tokens');
    await page.waitForSelector('text=Design Tokens');
    await expect(page).toHaveScreenshot('tokens.png', { fullPage: false });
  });

  test('inventaire composants', async ({ page }) => {
    await page.goto('/ui-kit/inventory');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('inventory.png', { fullPage: false });
  });
});

test.describe('Plato DS — fiches composants (auto depuis componentDocs.json)', () => {
  for (const id of componentIds) {
    test(`fiche ${id} (light)`, async ({ page }) => {
      await page.goto(`/ui-kit/c/${id}`);
      await page.waitForSelector(`h1:has-text("${id}")`);
      await expect(page).toHaveScreenshot(`component-${id}.png`, { fullPage: true });
    });

    test(`fiche ${id} (dark)`, async ({ page }) => {
      await page.goto(`/ui-kit/c/${id}`);
      await page.waitForSelector(`h1:has-text("${id}")`);
      await page.evaluate(() => document.documentElement.classList.add('dark'));
      await page.waitForTimeout(200);
      await expect(page).toHaveScreenshot(`component-${id}-dark.png`, { fullPage: true });
    });
  }
});
