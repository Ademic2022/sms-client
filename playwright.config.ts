import { existsSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";

/**
 * Browser tests. They start their own Django (port 8100, on a throwaway SQLite database
 * seeded with the demo school) and Next.js (port 3100), so they never touch your data.
 * The server repository must be checked out next to this one, as ../akademiq-server (its
 * name on GitHub) or ../sms-server, or set SERVER_DIR.
 *
 *   npm run e2e            # headless
 *   npx playwright test --ui
 */
const DB = "/tmp/akademiq-e2e.sqlite3";
const SERVER_DIR = process.env.SERVER_DIR ?? (existsSync("../akademiq-server") ? "../akademiq-server" : "../sms-server");
const serverEnv = {
  LOAD_DOTENV: "false", // ignore the server's .env: tests must not use real keys or settings
  DATABASE_URL: `sqlite:///${DB}`,
  DEBUG: "true",
  TENANT_BASE_DOMAIN: "localhost",
  ALLOWED_HOSTS: ".localhost,localhost,127.0.0.1",
  CSRF_TRUSTED_ORIGINS: "http://*.localhost:3100,http://localhost:3100",
  PAYMENT_PROVIDER: "fake",
  SMS_PROVIDER: "console",
  LOG_REQUESTS: "false",
};

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1, // one shared database
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://greenfield.localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...devices["Desktop Chrome"],
    channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome",
  },
  webServer: [
    {
      command: `rm -f ${DB}* && uv run python manage.py migrate --noinput -v 0 && uv run python manage.py seed_demo && uv run python manage.py runserver 127.0.0.1:8100 --noreload`,
      cwd: SERVER_DIR,
      env: serverEnv,
      url: "http://127.0.0.1:8100/healthz",
      stderr: process.env.E2E_SERVER_LOGS ? "pipe" : "ignore", // E2E_SERVER_LOGS=1 to see Django's request log
      timeout: 240_000,
      reuseExistingServer: false,
    },
    {
      command: "npx next dev -p 3100",
      env: { API_ORIGIN: "http://127.0.0.1:8100", TENANT_BASE_DOMAIN: "localhost" },
      url: "http://localhost:3100/login",
      timeout: 240_000,
      reuseExistingServer: false,
    },
  ],
});
