import { test, expect, type Page } from '@playwright/test';

/**
 * Whole-site smoke tests: every page reachable from the header, menu and footer loads without a
 * server error or a JavaScript error, key pages fit every screen, and the interactive features
 * (quiz, newsletter validation) work. Nothing here writes to the database: newsletter checks only
 * use requests that are refused before any write.
 */
const LOCALES = ['fr', 'ar', 'en'] as const;

/** Browser console errors that come from third-party embeds or the network, not from the site */
const IGNORED = [/youtube|ytimg|googlevideo|instagram|facebook|fbcdn|tiktok|vercel-insights|_vercel\/insights/i, /Failed to load resource/i, /Permissions policy violation: compute-pressure/i];

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !IGNORED.some((re) => re.test(m.text()))) errors.push(`console: ${m.text()}`);
  });
  return errors;
}

/** Same-site page links of the current page, without anchors, queries or files */
async function internalLinks(page: Page): Promise<string[]> {
  const paths = await page.$$eval('a[href]', (as) => as.map((a) => {
    const u = new URL((a as HTMLAnchorElement).href);
    return u.origin === location.origin ? u.pathname : '';
  }));
  return [...new Set(paths.filter((p) => p && !/\.\w{2,4}$/.test(p) && !p.startsWith('/api/')))];
}

test.describe('every linked page loads', () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== 'desktop', 'crawled once, on desktop'));

  for (const locale of LOCALES) {
    test(`navigation in ${locale}`, async ({ page, baseURL }) => {
      test.setTimeout(10 * 60_000);
      // A visitor who chose this language (otherwise / follows the browser's language)
      await page.context().addCookies([{ name: 'NEXT_LOCALE', value: locale, url: baseURL! }]);
      // Arabic is the default language and has no prefix (/ , /news); French and English do (/fr/news)
      const home = locale === 'ar' ? '/' : `/${locale}`;
      const ours = (p: string) => (locale === 'ar' ? !/^\/(fr|en)(\/|$)/.test(p) : p === home || p.startsWith(`${home}/`));
      await page.goto(home);
      // Open the menu so its links are in the page too
      await page.getByRole('button', { name: /menu|القائمة/i }).first().click().catch(() => {});
      const paths = (await internalLinks(page)).filter(ours);
      expect(paths.length, 'header, menu and footer links').toBeGreaterThan(15);

      const failures: string[] = [];
      for (const path of paths) {
        const errors = watchErrors(page);
        const res = await page.goto(path, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
        const status = res?.status() ?? 0;
        if (status >= 400) failures.push(`${path}: HTTP ${status}`);
        failures.push(...errors.map((e) => `${path}: ${e}`));
        page.removeAllListeners('console');
        page.removeAllListeners('pageerror');
      }
      expect(failures).toEqual([]);
    });
  }

  test('an unknown page answers 404 with the site frame', async ({ page }) => {
    const res = await page.goto('/fr/this-page-does-not-exist');
    expect(res?.status()).toBe(404);
    await expect(page.locator('footer')).toBeVisible();
  });
});

const KEY_PAGES = ['', '/news', '/matches', '/standings', '/team', '/basketball/standings', '/gold-membership', '/gold-membership/yassine-bounou', '/live', '/community', '/quiz', '/newsletter', '/club', '/fans'];

test.describe('key pages fit the screen', () => {
  for (const locale of ['fr', 'ar'] as const) {
    test(`no sideways scrolling (${locale})`, async ({ page }) => {
      test.setTimeout(5 * 60_000);
      const wide: string[] = [];
      for (const p of KEY_PAGES) {
        await page.goto(`/${locale}${p}`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
        const { scroll, width } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: window.innerWidth }));
        if (scroll > width + 1) wide.push(`/${locale}${p}: ${scroll}px wide for a ${width}px screen`);
      }
      expect(wide).toEqual([]);
    });
  }
});

test.describe('Quiz Wydadi', () => {
  test('a quick game can be played through a question', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/fr/quiz');
    await page.locator('main button:has(span:text("🔴"))').first().click();
    const timer = page.getByRole('timer');
    await expect(timer).toBeVisible();
    const choices = page.locator('main ul li button');
    expect(await choices.count()).toBeGreaterThanOrEqual(2);
    await choices.first().click();
    await expect(page.getByRole('status').first()).toBeVisible();
    await expect(choices.first()).toBeDisabled();
    expect(errors).toEqual([]);
  });
});

test.describe('newsletter', () => {
  test('the form refuses an invalid address before sending anything', async ({ page }) => {
    let posted = false;
    page.on('request', (r) => { if (r.url().includes('/api/newsletter/subscribe')) posted = true; });
    await page.goto('/fr/newsletter');
    const form = page.locator('main form').first();
    await form.locator('input[type=email]').fill('not-an-email');
    await form.locator('button[type=submit]').click();
    await expect(form.locator('[role=alert], p').filter({ hasText: /adresse|e-mail|email/i }).first()).toBeVisible();
    expect(posted).toBe(false);
  });

  test('the API validates input and refuses other origins', async ({ request, baseURL }) => {
    const bad = await request.post('/api/newsletter/subscribe', { data: { email: 'x', topics: ['club'], consent: true, locale: 'fr' } });
    expect(bad.status()).toBe(400);
    const noConsent = await request.post('/api/newsletter/subscribe', { data: { email: 'fan@example.com', topics: ['club'], consent: false, locale: 'fr' } });
    expect(await noConsent.json()).toMatchObject({ result: 'error', code: 'consent' });
    const foreign = await request.post('/api/newsletter/subscribe', { headers: { origin: 'https://evil.example' }, data: {} });
    expect(foreign.status()).toBe(403);
    const notJson = await request.post('/api/newsletter/subscribe', { headers: { 'content-type': 'application/json', origin: new URL(baseURL!).origin }, data: '{' });
    expect(notJson.status()).toBe(400);
  });

  test('confirm and unsubscribe refuse malformed tokens', async ({ request }) => {
    const confirm = await request.get('/api/newsletter/confirm?token=x', { maxRedirects: 0 });
    expect(confirm.status()).toBe(303);
    expect(confirm.headers().location).toContain('status=invalid');
    const unsubscribe = await request.post('/api/newsletter/unsubscribe?token=x');
    expect(unsubscribe.status()).toBeLessThan(500);
  });
});

test.describe('admin and member areas are protected', () => {
  for (const path of ['/admin', '/admin/users', '/admin/media', '/admin/settings', '/admin/articles/new']) {
    test(`${path} needs a session`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login/);
    });
  }
});
