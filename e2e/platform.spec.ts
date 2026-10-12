import { expect, test } from "@playwright/test";

import { PLATFORM, signIn } from "./helpers";

test("the platform team sees every school and its invoices", async ({ page }) => {
  await signIn(page, "platform", PLATFORM);
  await expect(page).toHaveURL(/\/console/);
  await expect(page.getByRole("cell", { name: /Greenfield Schools/ })).toBeVisible();
  await expect(page.getByText("Subscription invoices")).toBeVisible();
});
