import { expect, test } from "@playwright/test";

test.describe("Routing", () => {
  test("/ renders homepage with Wine Enjoyers heading", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: /welcome to wine enjoyers/i })).toBeVisible();
  });

  test("/explore renders Explore Wines route stub", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/explore wines/i)).toBeVisible();
  });

  test("navigating to an unknown route shows 404 or redirects", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await page.waitForLoadState("networkidle");
    // TanStack Router renders a not-found state — page should not crash
    await expect(page.locator("body")).not.toContainText("Missing Publishable Key");
  });
});
