import { test, expect, type Page } from '@playwright/test';
import { measureLayout } from '../src/lib/editorial/responsive';

/**
 * Every published article must render on a computer, a tablet and a phone, in French, Arabic
 * (right to left) and English: same checks as the editor's "Preview and check" button.
 */
const LOCALES = [
  { locale: 'fr', prefix: '/fr', rtl: false },
  { locale: 'ar', prefix: '/ar', rtl: true },
  { locale: 'en', prefix: '/en', rtl: false },
];
const PER_LOCALE = Number(process.env.E2E_ARTICLES ?? 3);

/** Loads every image of the article (lazy ones included) before measuring */
async function settle(page: Page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(async () => {
    document.querySelectorAll<HTMLImageElement>('[data-article] img').forEach((img) => (img.loading = 'eager'));
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('[data-article] img'));
    await Promise.all(imgs.map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
    await document.fonts.ready;
  });
}

for (const { locale, prefix, rtl } of LOCALES) {
  test.describe(`articles ${locale}`, () => {
    test(`render without layout errors`, async ({ page }, info) => {
      await page.goto(`${prefix}/news`);
      const hrefs = await page.$$eval('a[href*="/news/"]', (as) => [...new Set(as.map((a) => (a as HTMLAnchorElement).pathname).filter((p) => /\/news\/[a-z0-9-]+$/.test(p) && !p.includes('/preview/')))]);
      expect(hrefs.length, 'the news page lists articles').toBeGreaterThan(0);

      for (const href of hrefs.slice(0, PER_LOCALE)) {
        await page.goto(href);
        await settle(page);
        expect(await page.locator('html').getAttribute('dir'), `${href} direction`).toBe(rtl ? 'rtl' : 'ltr');
        const issues = await page.evaluate(measureLayout, { rtl, touch: info.project.name !== 'desktop' });
        const errors = issues.filter((i) => i.level === 'error');
        expect(errors, `${href} on ${info.project.name}:\n${errors.map((e) => e.message).join('\n')}`).toEqual([]);
      }
    });
  });
}

test.describe('admin is protected', () => {
  test('the admin redirects to the login page', async ({ page }) => {
    await page.goto('/admin/articles');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
  test('article previews need a newsroom session', async ({ page }) => {
    await page.goto('/fr/news/preview/00000000-0000-0000-0000-000000000000');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
