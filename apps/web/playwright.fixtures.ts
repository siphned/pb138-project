import { test as baseTest, expect } from "@playwright/test";

/**
 * Playwright fixtures for E2E testing with authenticated roles.
 * Uses test user from server .env.local with all roles assigned.
 *
 * Test user (all roles):
 * - Email: palahap384@gzeos.com
 * - Password: 75$A-Qwertzuiop123.
 *
 * Usage:
 * ```
 * import { test } from "./playwright.fixtures";
 *
 * test("admin can access user management", async ({ page, authenticateUser }) => {
 *   await authenticateUser();
 *   await page.goto("/users");
 *   expect(page.url()).toContain("/users");
 * });
 * ```
 */

type TestFixtures = {
  authenticateUser: () => Promise<void>;
};

const TEST_USER_EMAIL = "palahap384@gzeos.com";
const TEST_USER_PASSWORD = "75$A-Qwertzuiop123.";

async function loginWithClerk(page) {
  await page.goto("/auth/login");
  await page.waitForLoadState("networkidle");

  await page.fill('input[type="email"]', TEST_USER_EMAIL);
  await page.fill('input[type="password"]', TEST_USER_PASSWORD);

  const submitButton = page.locator('button:has-text("Sign in")');
  await submitButton.click();

  await page.waitForURL(/^\/$|\/dashboard|\/wines/, { timeout: 10000 });
  await page.waitForLoadState("networkidle");
}

export const test = baseTest.extend<TestFixtures>({
  authenticateUser: async ({ page }, use) => {
    await use(async () => {
      await loginWithClerk(page);
    });
  },
});

export { expect };
