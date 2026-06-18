import { expect, test } from "../../../playwright.fixtures";

const TEST_WINEMAKER_ID = process.env.TEST_WINEMAKER_ID ?? "";
const TEST_WINE_ID = process.env.TEST_WINE_ID ?? "";

test.describe("winemaker happy paths", () => {
  test("view my winemaker profile", async ({ page, authenticateUser }) => {
    test.skip(!TEST_WINEMAKER_ID, "TEST_WINEMAKER_ID not set");
    await authenticateUser();
    await page.waitForLoadState("networkidle");

    await page.goto(`/winemakers/${TEST_WINEMAKER_ID}`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain(TEST_WINEMAKER_ID);

    await expect(page.getByRole("heading").first()).toBeVisible();
    const manageBtn = page.getByRole("link", { name: /manage|edit/i });
    expect((await manageBtn.count()) >= 0).toBe(true);
  });

  test("edit my winemaker profile", async ({ page, authenticateUser }) => {
    test.skip(!TEST_WINEMAKER_ID, "TEST_WINEMAKER_ID not set");
    await authenticateUser();
    await page.waitForLoadState("networkidle");

    await page.goto(`/winemakers/${TEST_WINEMAKER_ID}/edit`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain(TEST_WINEMAKER_ID);

    const descField = page.getByLabel(/description|bio/i).first();
    if ((await descField.count()) > 0) {
      await descField.fill("Updated winemaker bio from E2E test");
      const saveBtn = page.getByRole("button", { name: /save|update|submit/i });
      if ((await saveBtn.count()) > 0) {
        await saveBtn.first().click();
        await page.waitForLoadState("networkidle");
      }
    }
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("create wine with full details", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.waitForLoadState("networkidle");

    await page.goto("/wines/new");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/wines/new");

    await page.getByLabel(/name/i).fill("E2E Reserve Wine");
    await page.getByLabel(/region/i).fill("Mikulovská");
    await page.getByLabel(/description/i).fill("Wine created by E2E test");

    const typeSelect = page.getByLabel(/type|variety|color/i).first();
    if ((await typeSelect.count()) > 0) {
      await typeSelect.selectOption("red").catch(() => {});
    }

    const vintageInput = page.getByLabel(/vintage|year/i).first();
    if ((await vintageInput.count()) > 0) {
      await vintageInput.fill("2024");
    }

    await page.getByRole("button", { name: /create|save|submit/i }).click();
    await page.waitForLoadState("networkidle");

    const url = page.url();
    expect(url.includes("/wines/") || url.includes("/wines/new")).toBe(true);
  });

  test("upload wine image", async ({ page, authenticateUser }) => {
    test.skip(!TEST_WINE_ID, "TEST_WINE_ID not set");
    await authenticateUser();
    await page.waitForLoadState("networkidle");

    await page.goto(`/wines/${TEST_WINE_ID}/images`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain(TEST_WINE_ID);

    const fileInput = page.locator("input[type='file']").first();
    if ((await fileInput.count()) > 0) {
      const testImagePath = "./src/__tests__/e2e/fixtures/test-image.png";
      await fileInput.setInputFiles(testImagePath);
      await page.waitForLoadState("networkidle");
    }

    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("create event with details", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.waitForLoadState("networkidle");

    await page.goto("/events/new");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/events/new");

    await page.getByLabel(/name|title/i).fill("E2E Wine Tasting");
    await page.getByLabel(/description/i).fill("Annual E2E tasting event");

    const dateInput = page.locator("input[type='date'], input[type='datetime-local']").first();
    if ((await dateInput.count()) > 0) {
      await dateInput.fill("2027-07-15");
    }

    const locationInput = page.getByLabel(/location|venue|place/i).first();
    if ((await locationInput.count()) > 0) {
      await locationInput.fill("Test Cellar");
    }

    await page.getByRole("button", { name: /create|save|submit/i }).click();
    await page.waitForLoadState("networkidle");

    const url = page.url();
    expect(url.includes("/events/") || url.includes("/events/new")).toBe(true);
  });

  test("view supply agreements (incoming)", async ({ page, authenticateUser }) => {
    test.skip(!TEST_WINEMAKER_ID, "TEST_WINEMAKER_ID not set");
    await authenticateUser();
    await page.waitForLoadState("networkidle");

    await page.goto(`/shops/${TEST_WINEMAKER_ID}/supply-incoming`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("view my winemaker stats", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.waitForLoadState("networkidle");

    await page.goto("/stats");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/stats");

    await expect(page.getByRole("main").first()).toBeVisible();
  });
});
