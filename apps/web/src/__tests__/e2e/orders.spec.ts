import { expect, test } from "../../../playwright.fixtures";

test.describe("orders: authenticated user", () => {
  test("orders list renders", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.goto("/orders");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/orders");
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("order detail renders when clicking into an order", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.goto("/orders");
    await page.waitForLoadState("networkidle");

    const orderLinks = page.getByRole("link").filter({ hasText: /./ });
    const count = await orderLinks.count();
    if (count === 0) {
      test.skip();
    }

    await orderLinks.first().click();
    await page.waitForLoadState("networkidle");
    expect(page.url()).toMatch(/\/orders\/[\w-]+/);
    await expect(page.getByRole("main").first()).toBeVisible();
  });
});
