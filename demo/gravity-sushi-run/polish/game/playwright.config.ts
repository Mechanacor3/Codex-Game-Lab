import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './',
  timeout: 30_000,
  use: {
    headless: true,
  },
});
