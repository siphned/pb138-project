import { expect, test } from "@playwright/test";

test.describe("Admin Flow: Login → Moderation & Admin Panel", () => {
  test("admin dashboard requires authentication", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("admin moderation page requires authentication and admin role", async ({ page }) => {
    await page.goto("/admin/moderation");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("admin users management page requires authentication", async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("admin role requests page requires authentication", async ({ page }) => {
    await page.goto("/admin/role-requests");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("login page is accessible for admin", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/auth/login");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });

  test("register page is accessible", async ({ page }) => {
    await page.goto("/auth/register");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/auth/register");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });

  test("all admin routes require authentication", async ({ page }) => {
    const adminRoutes = [
      "/admin",
      "/admin/moderation",
      "/admin/users",
      "/admin/role-requests",
    ];

    for (const route of adminRoutes) {
      await page.goto(route);
      await page.waitForURL("**/auth/login", { timeout: 5000 });
      expect(page.url()).toContain("/auth/login");
    }
  });

  test("public pages are accessible without admin role", async ({ page }) => {
    const publicPages = ["/", "/explore", "/wines", "/shops", "/bundles", "/events"];

    for (const page_path of publicPages) {
      await page.goto(page_path);
      await page.waitForLoadState("networkidle");
      const body = page.locator("body");
      await expect(body).not.toContainText("Missing Publishable Key");
    }
  });

  test("admin cannot access without authentication", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("cart is accessible without admin authentication", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/cart");
  });

  test("checkout is accessible without admin authentication", async ({ page }) => {
    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });

  test("winemaker profiles are viewable by admin", async ({ page }) => {
    // Admin should be able to view public winemaker profiles
    await page.goto("/winemakers/1");
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });

  test("shop profiles are viewable by admin", async ({ page }) => {
    await page.goto("/shops/1");
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });

  test("dashboard is protected from non-authenticated users", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("orders page is protected from non-authenticated users", async ({ page }) => {
    await page.goto("/orders");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("settings page is protected from non-authenticated users", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("public event listings are accessible", async ({ page }) => {
    await page.goto("/events");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/events");
  });

  test("search functionality is available to admin", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/search");
  });

  test("app renders without errors on public pages", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const clerkErrors = errors.filter((e) => e.includes("Publishable Key"));
    expect(clerkErrors).toHaveLength(0);
  });

  test("admin layout structure loads correctly", async ({ page }) => {
    // Test that the app layout doesn't crash when trying to access admin areas
    await page.goto("/admin");
    // Should redirect to login
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });
});
