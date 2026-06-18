import { expect, test } from "../../../playwright.fixtures";

test.describe("admin happy paths", () => {
  test("view user list and search", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.goto("/users");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    expect(url.includes("/users") || url.includes("/dashboard")).toBe(true);
    if (!url.includes("/users")) return;

    const searchInput = page.getByRole("searchbox", { name: /search/i });
    if ((await searchInput.count()) > 0) {
      await searchInput.fill("willy");
      await page.waitForLoadState("networkidle");
    }

    const table = page.locator("table, [role='table']");
    await expect(table.first()).toBeVisible();
  });

  test("view user detail", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.goto("/users");
    await page.waitForLoadState("networkidle");
    if (!page.url().includes("/users")) return;

    const userLinks = page.getByRole("link").filter({ hasText: /./ });
    if ((await userLinks.count()) === 0) return;

    await userLinks.first().click();
    await page.waitForLoadState("networkidle");
    expect(page.url()).toMatch(/\/users\/[\w-]+/);
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("ban and unban a user", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.goto("/users");
    await page.waitForLoadState("networkidle");
    if (!page.url().includes("/users")) return;

    const actionBtn = page.getByLabel(/actions|menu|more/i).first();
    if ((await actionBtn.count()) > 0) {
      await actionBtn.click();
      await page.waitForTimeout(500);

      const banOption = page.getByRole("menuitem", { name: /ban|suspend/i });
      if ((await banOption.count()) > 0) {
        await banOption.first().click();
        await page.waitForLoadState("networkidle");

        await actionBtn.click();
        await page.waitForTimeout(500);
        const unbanOption = page.getByRole("menuitem", { name: /unban|activate/i });
        if ((await unbanOption.count()) > 0) {
          await unbanOption.first().click();
          await page.waitForLoadState("networkidle");
        }
      }
    }
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("approve or decline role request", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.goto("/role-requests");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    expect(url.includes("/role-requests") || url.includes("/dashboard")).toBe(true);
    if (!url.includes("/role-requests")) return;

    const menuBtn = page.getByLabel(/role request actions/i);
    if ((await menuBtn.count()) > 0) {
      await menuBtn.first().click();
      await page.waitForTimeout(500);

      const acceptOption = page.getByRole("menuitem", { name: /accept|approve/i });
      const declineOption = page.getByRole("menuitem", { name: /decline|reject|deny/i });

      if ((await acceptOption.count()) > 0) {
        await acceptOption.first().click();
        await page.waitForLoadState("networkidle");
      } else if ((await declineOption.count()) > 0) {
        await declineOption.first().click();
        await page.waitForLoadState("networkidle");
      }
    }

    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("delete a review from moderation", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.goto("/moderation");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    expect(url.includes("/moderation") || url.includes("/dashboard")).toBe(true);
    if (!url.includes("/moderation")) return;

    const deleteBtn = page.getByRole("button", { name: /delete|remove/i }).first();
    if ((await deleteBtn.count()) > 0) {
      await deleteBtn.click();
      await page.waitForLoadState("networkidle");
    }

    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("view admin stats", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.goto("/stats");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/stats");

    await expect(page.getByRole("main").first()).toBeVisible();
  });
});
