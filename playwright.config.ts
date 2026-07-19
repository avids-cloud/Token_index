import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

// E2E tests run against the production build (`npm run build` first).
// Test names quote the story's acceptance criteria; see CLAUDE.md.
//
// In the Claude Code cloud environment a Chromium binary is pre-installed
// at /opt/pw-browsers/chromium and downloads are disabled; elsewhere
// (CI, local machines) the standard `npx playwright install chromium`
// browser is used.
const preinstalledChromium = '/opt/pw-browsers/chromium';

export default defineConfig({
  testDir: 'e2e',
  use: {
    baseURL: 'http://localhost:4321',
    ...(existsSync(preinstalledChromium)
      ? { launchOptions: { executablePath: preinstalledChromium } }
      : {}),
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
  },
});
