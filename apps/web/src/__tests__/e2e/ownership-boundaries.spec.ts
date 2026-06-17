import { expect, test } from "../../../playwright.fixtures";

const TEST_WINEMAKER_ID = process.env.TEST_WINEMAKER_ID ?? "";
const TEST_SHOP_ID = process.env.TEST_SHOP_ID ?? "";

const UNOWNED_SHOP_ID = "1";

test.describe
  .skip("ownership-boundaries: cannot edit unowned resources", () => {
    test("edit button absent on unowned wine detail", async ({ page, authenticateUser }) => {
      await authenticateUser();
      await page.goto("/wines");
      await page.waitForLoadState("networkidle");
      const firstWineLink = page.getByRole("link").filter({ hasText: /./ }).first();
      await firstWineLink.click();
      await page.waitForLoadState("networkidle");

      const editButton = page.getByRole("link", { name: /edit/i });
      if (page.url().includes(TEST_WINEMAKER_ID)) return;
      await expect(editButton).not.toBeVisible();
    });

    test("cannot navigate to unowned wine edit page", async ({ page, authenticateUser }) => {
      await authenticateUser();
      await page.goto("/wines/1/edit");
      await page.waitForLoadState("networkidle");
      expect(page.url()).not.toContain("/wines/1/edit");
    });

    test("cannot access unowned shop inventory", async ({ page, authenticateUser }) => {
      await authenticateUser();
      await page.goto(`/shops/${UNOWNED_SHOP_ID}/inventory`);
      await page.waitForLoadState("networkidle");
      if (UNOWNED_SHOP_ID !== TEST_SHOP_ID) {
        expect(page.url()).not.toContain(`/shops/${UNOWNED_SHOP_ID}/inventory`);
      }
    });

    test("cannot access unowned shop orders", async ({ page, authenticateUser }) => {
      await authenticateUser();
      await page.goto(`/shops/${UNOWNED_SHOP_ID}/orders`);
      await page.waitForLoadState("networkidle");
      if (UNOWNED_SHOP_ID !== TEST_SHOP_ID) {
        expect(page.url()).not.toContain(`/shops/${UNOWNED_SHOP_ID}/orders`);
      }
    });
  });
