import { expect, test } from "@playwright/test";

import { signIn } from "./helpers";

test("the owner sees the school at a glance", async ({ page }) => {
  await signIn(page, "owner");
  await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening), Adaeze/ })).toBeVisible();
  await page.getByRole("link", { name: "Students" }).first().click();
  await expect(page.getByText("24 active")).toBeVisible();
});

test("the owner can open every settings page", async ({ page }) => {
  await signIn(page, "owner");
  for (const [path, text] of [
    ["/settings", "School profile"],
    ["/settings/academics", "Sessions and terms"],
    ["/settings/staff", "Staff"],
    ["/settings/privacy", "Privacy notice"],
    ["/settings/billing", "SMS units"],
  ]) {
    await page.goto(path);
    await expect(page.getByText(text).first(), path).toBeVisible();
  }
});

test("the bursar exports payments for the accountant", async ({ page }) => {
  await signIn(page, "bursar");
  await page.goto("/fees/payments");
  await page.getByRole("button", { name: "Export" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download" }).click();
  expect((await download).suggestedFilename()).toMatch(/^payments-.*\.xlsx$/);
});

test("dialogs keep focus while typing", async ({ page }) => {
  await signIn(page, "owner");
  await page.goto("/settings/academics");
  await page.getByRole("button", { name: "New session" }).click();
  await page.keyboard.type("2027/2028");
  await expect(page.getByRole("dialog").getByLabel("Name", { exact: true })).toHaveValue("2027/2028");
});

test("a teacher cannot open school settings", async ({ page }) => {
  await signIn(page, "teacher");
  await page.goto("/settings/billing");
  await expect(page.getByText("Only the school owner or an administrator can manage billing.")).toBeVisible();
});
