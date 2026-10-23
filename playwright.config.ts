import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // Look in the tests folder
  testMatch: '**/*.spec.ts', // BUT only run files ending in .spec.ts
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});