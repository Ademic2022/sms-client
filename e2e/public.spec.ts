import { expect, test } from "@playwright/test";

import { PLATFORM, SCHOOL } from "./helpers";

test("the platform address shows the homepage with pricing", async ({ page }) => {
  await page.goto(PLATFORM);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#pricing")).toContainText("per active student, per term");
  await page.getByRole("link", { name: /Start (your )?free trial/ }).first().click();
  await expect(page).toHaveURL(/\/signup/);
});

test("a school's address goes to its portal, an unknown one shows the homepage", async ({ page }) => {
  await page.goto(SCHOOL);
  await expect(page).toHaveURL(/\/login/); // the portal asks for a sign-in
  await expect(page.getByText("Greenfield Schools").first()).toBeVisible();
  await page.goto("http://nosuchschool.localhost:3100/");
  await expect(page.locator("#pricing")).toBeVisible();
});

test("each school's privacy notice is public", async ({ page }) => {
  await page.goto(`${SCHOOL}/privacy`);
  await expect(page.getByText("Nigeria Data Protection Act 2023").first()).toBeVisible();
});
