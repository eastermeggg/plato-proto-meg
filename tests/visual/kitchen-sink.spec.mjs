// Régression visuelle du kitchen-sink (conventions §5) — adapté colombo :
// le kitchen-sink est multi-pages (/ui-kit/c/<id>), pas une page unique.
// Piloté par componentDocs.json : chaque fiche a sa page de détail, dont le
// canvas de démo porte data-demo="plato/<id>" (posé par DemoCanvas).
// Ajouter une fiche = gagner ses snapshots light + dark, zéro maintenance.
//
// Baselines : JAMAIS en local (rendu OS-dépendant) — label `ds-baselines` sur
// la PR, la CI (ds-visual.yml) régénère et committe. Local : voir les diffs.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const docs = JSON.parse(readFileSync('src/data/componentDocs.json', 'utf8'));
const componentIds = Object.keys(docs.components || {});

async function setTheme(page, theme) {
  await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
  await page.evaluate((t) => {
    document.documentElement.classList.toggle('dark', t === 'dark');
    document.documentElement.dataset.theme = t;
  }, theme);
  await page.evaluate(() => document.fonts.ready);
}

// Pages plateforme (vue d'ensemble, tokens, inventaire) — couverture héritée
// de l'ancien ds.spec.mjs, en light et dark.
const PAGES = [
  { name: 'overview', url: '/', ready: 'text=Plato Design System' },
  { name: 'tokens', url: '/ui-kit/tokens', ready: 'text=Design Tokens' },
  { name: 'inventory', url: '/ui-kit/inventory', ready: 'main, body' },
];
for (const theme of ['light', 'dark']) {
  for (const p of PAGES) {
    test(`plato — ${p.name} — ${theme}`, async ({ page }) => {
      await page.goto(p.url);
      await page.waitForSelector(p.ready);
      await setTheme(page, theme);
      await expect(page).toHaveScreenshot(`page-${p.name}--${theme}.png`, {
        animations: 'disabled', caret: 'hide',
      });
    });
  }
}

// Pages de détail composant : un snapshot par [data-demo], light et dark.
for (const theme of ['light', 'dark']) {
  for (const id of componentIds) {
    test(`plato/${id} — ${theme}`, async ({ page }) => {
      await page.goto(`/ui-kit/c/${id}`);
      await page.waitForSelector(`h1:has-text("${id}")`);
      await setTheme(page, theme);

      const demos = page.locator('[data-demo]');
      const count = await demos.count();
      expect(count, `aucune démo data-demo sur /ui-kit/c/${id}`).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const demo = demos.nth(i);
        const name = (await demo.getAttribute('data-demo')).replace(/[^\w-]+/g, '_');
        await demo.scrollIntoViewIfNeeded();
        // soft : une démo en échec n'empêche pas de voir les autres au rapport.
        await expect.soft(demo).toHaveScreenshot(`${name}--${theme}.png`, {
          animations: 'disabled', caret: 'hide',
        });
      }
    });
  }
}
