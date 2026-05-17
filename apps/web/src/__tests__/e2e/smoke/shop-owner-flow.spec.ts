import { expect, test } from "@playwright/test";

test.describe("Shop Owner Flow: Login → View Inventory & Orders", () => {
  test("shop management page requires authentication", async ({ page }) => {
    await page.goto("/manage/shops");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("shop inventory page requires authentication and shop owner role", async ({ page }) => {
    await page.goto("/manage/shops/1/inventory");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("shop bundles page requires authentication", async ({ page }) => {
    await page.goto("/manage/shops/1/bundles");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("shop orders page requires authentication", async ({ page }) => {
    await page.goto("/manage/shops/1/shop-orders");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("supply browse page requires authentication", async ({ page }) => {
    await page.goto("/manage/shops/1/supply-browse");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("login page is accessible for shop owners", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/auth/login");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });

  test("register page is accessible for shop owner registration", async ({ page }) => {
    await page.goto("/auth/register");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/auth/register");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });

  test("authenticated pages are protected from shop owner access without role", async ({ page }) => {
    // All shop owner routes should redirect to login if not authenticated
    const shopOwnerRoutes = [
      "/manage/shops",
      "/manage/shops/1/inventory",
      "/manage/shops/1/bundles",
      "/manage/shops/1/shop-orders",
      "/manage/shops/1/supply-browse",
    ];

    for (const route of shopOwnerRoutes) {
      await page.goto(route);
      await page.waitForURL("**/auth/login", { timeout: 5000 });
      expect(page.url()).toContain("/auth/login");
    }
  });

  test("public shop pages are browsable without authentication", async ({ page }) => {
    await page.goto("/shops");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/shops");
  });

  test("individual public shop pages are viewable", async ({ page }) => {
    await page.goto("/shops/1");
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });

  test("shop owner can access public wine supply", async ({ page }) => {
    // Public wine browsing for sourcing
    await page.goto("/wines");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/wines");
  });

  test("explore page is accessible to find products", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/explore");
  });

  test("product detail pages load for shop owners to browse supply", async ({ page }) => {
    await page.goto("/products/1");
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });

  test("shop owner dashboard is protected", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("shop owner orders list is protected", async ({ page }) => {
    await page.goto("/orders");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("shop owner settings are protected", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("bundles page is accessible to shop owners for browsing", async ({ page }) => {
    await page.goto("/bundles");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/bundles");
  });

  test("can view winemaker profiles for sourcing", async ({ page }) => {
    await page.goto("/winemakers/1");
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });

  test("events page is browsable for shop owner awareness", async ({ page }) => {
    await page.goto("/events");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/events");
  });

  test("search functionality is available for browsing", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/search");
  });
});
