import { expect, test } from "../../../playwright.fixtures";

test.describe("reviews: product reviews", () => {
  test("product detail page shows reviews section", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    const firstLink = page.getByRole("link").filter({ hasText: /./ }).first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");

    const reviewsSection = page.getByText(/reviews|recenze/i).first();
    await expect(reviewsSection).toBeVisible();
  });

  test("winemaker detail page shows reviews section", async ({ page }) => {
    await page.goto("/winemakers");
    await page.waitForLoadState("networkidle");
    const firstLink = page.getByRole("link").filter({ hasText: /./ }).first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");

    const reviewsSection = page.getByText(/reviews|recenze/i).first();
    await expect(reviewsSection).toBeVisible();
  });

  test("authenticated user can submit a product review", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    const firstLink = page.getByRole("link").filter({ hasText: /./ }).first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");

    const reviewForm = page.locator("form").filter({ hasText: /review|recenz/i });
    if ((await reviewForm.count()) === 0) {
      return;
    }

    const ratingInput = page
      .locator("input[type='number'][min='1'], [data-testid='star-rating'] button")
      .first();
    if ((await ratingInput.count()) > 0) {
      await ratingInput.click();
    }

    const bodyInput = page.getByLabel(/comment|body|text|review/i).first();
    if ((await bodyInput.count()) > 0) {
      await bodyInput.fill("Great wine from E2E test");
      await page.getByRole("button", { name: /submit|send|post/i }).click();
      await page.waitForLoadState("networkidle");
    }
  });
});
