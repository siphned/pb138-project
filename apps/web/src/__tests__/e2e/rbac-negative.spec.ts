import { expect, test } from "../../../playwright.fixtures";

const hasCustomerCreds = !!process.env.TEST_USER_CUSTOMER_EMAIL;
const hasWinemakerCreds = !!process.env.TEST_USER_WINEMAKER_EMAIL;
const hasShopOwnerCreds = !!process.env.TEST_USER_SHOP_OWNER_EMAIL;

async function assertRedirectedAway(page: import("@playwright/test").Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  expect(page.url()).not.toContain(url);
}

test.describe("rbac-negative: customer cannot access winemaker/admin routes", () => {
  test.skip(!hasCustomerCreds, "TEST_USER_CUSTOMER_EMAIL not set");

  test("customer cannot reach /wines/new", async ({ page, authenticateAsCustomer }) => {
    await authenticateAsCustomer();
    await assertRedirectedAway(page, "/wines/new");
  });

  test("customer cannot reach /events/new", async ({ page, authenticateAsCustomer }) => {
    await authenticateAsCustomer();
    await assertRedirectedAway(page, "/events/new");
  });

  test("customer cannot reach shop inventory", async ({ page, authenticateAsCustomer }) => {
    await authenticateAsCustomer();
    await assertRedirectedAway(page, "/shops/1/inventory");
  });

  test("customer cannot reach /users (admin)", async ({ page, authenticateAsCustomer }) => {
    await authenticateAsCustomer();
    await assertRedirectedAway(page, "/users");
  });
});

test.describe("rbac-negative: winemaker cannot access shop/admin routes", () => {
  test.skip(!hasWinemakerCreds, "TEST_USER_WINEMAKER_EMAIL not set");

  test("winemaker cannot reach shop inventory", async ({ page, authenticateAsWinemaker }) => {
    await authenticateAsWinemaker();
    await assertRedirectedAway(page, "/shops/1/inventory");
  });

  test("winemaker cannot reach /shops/new", async ({ page, authenticateAsWinemaker }) => {
    await authenticateAsWinemaker();
    await assertRedirectedAway(page, "/shops/new");
  });

  test("winemaker cannot reach /users (admin)", async ({ page, authenticateAsWinemaker }) => {
    await authenticateAsWinemaker();
    await assertRedirectedAway(page, "/users");
  });
});

test.describe("rbac-negative: shop owner cannot access winemaker/admin routes", () => {
  test.skip(!hasShopOwnerCreds, "TEST_USER_SHOP_OWNER_EMAIL not set");

  test("shop owner cannot reach /wines/new", async ({ page, authenticateAsShopOwner }) => {
    await authenticateAsShopOwner();
    await assertRedirectedAway(page, "/wines/new");
  });

  test("shop owner cannot reach /events/new", async ({ page, authenticateAsShopOwner }) => {
    await authenticateAsShopOwner();
    await assertRedirectedAway(page, "/events/new");
  });

  test("shop owner cannot reach /users (admin)", async ({ page, authenticateAsShopOwner }) => {
    await authenticateAsShopOwner();
    await assertRedirectedAway(page, "/users");
  });
});
