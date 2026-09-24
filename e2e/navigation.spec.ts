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

test("desktop width shows the full nav bar with no hamburger button", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
  await expect(
    page.getByRole("navigation").getByRole("link", { name: "Collections", exact: true })
  ).toBeVisible();
});

test.describe("hamburger menu at tablet width and below", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test("nav is tucked away until the hamburger button opens it", async ({ page }) => {
    await page.goto("/");
    const menu = page.locator("#site-menu");

    await expect(menu).toBeHidden();

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(menu).toBeVisible();
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");

    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(menu).toBeHidden();
  });

  test("tapping a link navigates and closes the menu", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation").getByRole("link", { name: "Quiz", exact: true }).click();

    await expect(page).toHaveURL(/\/quiz$/);
    await expect(page.locator("#site-menu")).toBeHidden();
  });

  test("sections with sub-links expand from their chevron", async ({ page }) => {
    await page.goto("/");
    const halloween = page.getByRole("navigation").getByRole("link", { name: "Halloween", exact: true });

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(halloween).toBeHidden();

    await page.getByRole("button", { name: "Collections links" }).click();
    await expect(halloween).toBeVisible();
  });
});
