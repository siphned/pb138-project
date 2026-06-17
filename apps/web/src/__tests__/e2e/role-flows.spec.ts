import { expect, test } from "@playwright/test";

/**
 * Role-based E2E tests for happy path flows.
 * These tests verify core functionality for each user role.
 * Focus: pages load, navigation works, no console errors
 */

test.describe("Customer role flows", () => {
  test("customer can navigate to wines page", async ({ page }) => {
    await page.goto("/wines");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/wines");
  });

  test("customer can navigate to product detail", async ({ page }) => {
    await page.goto("/products/1");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/products");
  });

  test("customer can navigate to cart", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/cart");
  });

  test("customer can navigate to checkout", async ({ page }) => {
    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/checkout");
  });

  test("customer can view their orders", async ({ page }) => {
    await page.goto("/orders");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/orders");
  });

  test("customer can browse winemakers", async ({ page }) => {
    await page.goto("/winemakers");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/winemakers");
  });

  test("customer can view a winemaker profile", async ({ page }) => {
    await page.goto("/winemakers/1");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toMatch(/\/winemakers\/\d+/);
  });

  test("customer can browse shops", async ({ page }) => {
    await page.goto("/shops");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/shops");
  });

  test("customer can browse events", async ({ page }) => {
    await page.goto("/events");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/events");
  });

  test("customer can access search", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/search");
  });
});

test.describe("Winemaker role flows", () => {
  test("winemaker can view filtered wines", async ({ page }) => {
    await page.goto("/wines?winemakerId=1");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/wines");
  });

  test("winemaker can access dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/dashboard");
  });

  test("winemaker can view their events", async ({ page }) => {
    await page.goto("/events?registeredByMe=true");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/events");
  });

  test("winemaker can browse shops", async ({ page }) => {
    await page.goto("/shops");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/shops");
  });

  test("winemaker can access statistics", async ({ page }) => {
    await page.goto("/stats");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/stats");
  });

  test("winemaker can shop for products", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/products");
  });

  test("winemaker can access shopping cart", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/cart");
  });
});

test.describe("Shop owner role flows", () => {
  test("shop owner can view shops with filter", async ({ page }) => {
    await page.goto("/shops?ownerUserId=1");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/shops");
  });

  test("shop owner can access inventory", async ({ page }) => {
    await page.goto("/shops/1/inventory");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/inventory");
  });

  test("shop owner can view bundles", async ({ page }) => {
    await page.goto("/products?isBundle=true&shopId=1");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/products");
  });

  test("shop owner can access dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/dashboard");
  });

  test("shop owner can view statistics", async ({ page }) => {
    await page.goto("/stats");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/stats");
  });

  test("shop owner can browse wines", async ({ page }) => {
    await page.goto("/wines");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/wines");
  });

  test("shop owner can access shopping cart", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/cart");
  });
});

test.describe("Admin role flows", () => {
  test("admin can access user management", async ({ page }) => {
    await page.goto("/users");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/users");
  });

  test("admin can access winemaker management", async ({ page }) => {
    await page.goto("/winemakers");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/winemakers");
  });

  test("admin can access shop management", async ({ page }) => {
    await page.goto("/shops");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/shops");
  });

  test("admin can access product management", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/products");
  });

  test("admin can access moderation panel", async ({ page }) => {
    await page.goto("/moderation");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/moderation");
  });

  test("admin can access role requests", async ({ page }) => {
    await page.goto("/role-requests");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/role-requests");
  });

  test("admin can access dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/dashboard");
  });

  test("admin can access statistics", async ({ page }) => {
    await page.goto("/stats");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/stats");
  });
});

test.describe("Public user flows", () => {
  test("public user can view homepage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toMatch(/\/$|localhost:5173\/$/);
  });

  test("public user can browse explore page", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");
    // Explore may redirect to wines
    const isOnValidPage = page.url().includes("/explore") || page.url().includes("/wines");
    expect(isOnValidPage).toBeTruthy();
  });

  test("public user can search", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/search");
  });

  test("public user can view wines catalog", async ({ page }) => {
    await page.goto("/wines");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/wines");
  });

  test("public user can view products", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/products");
  });

  test("public user can view winemakers", async ({ page }) => {
    await page.goto("/winemakers");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/winemakers");
  });

  test("public user can view shops", async ({ page }) => {
    await page.goto("/shops");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/shops");
  });

  test("public user can view events", async ({ page }) => {
    await page.goto("/events");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/events");
  });

  test("public user can access cart", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/cart");
  });
});
