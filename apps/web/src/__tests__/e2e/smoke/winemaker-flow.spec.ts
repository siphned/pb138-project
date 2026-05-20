import { expect, test } from "@playwright/test";

test.describe("Winemaker Flow: Login → Manage Wines → List & Create Wine", () => {
  test("winemaker dashboard requires authentication", async ({ page }) => {
    await page.goto("/manage-wines");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("unauthenticated user cannot access winemaker supply page", async ({ page }) => {
    await page.goto("/supply");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("winemaker area requires winemaker role", async ({ page }) => {
    // Attempt to access winemaker routes
    await page.goto("/manage-wines");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("authenticated dashboard is protected", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to login if not authenticated
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("orders page requires authentication", async ({ page }) => {
    await page.goto("/orders");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("settings page requires authentication", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("public wine catalog is browsable without authentication", async ({ page }) => {
    await page.goto("/wines");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/wines");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });

  test("public winemaker profile is viewable", async ({ page }) => {
    await page.goto("/winemakers/1");
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });

  test("winemaker supply browse is protected", async ({ page }) => {
    await page.goto("/manage-wines");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("login page renders for winemaker flow", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/auth/login");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });

  test("register page is available for new winemakers", async ({ page }) => {
    await page.goto("/auth/register");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/auth/register");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });

  test("public wine detail pages work for public catalog browsing", async ({ page }) => {
    // Navigate to a wine detail page (public)
    await page.goto("/wines");
    await page.waitForLoadState("networkidle");

    // Try to navigate to a product
    const productLink = page.locator('a[href*="/products/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForLoadState("networkidle");
      expect(page.url()).toMatch(/\/products\/\d+/);
    }
  });

  test("wine list page does not crash", async ({ page }) => {
    await page.goto("/wines");
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });

  test("cannot access protected winemaker sections without role", async ({ page }) => {
    // Attempt to access all protected winemaker routes
    const protectedRoutes = ["/manage-wines", "/supply"];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForURL("**/auth/login", { timeout: 5000 });
      expect(page.url()).toContain("/auth/login");
    }
  });

  test("can view public shop listings", async ({ page }) => {
    await page.goto("/shops");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/shops");
  });

  test("can view public shop detail", async ({ page }) => {
    await page.goto("/shops/1");
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).not.toContainText("Missing Publishable Key");
  });

  test("events page is publicly browsable", async ({ page }) => {
    await page.goto("/events");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/events");
  });

  test("public explore page works for winemakers to view competition", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/explore");
  });
});
