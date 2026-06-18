import { clerk } from "@clerk/testing/playwright";
import { test as baseTest, expect } from "@playwright/test";

type TestFixtures = {
  authenticateUser: () => Promise<void>;
  authenticateAsCustomer: () => Promise<void>;
  authenticateAsWinemaker: () => Promise<void>;
  authenticateAsShopOwner: () => Promise<void>;
};

const TEST_USER_EMAIL = "palahap384@gzeos.com";
const TEST_USER_PASSWORD = "75$A-Qwertzuiop123.";

const TEST_USER_CUSTOMER_EMAIL = process.env.TEST_USER_CUSTOMER_EMAIL ?? "";
const TEST_USER_CUSTOMER_PASSWORD = process.env.TEST_USER_CUSTOMER_PASSWORD ?? "";
const TEST_USER_WINEMAKER_EMAIL = process.env.TEST_USER_WINEMAKER_EMAIL ?? "";
const TEST_USER_WINEMAKER_PASSWORD = process.env.TEST_USER_WINEMAKER_PASSWORD ?? "";
const TEST_USER_SHOP_OWNER_EMAIL = process.env.TEST_USER_SHOP_OWNER_EMAIL ?? "";
const TEST_USER_SHOP_OWNER_PASSWORD = process.env.TEST_USER_SHOP_OWNER_PASSWORD ?? "";

function makeSignInFixture(email: string, password: string) {
  return async (
    { page }: { page: import("@playwright/test").Page },
    use: (fn: () => Promise<void>) => Promise<void>
  ) => {
    await use(async () => {
      await page.goto("/");
      await clerk.signIn({
        page,
        signInParams: { identifier: email, password, strategy: "password" },
      });
    });
  };
}

export const test = baseTest.extend<TestFixtures>({
  authenticateAsCustomer: makeSignInFixture(TEST_USER_CUSTOMER_EMAIL, TEST_USER_CUSTOMER_PASSWORD),
  authenticateAsShopOwner: makeSignInFixture(
    TEST_USER_SHOP_OWNER_EMAIL,
    TEST_USER_SHOP_OWNER_PASSWORD
  ),
  authenticateAsWinemaker: makeSignInFixture(
    TEST_USER_WINEMAKER_EMAIL,
    TEST_USER_WINEMAKER_PASSWORD
  ),
  authenticateUser: makeSignInFixture(TEST_USER_EMAIL, TEST_USER_PASSWORD),
});

export { expect };
