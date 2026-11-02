import { defineConfig } from '@playwright/test';

/**
 * Responsive rendering tests of the public article pages (e2e/), at the three widths the newsroom
 * checks before publishing. Runs against BASE_URL, or starts `next dev` locally.
 *   npm run test:e2e            (local Chrome)
 *   BASE_URL=https://… npm run test:e2e
 */
const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  fullyParallel: true,
  workers: 3,
  reporter: [['list']],
  use: {
    baseURL,
    // The Chrome installed on the machine (CI: `npx playwright install chromium` and drop this)
    channel: process.env.CI ? undefined : 'chrome',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: 'mobile', use: { viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: 'npm run dev', url: baseURL, reuseExistingServer: true, timeout: 180_000 },
});
