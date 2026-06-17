import { clerk } from "@clerk/testing/playwright";
import { test as baseTest, expect } from "@playwright/test";

/**
 * Playwright fixtures for E2E testing with authenticated roles.
 * Uses @clerk/testing to inject auth tokens without touching the login UI.
 *
 * Requires CLERK_SECRET_KEY in environment (loaded from apps/server/.env.local or set in env).
 * Test user (all roles): palahap384@gzeos.com
 */

type TestFixtures = {
  authenticateUser: () => Promise<void>;
};

const TEST_USER_EMAIL = "palahap384@gzeos.com";
const TEST_USER_PASSWORD = "75$A-Qwertzuiop123.";

export const test = baseTest.extend<TestFixtures>({
  authenticateUser: async ({ page }, use) => {
    await use(async () => {
      await page.goto("/");
      await clerk.signIn({
        page,
        signInParams: {
          identifier: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
          strategy: "password",
        },
      });
    });
  },
});

export { expect };
