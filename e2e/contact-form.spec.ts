import { test, expect } from "@playwright/test";

test("submitting the contact form shows a success confirmation", async ({ page }) => {
  await page.goto("/contact");

  await page.getByLabel("Name").fill("Playwright Test");
  await page.getByLabel("Email").fill(`playwright-${Date.now()}@example.com`);
  await page.getByLabel("What's this about?").selectOption("general");
  await page.getByLabel("Message").fill("This is an automated end-to-end test message.");

  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByRole("heading", { name: "Message sent!" })).toBeVisible();
  await expect(page.getByText(/thanks for reaching out/i)).toBeVisible();
});
