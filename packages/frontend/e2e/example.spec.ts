import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/ThreadFileSharing/);
});

test("navigation works", async ({ page }) => {
  await page.goto("/");

  // Click on a link or button
  // await page.click('text=Get started');
  // await expect(page).toHaveURL(/\/getting-started/);
});
