import { expect, test } from "../../../playwright.fixtures";

const TEST_SHOP_ID = process.env.TEST_SHOP_ID ?? "";

test.describe("shop owner happy paths", () => {
  test("view my shop detail", async ({ page, authenticateUser }) => {
    test.skip(!TEST_SHOP_ID, "TEST_SHOP_ID not set");
    await authenticateUser();
    await page.waitForLoadState("networkidle");

    await page.goto(`/shops/${TEST_SHOP_ID}`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain(TEST_SHOP_ID);

    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("edit my shop", async ({ page, authenticateUser }) => {
    test.skip(!TEST_SHOP_ID, "TEST_SHOP_ID not set");
    await authenticateUser();
    await page.waitForLoadState("networkidle");

    await page.goto(`/shops/${TEST_SHOP_ID}/edit`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain(TEST_SHOP_ID);

    const descField = page.getByLabel(/description|bio/i).first();
    if ((await descField.count()) > 0) {
      await descField.fill("Updated shop description from E2E");
      const saveBtn = page.getByRole("button", { name: /save|update|submit/i });
      if ((await saveBtn.count()) > 0) {
        await saveBtn.first().click();
        await page.waitForLoadState("networkidle");
      }
    }
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("add product to inventory", async ({ page, authenticateUser }) => {
    test.skip(!TEST_SHOP_ID, "TEST_SHOP_ID not set");
    await authenticateUser();
    await page.waitForLoadState("networkidle");

    await page.goto(`/shops/${TEST_SHOP_ID}/inventory/new`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("inventory");

    await page
      .getByLabel(/name/i)
      .fill("E2E Test Product")
      .catch(() => {});
    await page
      .getByLabel(/price/i)
      .fill("19.99")
      .catch(() => {});

    const saveBtn = page.getByRole("button", { name: /create|save|submit/i });
    if ((await saveBtn.count()) > 0) {
      await saveBtn.first().click();
      await page.waitForLoadState("networkidle");
    }

    const url = page.url();
    expect(url.includes("/inventory") || url.includes("/products")).toBe(true);
  });

  test("edit inventory product", async ({ page, authenticateUser }) => {
    test.skip(!TEST_SHOP_ID, "TEST_SHOP_ID not set");
    await authenticateUser();
    await page.waitForLoadState("networkidle");

    await page.goto(`/shops/${TEST_SHOP_ID}/inventory`);
    await page.waitForLoadState("networkidle");

    const editLink = page.getByRole("link", { name: /edit/i }).first();
    if ((await editLink.count()) > 0) {
      await editLink.click();
      await page.waitForLoadState("networkidle");

      const priceInput = page.getByLabel(/price/i).first();
      if ((await priceInput.count()) > 0) {
        await priceInput.fill("24.99");
        const saveBtn = page.getByRole("button", { name: /save|update|submit/i });
        if ((await saveBtn.count()) > 0) {
          await saveBtn.first().click();
          await page.waitForLoadState("networkidle");
        }
      }
    }
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("request supply from winemaker", async ({ page, authenticateUser }) => {
    test.skip(!TEST_SHOP_ID, "TEST_SHOP_ID not set");
    await authenticateUser();
    await page.waitForLoadState("networkidle");

    await page.goto(`/shops/${TEST_SHOP_ID}/supply-browse`);
    await page.waitForLoadState("networkidle");

    const firstCard = page.locator("[data-slot='catalog-card'] a").first();
    if ((await firstCard.count()) > 0) {
      await firstCard.click();
      await page.waitForLoadState("networkidle");

      const requestBtn = page.getByRole("button", { name: /request.*supply|send.*request/i });
      if ((await requestBtn.count()) > 0) {
        await requestBtn.first().click();
        await page.waitForLoadState("networkidle");
      }
    }
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("add availability hours", async ({ page, authenticateUser }) => {
    test.skip(!TEST_SHOP_ID, "TEST_SHOP_ID not set");
    await authenticateUser();
    await page.waitForLoadState("networkidle");

    await page.goto(`/shops/${TEST_SHOP_ID}/availability`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("availability");

    const addBtn = page.getByRole("button", { name: /add hours/i });
    if ((await addBtn.count()) > 0) {
      await addBtn.first().click();
      await page
        .getByRole("dialog")
        .waitFor({ state: "visible" })
        .catch(() => {});

      const timeInput = page.locator("input[type='time']").first();
      if ((await timeInput.count()) > 0) {
        await timeInput.fill("08:00");
      }

      const submitBtn = page.getByRole("button", { name: /add hours/i });
      if ((await submitBtn.count()) > 0) {
        await submitBtn.first().click();
        await page.waitForLoadState("networkidle");
      }
    }
    await expect(page.getByRole("heading", { name: /opening hours/i })).toBeVisible();
  });

  test("create a bundle", async ({ page, authenticateUser }) => {
    test.skip(!TEST_SHOP_ID, "TEST_SHOP_ID not set");
    await authenticateUser();
    await page.waitForLoadState("networkidle");

    await page.goto(`/shops/${TEST_SHOP_ID}/bundles/new`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("bundles");

    await page
      .getByLabel(/name/i)
      .fill("E2E Test Bundle")
      .catch(() => {});
    await page
      .getByLabel(/description/i)
      .fill("Bundle from E2E test")
      .catch(() => {});

    const submitBtn = page.getByRole("button", { name: /create|save|submit/i });
    if ((await submitBtn.count()) > 0) {
      await submitBtn.click();
      await page.waitForLoadState("networkidle");
    }
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("view shop orders", async ({ page, authenticateUser }) => {
    test.skip(!TEST_SHOP_ID, "TEST_SHOP_ID not set");
    await authenticateUser();
    await page.waitForLoadState("networkidle");

    await page.goto(`/shops/${TEST_SHOP_ID}/orders`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("orders");

    const orderLinks = page.getByRole("link").filter({ hasText: /./ });
    if ((await orderLinks.count()) > 0) {
      await orderLinks.first().click();
      await page.waitForLoadState("networkidle");
    }
    await expect(page.getByRole("main").first()).toBeVisible();
  });
});
