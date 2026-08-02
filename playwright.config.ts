import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

// Next loads .env.local for the dev server, but the test runner is a
// separate process. Without this the admin specs sign in with a stale
// default password while the server expects the real one.
loadEnv({ path: ".env.local", quiet: true });

export default defineConfig({
  testDir: "./tests",
  // The admin specs create, hide and delete real products in the same
  // database the storefront specs read. Running them concurrently makes
  // the catalogue shift underneath a test that is mid-assertion, which
  // shows up as phantom "element not found" failures.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 14"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
