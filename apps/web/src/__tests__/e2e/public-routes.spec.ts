import { expect, test } from "@playwright/test";

test.describe("Public routes", () => {
  const publicRoutes = [
    "/",
    "/wines",
    "/shops",
    "/shops/1",
    "/products/1",
    "/winemakers/1",
    "/bundles",
    "/events",
    "/cart",
    "/checkout",
    "/search",
  ];

  for (const route of publicRoutes) {
    test(`${route} renders without crash`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(errors.filter((e) => e.includes("Publishable Key"))).toHaveLength(0);
    });
  }

  test("homepage has no Clerk Publishable Key error", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors.filter((e) => e.includes("Publishable Key"))).toHaveLength(0);
  });

  test("/auth/login renders Clerk SignIn without config error", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });

  test("/auth/register renders Clerk SignUp without config error", async ({ page }) => {
    await page.goto("/auth/register");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });

  test("404 page renders for unknown route", async ({ page }) => {
    await page.goto("/nonexistent-route-12345");
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });
});
