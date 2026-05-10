import { expect, test } from "@playwright/test";

test.describe("Wine Discovery & Winemaker Profiles", () => {
  test("Product detail page shows shop info, reviews, and winemaker link", async ({ page }) => {
    await page.goto("/wines");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForLoadState("networkidle", { timeout: 60000 });

    const firstProduct = page.locator("a[href^='/products/']").first();
    await page.waitForSelector("a[href^='/products/']");
    await firstProduct.click();
    await page.waitForLoadState("networkidle", { timeout: 60000 });

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/sold at/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /customer reviews/i })).toBeVisible();

    const winemakerLink = page.locator("a[href^='/winemakers/']").first();
    await expect(winemakerLink).toBeVisible();
    await winemakerLink.click();

    await expect(page).toHaveURL(/\/winemakers\//);
  });

  test("Winemaker Profile page tabs switching", async ({ page }) => {
    await page.goto("/wines");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForLoadState("networkidle", { timeout: 60000 });
    await page.locator("a[href^='/products/']").first().click();
    await page.waitForLoadState("networkidle", { timeout: 60000 });
    await page.locator("a[href^='/winemakers/']").first().click();
    await page.waitForLoadState("networkidle", { timeout: 60000 });

    await expect(page.getByRole("tab", { name: /wines/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /events/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /reviews/i })).toBeVisible();

    await page.getByRole("tab", { name: /events/i }).click();
    await expect(page.getByRole("heading", { name: /upcoming events/i })).toBeVisible();

    await page.getByRole("tab", { name: /reviews/i }).click();
    await expect(page.getByRole("heading", { name: /winemaker reviews/i })).toBeVisible();
  });
});
