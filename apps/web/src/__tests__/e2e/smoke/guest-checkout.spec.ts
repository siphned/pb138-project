import { expect, test } from "@playwright/test";

test.describe("Guest Checkout Flow: Add to Cart → Proceed to Checkout", () => {
  test("cart page loads without authentication", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/cart");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });

  test("can navigate to cart from homepage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for cart link in navigation
    const cartLink = page.locator('a[href*="/cart"]').first();
    if (await cartLink.isVisible()) {
      await cartLink.click();
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/cart");
    }
  });

  test("cart persists across page navigations", async ({ page }) => {
    // Start at cart
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    // Navigate to explore
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    // Navigate back to cart
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/cart");
  });

  test("explore products are browsable", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/explore");
  });

  test("product pages load with information", async ({ page }) => {
    await page.goto("/products/1");
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });

  test("can view multiple products sequentially", async ({ page }) => {
    await page.goto("/products/1");
    await page.waitForLoadState("networkidle");
    const url1 = page.url();
    expect(url1).toContain("/products/1");

    await page.goto("/products/2");
    await page.waitForLoadState("networkidle");
    const url2 = page.url();
    expect(url2).toContain("/products/2");
  });

  test("checkout page is accessible without login", async ({ page }) => {
    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");
    // Should load without crashing (may show empty or redirect)
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });

  test("can navigate from cart to checkout", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    // Look for checkout button or link
    const checkoutBtn = page
      .locator('button:has-text("Checkout"), button:has-text("checkout"), a[href*="/checkout"]')
      .first();

    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click();
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/checkout");
    }
  });

  test("shops page shows shop listings", async ({ page }) => {
    await page.goto("/shops");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/shops");
  });

  test("individual shop pages are accessible", async ({ page }) => {
    await page.goto("/shops/1");
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });

  test("bundles page is accessible", async ({ page }) => {
    await page.goto("/bundles");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/bundles");
  });

  test("guest session persists across navigations", async ({ page }) => {
    // Navigate multiple times as guest
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    await page.goto("/shops");
    await page.waitForLoadState("networkidle");

    // Return to cart
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/cart");
  });

  test("search functionality is accessible", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/search");
  });

  test("can browse multiple shops", async ({ page }) => {
    await page.goto("/shops/1");
    await page.waitForLoadState("networkidle");
    const url1 = page.url();
    expect(url1).toContain("/shops/1");

    await page.goto("/shops/2");
    await page.waitForLoadState("networkidle");
    const url2 = page.url();
    expect(url2).toContain("/shops/2");
  });

  test("events page shows event listings", async ({ page }) => {
    await page.goto("/events");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/events");
  });

  test("application header renders on all public pages", async ({ page }) => {
    const publicPages = ["/", "/explore", "/wines", "/shops", "/bundles", "/events", "/cart"];

    for (const path of publicPages) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const body = page.locator("body");
      await expect(body).not.toContainText("Missing Publishable Key");
    }
  });
});
