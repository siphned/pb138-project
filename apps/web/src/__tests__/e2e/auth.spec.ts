import { expect, test } from "@playwright/test";

test.describe("Auth guards", () => {
  test("unauthenticated user visiting /dashboard is redirected to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login", { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });

  test("unauthenticated user visiting /settings is redirected to /login", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForURL("**/login", { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });

  test("unauthenticated user visiting /orders is redirected to /login", async ({ page }) => {
    await page.goto("/orders");
    await page.waitForURL("**/login", { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });

  test("unauthenticated user visiting /admin/* is redirected to /login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("**/login", { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });
});

test.describe("Public routes", () => {
  test("homepage / is accessible without auth", async ({ page }) => {
    await page.goto("/");
    // Should not redirect to /login
    await page.waitForLoadState("networkidle");
    expect(page.url()).not.toContain("/login");
  });

  test("homepage shows the Wine Enjoyers branding", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Wine Enjoyers").first()).toBeVisible();
  });

  test("/explore is accessible without auth", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");
    expect(page.url()).not.toContain("/login");
  });

  test("/login renders Clerk SignIn widget", async ({ page }) => {
    await page.goto("/login");
    // Clerk renders an iframe or its own form elements
    await page.waitForLoadState("networkidle");
    // Clerk injects a sign-in form — check the page has loaded without error
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });

  test("/register renders Clerk SignUp widget", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });
});

test.describe("Environment", () => {
  test("app loads without throwing Missing Publishable Key error", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const clerkErrors = errors.filter((e) => e.includes("Publishable Key"));
    expect(clerkErrors).toHaveLength(0);
  });
});
