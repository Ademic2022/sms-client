import { expect, test } from "@playwright/test";

import { signIn } from "./helpers";

// One story, in order: the principal publishes a class, then a parent in that class signs in.
test.describe.configure({ mode: "serial" });

test("the principal approves and publishes JSS 1A", async ({ page }) => {
  await signIn(page, "owner");
  await page.goto("/results");
  await page.getByRole("cell", { name: "JSS 1A", exact: true }).click();
  await page.getByRole("button", { name: "Approve and lock" }).click();
  const anyway = page.getByRole("button", { name: "Approve anyway" });
  if (await anyway.isVisible().catch(() => false)) await anyway.click(); // the seed leaves a few scores blank
  await page.getByRole("button", { name: "Publish to parents" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Publish now" }).click();
  await expect(page.getByText("Published", { exact: false }).first()).toBeVisible();
});

test("a parent gives consent, opens the report card and pays online", async ({ page }) => {
  await signIn(page, "parent");
  // First visit: the privacy notice comes before anything else, and cannot be skipped.
  await expect(page).toHaveURL(/\/parent\/consent/);
  await page.goto("/parent");
  await expect(page).toHaveURL(/\/parent\/consent/);
  await page.getByRole("button", { name: "I agree" }).click();
  await expect(page).toHaveURL(/\/parent$/);

  await page.getByRole("link", { name: /Results and payment history/ }).first().click();
  const card = page.getByRole("link", { name: "Report card" });
  await expect(card).toBeVisible();
  const pdf = await page.request.get((await card.getAttribute("href")) as string);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toMatch(/application\/pdf|text\/html/);

  // Pay ₦10,000 through the development payment page, which stands in for Paystack.
  await page.goto("/parent");
  await page.getByPlaceholder("0").first().fill("10000");
  await page.getByRole("button", { name: "Pay ₦10,000" }).click();
  await expect(page.getByText("Payment received")).toBeVisible({ timeout: 20_000 });
});
