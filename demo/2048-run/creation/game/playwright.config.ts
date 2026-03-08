import { defineConfig } from '@playwright/test';
import path from 'path';
export default defineConfig({
  testDir: path.join(__dirname, 'tests'),
  use: {
    headless: true,
  },
  projects: [ { name: 'chromium', use: { channel: 'chrome' } } ]
});
