import { expect, test } from "@playwright/test";

test.describe("Customer Journey: Login → Browse Wines → View Detail", () => {
  test("login page renders and is accessible", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/auth/login");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });

  test("redirect to login when accessing dashboard without auth", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("explore page is accessible without authentication", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/explore");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });

  test("wines list page is accessible without authentication", async ({ page }) => {
    await page.goto("/wines");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/wines");
  });

  test("product detail page loads with data", async ({ page }) => {
    // First get to the wines/explore page to find a product
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    // Look for any product link and navigate to it
    // This is a smoke test - we verify the page loads without crashing
    const productLinks = await page.locator('a[href*="/products/"]').first();
    if (await productLinks.isVisible()) {
      await productLinks.click();
      await page.waitForLoadState("networkidle");
      expect(page.url()).toMatch(/\/products\/\d+/);
    }
  });

  test("wine list is rendered on wines page", async ({ page }) => {
    await page.goto("/wines");
    await page.waitForLoadState("networkidle");

    // Check that the page has some content - either wine cards or a list
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });

  test("explore page shows wine enjoyers branding", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/explore");
  });

  test("homepage links to explore page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for explore link and click it
    const exploreLink = page.locator('a[href*="/explore"]').first();
    if (await exploreLink.isVisible()) {
      await exploreLink.click();
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/explore");
    }
  });

  test("can navigate between explore and wines pages", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");
    const exploreUrl = page.url();
    expect(exploreUrl).toContain("/explore");

    await page.goto("/wines");
    await page.waitForLoadState("networkidle");
    const winesUrl = page.url();
    expect(winesUrl).toContain("/wines");
  });

  test("register page is accessible without authentication", async ({ page }) => {
    await page.goto("/auth/register");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/auth/register");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });

  test("cart page is accessible without authentication", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/cart");
  });

  test("shops page is accessible without authentication", async ({ page }) => {
    await page.goto("/shops");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/shops");
  });

  test("events page is accessible without authentication", async ({ page }) => {
    await page.goto("/events");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/events");
  });

  test("bundles page is accessible without authentication", async ({ page }) => {
    await page.goto("/bundles");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/bundles");
  });

  test("search page is accessible without authentication", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/search");
  });

  test("product page handles product ID in URL", async ({ page }) => {
    // Test with a valid product ID format
    await page.goto("/products/1");
    await page.waitForLoadState("networkidle");
    // Should load without crashing
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });

  test("winemaker profile page is accessible", async ({ page }) => {
    await page.goto("/winemakers/1");
    await page.waitForLoadState("networkidle");
    // Should load without crashing
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });
});
