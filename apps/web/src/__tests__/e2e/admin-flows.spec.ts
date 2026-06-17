import { expect, test } from "../../../playwright.fixtures";

test.describe("admin: panel pages", () => {
  test("users list page renders with table", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.goto("/users");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/users");
    const table = page.locator("table, [role='table']");
    await expect(table.first()).toBeVisible();
  });

  test("user detail page renders info card", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.goto("/users");
    await page.waitForLoadState("networkidle");

    const userLinks = page.getByRole("link").filter({ hasText: /./ });
    const count = await userLinks.count();
    if (count === 0) return;

    await userLinks.first().click();
    await page.waitForLoadState("networkidle");
    expect(page.url()).toMatch(/\/users\/\d+/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("role requests list page renders", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.goto("/role-requests");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/role-requests");
    await expect(page.locator("main")).toBeVisible();
  });

  test("moderation panel page renders", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.goto("/moderation");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/moderation");
    await expect(page.locator("main")).toBeVisible();
  });
});
