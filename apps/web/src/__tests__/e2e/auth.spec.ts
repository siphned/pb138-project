import { expect, test } from "@playwright/test";

test.describe("Auth guards", () => {
  test("unauthenticated user visiting /dashboard is redirected to /auth/login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("unauthenticated user visiting /orders is redirected to /auth/login", async ({ page }) => {
    await page.goto("/orders");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("unauthenticated user visiting /stats is redirected to /auth/login", async ({ page }) => {
    await page.goto("/stats");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("unauthenticated user visiting /admin/* is redirected to /auth/login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("**/auth/login", { timeout: 5000 });
    expect(page.url()).toContain("/auth/login");
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

  test("/auth/login renders Clerk SignIn widget", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });

  test("/auth/register renders Clerk SignUp widget", async ({ page }) => {
    await page.goto("/auth/register");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });
});
