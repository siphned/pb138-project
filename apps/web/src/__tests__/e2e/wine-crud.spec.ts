import { expect, test } from "../../../playwright.fixtures";

const TEST_WINE_ID = process.env.TEST_WINE_ID ?? "";
const TEST_WINEMAKER_ID = process.env.TEST_WINEMAKER_ID ?? "";

test.describe
  .skip("wine-crud: create and edit flows", () => {
    test("can create a new wine", async ({ page, authenticateUser }) => {
      await authenticateUser();
      await page.goto("/wines/new");
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/wines/new");

      await page.getByLabel(/name/i).fill("E2E Test Wine");
      await page.getByLabel(/region/i).fill("Mikulovská");
      await page.getByLabel(/description/i).fill("Wine created by E2E test");

      const winemakerSelect = page.getByLabel(/winemaker/i);
      if ((await winemakerSelect.count()) > 0) {
        await winemakerSelect.selectOption({ value: TEST_WINEMAKER_ID });
      }

      await page.getByRole("button", { name: /create|save|submit/i }).click();
      await page.waitForLoadState("networkidle");

      expect(page.url()).toMatch(/\/wines\/\d+/);
      await expect(page.getByRole("heading", { name: /E2E Test Wine/i })).toBeVisible();
    });

    test("can edit an owned wine", async ({ page, authenticateUser }) => {
      test.skip(!TEST_WINE_ID, "TEST_WINE_ID not set");

      await authenticateUser();
      await page.goto(`/wines/${TEST_WINE_ID}/edit`);
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain(`/wines/${TEST_WINE_ID}`);

      const descriptionField = page.getByLabel(/description/i);
      await descriptionField.clear();
      await descriptionField.fill("Updated description from E2E test");

      await page.getByRole("button", { name: /save|update|submit/i }).click();
      await page.waitForLoadState("networkidle");

      await expect(page.getByText(/Updated description from E2E test/)).toBeVisible();
    });

    test("wine images page renders upload UI", async ({ page, authenticateUser }) => {
      test.skip(!TEST_WINE_ID, "TEST_WINE_ID not set");

      await authenticateUser();
      await page.goto(`/wines/${TEST_WINE_ID}/images`);
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain(`/wines/${TEST_WINE_ID}/images`);

      const uploadUI = page.locator("input[type='file'], [data-testid='dropzone']");
      await expect(uploadUI.first()).toBeVisible();
    });
  });
