import { expect, test } from "@playwright/test";

test.describe("Critical flows", () => {
  test("homepage → explore link navigates to /explore", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const exploreLink = page.locator('a[href="/explore"]').first();
    if (await exploreLink.isVisible()) {
      await exploreLink.click();
      await expect(page).toHaveURL(/\/explore/);
    }
  });

  test("product detail → winemaker link navigates to winemaker profile", async ({ page }) => {
    await page.goto("/products/1");
    await page.waitForLoadState("networkidle");
    const winemakerLink = page.locator('a[href*="/winemakers/"]').first();
    if (await winemakerLink.isVisible()) {
      await winemakerLink.click();
      await expect(page).toHaveURL(/\/winemakers\//);
    }
  });

  test("cart → checkout navigates to /checkout", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    const checkoutBtn = page.getByRole("button", { name: /checkout|order/i });
    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click();
      await expect(page).toHaveURL(/\/checkout/);
    }
  });
});
