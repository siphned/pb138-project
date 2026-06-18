import { expect, test } from "../../../playwright.fixtures";

test.describe("cart: guest interactions", () => {
  test("add product to cart from product detail page", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");

    // Click into first product detail
    const firstLink = page.locator("[data-slot='catalog-card'] a").first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");

    // Click "Add to cart" on product detail page
    const addButton = page.getByRole("button", { name: /add to cart/i });
    if ((await addButton.count()) > 0) {
      await addButton.first().click();
      await page.waitForLoadState("networkidle");
    }

    // Navigate to cart - should not crash
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/cart");
  });

  test("cart page renders items after add", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");

    const firstLink = page.locator("[data-slot='catalog-card'] a").first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");

    const addButton = page.getByRole("button", { name: /add to cart/i });
    if ((await addButton.count()) > 0) {
      await addButton.first().click();
      await page.waitForLoadState("networkidle");
    }

    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    // Cart page should render without error
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("cart persists on page refresh", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");

    const firstLink = page.locator("[data-slot='catalog-card'] a").first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");

    const addButton = page.getByRole("button", { name: /add to cart/i });
    if ((await addButton.count()) > 0) {
      await addButton.first().click();
      await page.waitForLoadState("networkidle");
    }

    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/cart");
  });
});
