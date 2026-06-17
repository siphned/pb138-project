import { expect, test } from "../../../playwright.fixtures";

const hasCustomerCreds = !!process.env.TEST_USER_CUSTOMER_EMAIL;
const hasWinemakerCreds = !!process.env.TEST_USER_WINEMAKER_EMAIL;
const hasShopOwnerCreds = !!process.env.TEST_USER_SHOP_OWNER_EMAIL;

test.describe("dashboard: all-roles user", () => {
  test("all-roles user can access dashboard", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/dashboard");
    await expect(page.locator("main")).toBeVisible();
  });
});

test.describe("dashboard: customer-only user", () => {
  test.skip(!hasCustomerCreds, "TEST_USER_CUSTOMER_EMAIL not set — create Clerk account first");

  test("customer sees dashboard without winemaker section", async ({
    page,
    authenticateAsCustomer,
  }) => {
    await authenticateAsCustomer();
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/dashboard");
    await expect(page.locator("main")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /add wine|create wine|new wine/i })
    ).not.toBeVisible();
  });
});

test.describe("dashboard: winemaker-only user", () => {
  test.skip(!hasWinemakerCreds, "TEST_USER_WINEMAKER_EMAIL not set — create Clerk account first");

  test("winemaker sees dashboard without shop inventory section", async ({
    page,
    authenticateAsWinemaker,
  }) => {
    await authenticateAsWinemaker();
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/dashboard");
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("link", { name: /inventory/i })).not.toBeVisible();
  });
});

test.describe("dashboard: shop-owner-only user", () => {
  test.skip(!hasShopOwnerCreds, "TEST_USER_SHOP_OWNER_EMAIL not set — create Clerk account first");

  test("shop owner sees dashboard without wine creation section", async ({
    page,
    authenticateAsShopOwner,
  }) => {
    await authenticateAsShopOwner();
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/dashboard");
    await expect(page.locator("main")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /add wine|create wine|new wine/i })
    ).not.toBeVisible();
  });
});
