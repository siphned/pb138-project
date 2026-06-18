import { expect, test } from "../../../playwright.fixtures";

test.describe("admin: panel pages", () => {
  test("users list page renders or redirects", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.goto("/users");
    await page.waitForLoadState("networkidle");
    // Accept either admin access or redirect to dashboard
    const url = page.url();
    expect(url.includes("/users") || url.includes("/dashboard")).toBe(true);
  });

  test("role requests list page renders or redirects", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.goto("/role-requests");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    expect(url.includes("/role-requests") || url.includes("/dashboard")).toBe(true);
  });

  test("moderation panel page renders or redirects", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.goto("/moderation");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    expect(url.includes("/moderation") || url.includes("/dashboard")).toBe(true);
  });
});
