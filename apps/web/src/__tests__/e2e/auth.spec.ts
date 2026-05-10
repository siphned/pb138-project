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

test.describe("Public routes & environment", () => {
  test("homepage loads, shows branding, and has no Clerk errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(page.url()).not.toContain("/login");
    await expect(page.getByText("Wine Enjoyers").first()).toBeVisible();

    const clerkErrors = errors.filter((e) => e.includes("Publishable Key"));
    expect(clerkErrors).toHaveLength(0);
  });

  test("/explore is accessible without auth", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");
    expect(page.url()).not.toContain("/login");
  });

  test("/login renders Clerk SignIn widget", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });

  test("/register renders Clerk SignUp widget", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });
});
