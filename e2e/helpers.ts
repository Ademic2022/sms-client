import { expect, type Page } from "@playwright/test";

export const PASSWORD = "demo-pass-2026";
export const SCHOOL = "http://greenfield.localhost:3100";
export const PLATFORM = "http://localhost:3100";

export const ACCOUNTS = {
  owner: "08030000001",
  admin: "08030000002",
  bursar: "08030000003",
  teacher: "08030000004",
  parent: "08060000001",
  platform: "admin@platform.test",
} as const;

export async function signIn(page: Page, who: keyof typeof ACCOUNTS, base = SCHOOL) {
  await page.goto(`${base}/login`);
  await page.getByLabel("Phone number or email").fill(ACCOUNTS[who]);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).not.toHaveURL(/\/login/);
}
