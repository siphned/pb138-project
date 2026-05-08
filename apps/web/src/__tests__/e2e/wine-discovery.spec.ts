import { expect, test } from "@playwright/test";

test.describe("Wine Discovery & Winemaker Profiles", () => {
  test("Wine Detail page shows shop availability and reviews", async ({ page }) => {
    // Navigate to catalog
    await page.goto("/wines");
    await page.waitForLoadState("networkidle");

    // Click on the first wine card
    const firstWine = page.locator("a[href^='/wines/']").first();
    await firstWine.click();

    // Verify detail page elements
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/available in shops/i)).toBeVisible();
    await expect(page.getByText(/wine reviews/i)).toBeVisible();

    // Verify winemaker link
    await expect(page.getByRole("heading", { name: /about the winemaker/i })).toBeVisible();
    await page.getByRole("button", { name: /visit profile/i }).click();

    // Verify we reached winemaker profile
    await expect(page).toHaveURL(/\/winemakers\//);
  });

  test("Winemaker Profile page tabs switching", async ({ page }) => {
    // Navigate to a known winemaker (or find one from catalog)
    await page.goto("/wines");
    await page.waitForLoadState("networkidle");
    await page.locator("a[href^='/wines/']").first().click();
    await page.getByRole("button", { name: /visit profile/i }).click();

    // Verify tabs
    await expect(page.getByRole("tab", { name: /wines/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /events/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /reviews/i })).toBeVisible();

    // Switch to Events
    await page.getByRole("tab", { name: /events/i }).click();
    await expect(page.getByRole("heading", { name: /upcoming events/i })).toBeVisible();

    // Switch to Reviews
    await page.getByRole("tab", { name: /reviews/i }).click();
    await expect(page.getByRole("heading", { name: /winemaker reviews/i })).toBeVisible();
  });
});
