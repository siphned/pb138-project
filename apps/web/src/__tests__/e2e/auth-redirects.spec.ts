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
      // Clerk may redirect to its hosted sign-in page or the app's /auth/login
      await page.waitForURL(/auth\/login|clerk\.com\/|accounts\./i, { timeout: 15000 });
      const url = page.url();
      expect(
        url.includes("/auth/login") || url.includes("clerk.") || url.includes("accounts.")
      ).toBe(true);
    });
  }
});
