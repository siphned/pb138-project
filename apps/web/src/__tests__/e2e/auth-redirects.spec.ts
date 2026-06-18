import { expect, test } from "@playwright/test";

const clerkConfigured = process.env.VITE_CLERK_PUBLISHABLE_KEY?.startsWith("pk_") ?? false;

test.describe("Auth redirects", () => {
  const protectedRoutes = [
    "/dashboard",
    "/settings",
    "/orders",
    "/stats",
    "/users",
    "/role-requests",
    "/moderation",
  ];

  for (const route of protectedRoutes) {
    test(`${route} redirects to /auth/login when unauthenticated`, async ({ page }) => {
      test.skip(
        !clerkConfigured,
        "Clerk publishable key not configured — skipping auth redirect test"
      );
      await page.goto(route);
      await page.waitForURL("**/auth/login", { timeout: 15000 });
      expect(page.url()).toContain("/auth/login");
    });
  }
});
