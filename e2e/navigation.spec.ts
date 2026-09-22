import { test, expect } from "@playwright/test";

test("homepage loads with the hero heading and title", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Spooky Threads/);
  await expect(page.getByRole("heading", { level: 1, name: "🎃 Spooky Threads" })).toBeVisible();
});

test("main navigation links load their pages", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation");

  await nav.getByRole("link", { name: "Collections", exact: true }).click();
  await expect(page).toHaveURL(/\/collections$/);
  await expect(page.getByRole("heading", { level: 1, name: "Collections" })).toBeVisible();

  await page.goto("/");
  await nav.getByRole("link", { name: "Subscriptions", exact: true }).click();
  await expect(page).toHaveURL(/\/subscriptions$/);
  await expect(page.getByRole("heading", { level: 1, name: "Subscription Boxes" })).toBeVisible();

  await page.goto("/");
  await nav.getByRole("link", { name: "Quiz", exact: true }).click();
  await expect(page).toHaveURL(/\/quiz$/);
  await expect(page.getByRole("heading", { level: 1, name: "Which Halloween Trope Are You?" })).toBeVisible();
});
