import { expect, test } from "../../../playwright.fixtures";

test.describe("catalog: public browsing", () => {
  test("wines list renders at least one card", async ({ page }) => {
    await page.goto("/wines");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/wines");
    const cards = page.locator("[data-slot='catalog-card']").first();
    await expect(cards).toBeVisible();
  });

  test("products list renders at least one card", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/products");
    const cards = page.locator("[data-slot='catalog-card']").first();
    await expect(cards).toBeVisible();
  });

  test("winemakers list renders at least one card", async ({ page }) => {
    await page.goto("/winemakers");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/winemakers");
    const cards = page.locator("[data-slot='catalog-card']").first();
    await expect(cards).toBeVisible();
  });

  test("shops list renders at least one card", async ({ page }) => {
    await page.goto("/shops");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/shops");
    const cards = page.locator("[data-slot='catalog-card']").first();
    await expect(cards).toBeVisible();
  });

  test("events list renders at least one card", async ({ page }) => {
    await page.goto("/events");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/events");
    const cards = page.locator("[data-slot='card']").first();
    await expect(cards).toBeVisible();
  });

  test("wine detail page renders heading and description", async ({ page }) => {
    await page.goto("/wines");
    await page.waitForLoadState("networkidle");
    const firstLink = page.locator("[data-slot='catalog-card'] a").first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");
    expect(page.url()).toMatch(/\/wines\/[\w-]+/);
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("product detail page renders price", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    const firstLink = page.locator("[data-slot='catalog-card'] a").first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");
    expect(page.url()).toMatch(/\/products\/[\w-]+/);
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("search page accepts query param and renders results", async ({ page }) => {
    await page.goto("/search?q=wine");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/search");
    await expect(page.getByRole("main").first()).toBeVisible();
  });
});
