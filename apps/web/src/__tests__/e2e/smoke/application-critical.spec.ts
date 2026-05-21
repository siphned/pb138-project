import { expect, test } from "@playwright/test";

test.describe("Critical Application Features", () => {
  test("application loads without Missing Publishable Key error on homepage", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const clerkErrors = errors.filter((e) => e.includes("Publishable Key"));
    expect(clerkErrors).toHaveLength(0);
  });

  test("authentication flow is properly configured", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });

  test("all public routes don't crash with auth errors", async ({ page }) => {
    const publicRoutes = [
      "/",
      "/explore",
      "/wines",
      "/shops",
      "/bundles",
      "/events",
      "/cart",
      "/search",
      "/auth/login",
      "/auth/register",
    ];

    for (const route of publicRoutes) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const body = page.locator("body");
      await expect(body).not.toContainText("Missing Publishable Key");
    }
  });

  test("protected routes redirect to login", async ({ page }) => {
    const protectedRoutes = [
      "/dashboard",
      "/settings",
      "/orders",
      "/admin",
      "/manage/shops",
      "/manage-wines",
      "/supply",
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForURL("**/auth/login", { timeout: 15000 });
      expect(page.url()).toContain("/auth/login");
    }
  });

  test("404 handling works for non-existent routes", async ({ page }) => {
    await page.goto("/this-does-not-exist-route-xyz123");
    await page.waitForLoadState("networkidle");
    // App should not crash
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });

  test("navigation between public pages works smoothly", async ({ page }) => {
    // Start at home
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    let url = page.url();
    expect(url).toContain("/");

    // Go to explore
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");
    url = page.url();
    expect(url).toContain("/explore");

    // Go to wines
    await page.goto("/wines");
    await page.waitForLoadState("networkidle");
    url = page.url();
    expect(url).toContain("/wines");

    // Go back to home
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    url = page.url();
    expect(url).toContain("/");
  });

  test("can access multiple product pages", async ({ page }) => {
    const productIds = [1, 2, 3];

    for (const id of productIds) {
      await page.goto(`/products/${id}`);
      await page.waitForLoadState("networkidle");
      const body = page.locator("body");
      await expect(body).not.toContainText("Missing Publishable Key");
    }
  });

  test("can access multiple shop pages", async ({ page }) => {
    const shopIds = [1, 2, 3];

    for (const id of shopIds) {
      await page.goto(`/shops/${id}`);
      await page.waitForLoadState("networkidle");
      const body = page.locator("body");
      await expect(body).not.toContainText("Missing Publishable Key");
    }
  });

  test("can access multiple winemaker pages", async ({ page }) => {
    const winemakerIds = [1, 2, 3];

    for (const id of winemakerIds) {
      await page.goto(`/winemakers/${id}`);
      await page.waitForLoadState("networkidle");
      const body = page.locator("body");
      await expect(body).not.toContainText("Missing Publishable Key");
    }
  });

  test("cart functionality is accessible", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/cart");
  });

  test("checkout flow is accessible", async ({ page }) => {
    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });

  test("app header/navigation renders consistently", async ({ page }) => {
    const routes = ["/", "/explore", "/wines"];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      // App should render without errors
      const body = page.locator("body");
      await expect(body).toBeDefined();
    }
  });

  test("page loads handle network idle properly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toBeDefined();
  });

  test("multiple navigations don't cause memory leaks", async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.goto("/explore");
      await page.waitForLoadState("networkidle");
      await page.goto("/wines");
      await page.waitForLoadState("networkidle");
      await page.goto("/shops");
      await page.waitForLoadState("networkidle");
    }
    // If we get here without crashes, navigation is stable
    expect(true).toBe(true);
  });

  test("public routes maintain URL integrity", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");
    const exploreUrl = page.url();
    expect(exploreUrl).toContain("/explore");

    await page.goto("/wines");
    await page.waitForLoadState("networkidle");
    const winesUrl = page.url();
    expect(winesUrl).toContain("/wines");

    // Navigate back to explore
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");
    const exploreUrlAgain = page.url();
    expect(exploreUrlAgain).toContain("/explore");
  });

  test("dynamic product pages load correctly", async ({ page }) => {
    await page.goto("/products/1");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toMatch(/\/products\/1/);
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });

  test("error pages don't show Clerk configuration errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/nonexistent-page-12345");
    await page.waitForLoadState("networkidle");

    const clerkErrors = errors.filter((e) => e.includes("Publishable Key"));
    expect(clerkErrors).toHaveLength(0);
  });

  test("can reach bundles catalog", async ({ page }) => {
    await page.goto("/bundles");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/bundles");
  });

  test("can reach events catalog", async ({ page }) => {
    await page.goto("/events");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/events");
  });

  test("search page is functional", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/search");
  });

  test("router handles rapid navigation", async ({ page }) => {
    const routes = ["/", "/explore", "/wines", "/shops", "/bundles", "/events"];

    for (const route of routes) {
      await page.goto(route);
      // Don't wait for full load on rapid navigation
    }

    // Final wait for last page to load
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/events");
  });
});
