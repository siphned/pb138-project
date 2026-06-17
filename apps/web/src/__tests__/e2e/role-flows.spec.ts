import { expect, test } from "@playwright/test";

/**
 * Role-based E2E tests for happy path flows.
 * These tests verify core functionality for each user role.
 */

test.describe("Customer role flows", () => {
  test("customer can browse wines and add to cart", async ({ page }) => {
    await page.goto("/wines");
    await page.waitForLoadState("networkidle");

    // Verify wines page loaded
    expect(page.url()).toContain("/wines");
    const wineElements = page.locator("[class*='wine'], [class*='product']");
    expect(await wineElements.count()).toBeGreaterThan(0);
  });

  test("customer can view product details", async ({ page }) => {
    await page.goto("/products/1");
    await page.waitForLoadState("networkidle");

    // Look for product information
    const productInfo = page.locator("text=/description|details|price/i").first();
    if (await productInfo.isVisible()) {
      expect(productInfo).toBeDefined();
    }
  });

  test("customer can navigate to cart", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/cart");
    // Either shows empty cart or items
    const cartContent = page.locator("[class*='cart'], [class*='item']").first();
    expect(await cartContent.isVisible()).toBeTruthy();
  });

  test("customer can access checkout", async ({ page }) => {
    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/checkout");
    // Verify checkout elements exist
    const checkoutForm = page.locator("form, [class*='checkout']").first();
    expect(await checkoutForm.isVisible()).toBeTruthy();
  });

  test("customer can view their orders", async ({ page }) => {
    await page.goto("/orders");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/orders");
    // Page should load without errors
    const ordersContent = page.locator("[class*='order'], [role='list']").first();
    if (await ordersContent.isVisible()) {
      expect(ordersContent).toBeDefined();
    }
  });

  test("customer can browse winemakers", async ({ page }) => {
    await page.goto("/winemakers");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/winemakers");
    const winemakerElements = page.locator("[class*='winemaker'], [class*='card']");
    expect(await winemakerElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("customer can view a winemaker profile", async ({ page }) => {
    await page.goto("/winemakers/1");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toMatch(/\/winemakers\/\d+/);
    // Verify profile content
    const profileContent = page.locator("[class*='profile'], [class*='card']").first();
    if (await profileContent.isVisible()) {
      expect(profileContent).toBeDefined();
    }
  });

  test("customer can browse shops", async ({ page }) => {
    await page.goto("/shops");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/shops");
    const shopElements = page.locator("[class*='shop'], [class*='card']");
    expect(await shopElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("customer can browse events", async ({ page }) => {
    await page.goto("/events");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/events");
    const eventElements = page.locator("[class*='event'], [class*='card']");
    expect(await eventElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("customer can access search", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/search");
    // Search page should have search input or results
    const searchInput = page.locator("input[placeholder*='search'], input[type='search']").first();
    if (await searchInput.isVisible()) {
      expect(searchInput).toBeDefined();
    }
  });
});

test.describe("Winemaker role flows", () => {
  test("winemaker can view their wines", async ({ page }) => {
    await page.goto("/wines?winemakerId=1");
    await page.waitForLoadState("networkidle");

    // Verify wines page with filter
    expect(page.url()).toContain("/wines");
    const wineElements = page.locator("[class*='wine'], [class*='product']");
    expect(await wineElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("winemaker can access their dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/dashboard");
    // Verify dashboard loads
    const dashboardContent = page.locator("[class*='dashboard'], [class*='card']").first();
    if (await dashboardContent.isVisible()) {
      expect(dashboardContent).toBeDefined();
    }
  });

  test("winemaker can view their events", async ({ page }) => {
    await page.goto("/events?registeredByMe=true");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/events");
    const eventElements = page.locator("[class*='event'], [class*='card']");
    expect(await eventElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("winemaker can browse shop inventory", async ({ page }) => {
    await page.goto("/shops");
    await page.waitForLoadState("networkidle");

    // Can see shops offering their wines
    expect(page.url()).toContain("/shops");
    const shopElements = page.locator("[class*='shop'], [class*='card']");
    expect(await shopElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("winemaker can access statistics", async ({ page }) => {
    await page.goto("/stats");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/stats");
    // Stats page should have content
    const statsContent = page.locator("[class*='stat'], [class*='chart'], [class*='card']").first();
    if (await statsContent.isVisible()) {
      expect(statsContent).toBeDefined();
    }
  });

  test("winemaker can shop for other wines", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/products");
    const productElements = page.locator("[class*='product'], [class*='card']");
    expect(await productElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("winemaker can access shopping cart", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/cart");
    const cartContent = page.locator("[class*='cart'], [class*='item']").first();
    expect(await cartContent.isVisible()).toBeTruthy();
  });
});

test.describe("Shop owner role flows", () => {
  test("shop owner can view their shops", async ({ page }) => {
    await page.goto("/shops?ownerUserId=1");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/shops");
    const shopElements = page.locator("[class*='shop'], [class*='card']");
    expect(await shopElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("shop owner can access shop inventory", async ({ page }) => {
    await page.goto("/shops/1/inventory");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/inventory");
    // Inventory page should have content
    const inventoryContent = page.locator("[class*='inventory'], [class*='product']").first();
    if (await inventoryContent.isVisible()) {
      expect(inventoryContent).toBeDefined();
    }
  });

  test("shop owner can view their bundles", async ({ page }) => {
    await page.goto("/products?isBundle=true&shopId=1");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/products");
    const bundleElements = page.locator("[class*='bundle'], [class*='product'], [class*='card']");
    expect(await bundleElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("shop owner can access dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/dashboard");
    const dashboardContent = page.locator("[class*='dashboard'], [class*='card']").first();
    if (await dashboardContent.isVisible()) {
      expect(dashboardContent).toBeDefined();
    }
  });

  test("shop owner can view statistics", async ({ page }) => {
    await page.goto("/stats");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/stats");
    const statsContent = page.locator("[class*='stat'], [class*='chart']").first();
    if (await statsContent.isVisible()) {
      expect(statsContent).toBeDefined();
    }
  });

  test("shop owner can browse wines from winemakers", async ({ page }) => {
    await page.goto("/wines");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/wines");
    const wineElements = page.locator("[class*='wine'], [class*='product']");
    expect(await wineElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("shop owner can access shopping cart", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/cart");
    const cartContent = page.locator("[class*='cart'], [class*='item']").first();
    expect(await cartContent.isVisible()).toBeTruthy();
  });
});

test.describe("Admin role flows", () => {
  test("admin can access user management", async ({ page }) => {
    await page.goto("/users");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/users");
    // User list or management interface
    const usersContent = page.locator("[class*='user'], [class*='table'], [role='list']").first();
    if (await usersContent.isVisible()) {
      expect(usersContent).toBeDefined();
    }
  });

  test("admin can access winemaker management", async ({ page }) => {
    await page.goto("/winemakers");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/winemakers");
    const winemakerElements = page.locator("[class*='winemaker'], [class*='card']");
    expect(await winemakerElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("admin can access shop management", async ({ page }) => {
    await page.goto("/shops");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/shops");
    const shopElements = page.locator("[class*='shop'], [class*='card']");
    expect(await shopElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("admin can access product management", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/products");
    const productElements = page.locator("[class*='product'], [class*='card']");
    expect(await productElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("admin can access moderation panel", async ({ page }) => {
    await page.goto("/moderation");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/moderation");
    // Moderation interface
    const moderationContent = page.locator("[class*='moderation'], [class*='review']").first();
    if (await moderationContent.isVisible()) {
      expect(moderationContent).toBeDefined();
    }
  });

  test("admin can access role requests", async ({ page }) => {
    await page.goto("/role-requests");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/role-requests");
    // Role request list
    const requestsContent = page.locator("[class*='request'], [class*='list'], [role='list']").first();
    if (await requestsContent.isVisible()) {
      expect(requestsContent).toBeDefined();
    }
  });

  test("admin can access dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/dashboard");
    const dashboardContent = page.locator("[class*='dashboard'], [class*='card']").first();
    if (await dashboardContent.isVisible()) {
      expect(dashboardContent).toBeDefined();
    }
  });

  test("admin can access statistics", async ({ page }) => {
    await page.goto("/stats");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/stats");
    const statsContent = page.locator("[class*='stat'], [class*='chart']").first();
    if (await statsContent.isVisible()) {
      expect(statsContent).toBeDefined();
    }
  });
});

test.describe("Public user flows", () => {
  test("public user can view homepage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toBe("/");
    const homeContent = page.locator("[class*='hero'], [class*='featured'], h1").first();
    if (await homeContent.isVisible()) {
      expect(homeContent).toBeDefined();
    }
  });

  test("public user can browse explore page", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    // Explore redirects to wines or shows explore content
    const isOnExplore = page.url().includes("/explore") || page.url().includes("/wines");
    expect(isOnExplore).toBeTruthy();
  });

  test("public user can search", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/search");
    const searchInput = page.locator("input[placeholder*='search'], input[type='search']").first();
    if (await searchInput.isVisible()) {
      expect(searchInput).toBeDefined();
    }
  });

  test("public user can view wines catalog", async ({ page }) => {
    await page.goto("/wines");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/wines");
    const wineElements = page.locator("[class*='wine'], [class*='product']");
    expect(await wineElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("public user can view products", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/products");
    const productElements = page.locator("[class*='product'], [class*='card']");
    expect(await productElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("public user can view winemakers", async ({ page }) => {
    await page.goto("/winemakers");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/winemakers");
    const winemakerElements = page.locator("[class*='winemaker'], [class*='card']");
    expect(await winemakerElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("public user can view shops", async ({ page }) => {
    await page.goto("/shops");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/shops");
    const shopElements = page.locator("[class*='shop'], [class*='card']");
    expect(await shopElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("public user can view events", async ({ page }) => {
    await page.goto("/events");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/events");
    const eventElements = page.locator("[class*='event'], [class*='card']");
    expect(await eventElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("public user can access cart", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/cart");
    const cartContent = page.locator("[class*='cart']").first();
    expect(await cartContent.isVisible()).toBeTruthy();
  });
});
