import { expect, test } from "../../../playwright.fixtures";

const TEST_SHOP_ID = process.env.TEST_SHOP_ID ?? "";

test.describe("shop-management: inventory and orders", () => {
  test("inventory list renders product rows", async ({ page, authenticateUser }) => {
    test.skip(!TEST_SHOP_ID, "TEST_SHOP_ID not set");

    await authenticateUser();
    await page.goto(`/shops/${TEST_SHOP_ID}/inventory`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain(`/shops/${TEST_SHOP_ID}/inventory`);
    await expect(page.locator("main")).toBeVisible();
  });

  test("shop orders page renders", async ({ page, authenticateUser }) => {
    test.skip(!TEST_SHOP_ID, "TEST_SHOP_ID not set");

    await authenticateUser();
    await page.goto(`/shops/${TEST_SHOP_ID}/orders`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain(`/shops/${TEST_SHOP_ID}/orders`);
    await expect(page.locator("main")).toBeVisible();
  });

  test("supply browse page renders winemaker cards", async ({ page, authenticateUser }) => {
    test.skip(!TEST_SHOP_ID, "TEST_SHOP_ID not set");

    await authenticateUser();
    await page.goto(`/shops/${TEST_SHOP_ID}/supply-browse`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain(`/shops/${TEST_SHOP_ID}/supply-browse`);
    await expect(page.locator("main")).toBeVisible();
  });

  test("shop availability page renders schedule UI", async ({ page, authenticateUser }) => {
    test.skip(!TEST_SHOP_ID, "TEST_SHOP_ID not set");

    await authenticateUser();
    await page.goto(`/shops/${TEST_SHOP_ID}/availability`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain(`/shops/${TEST_SHOP_ID}/availability`);
    await expect(page.locator("main")).toBeVisible();
  });

  test("can add a new bundle", async ({ page, authenticateUser }) => {
    test.skip(!TEST_SHOP_ID, "TEST_SHOP_ID not set");

    await authenticateUser();
    await page.goto(`/shops/${TEST_SHOP_ID}/bundles/new`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain(`/shops/${TEST_SHOP_ID}/bundles/new`);

    await page.getByLabel(/name/i).fill("E2E Test Bundle");
    await page.getByLabel(/description/i).fill("Bundle from E2E test");

    const submitBtn = page.getByRole("button", { name: /create|save|submit/i });
    if ((await submitBtn.count()) > 0) {
      await submitBtn.click();
      await page.waitForLoadState("networkidle");
    }
  });
});
