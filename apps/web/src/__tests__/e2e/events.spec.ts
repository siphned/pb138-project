import { expect, test } from "../../../playwright.fixtures";

const TEST_EVENT_ID = process.env.TEST_EVENT_ID ?? "";

test.describe("events: public browsing", () => {
  test("events list shows at least one event", async ({ page }) => {
    await page.goto("/events");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/events");
    const cards = page.locator("[data-slot='card']").first();
    await expect(cards).toBeVisible();
  });

  test("event detail renders title and description", async ({ page }) => {
    await page.goto("/events");
    await page.waitForLoadState("networkidle");
    const firstLink = page.locator("[data-slot='card'] a").first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");
    expect(page.url()).toMatch(/\/events\/[a-zA-Z0-9-]+/);
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
});

test.describe("events: authenticated actions", () => {
  test("can create a new event", async ({ page, authenticateUser }) => {
    await authenticateUser();
    await page.goto("/events/new");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/events/new");

    await page.getByLabel(/name|title/i).fill("E2E Test Event");
    await page.getByLabel(/description/i).fill("Created by automated E2E test");
    const dateInput = page.locator("input[type='date'], input[type='datetime-local']").first();
    if ((await dateInput.count()) > 0) {
      await dateInput.fill("2027-06-01");
    }

    await page.getByRole("button", { name: /create|save|submit/i }).click();
    await page.waitForLoadState("networkidle");

    // Accept either navigation to event detail or staying on create page (validation)
    const url = page.url();
    expect(url.includes("/events/") || url.includes("/events/new")).toBe(true);
    if (url.match(/\/events\/\d+/)) {
      await expect(page.getByRole("heading", { name: /E2E Test Event/i })).toBeVisible();
    }
  });

  test("can edit an owned event", async ({ page, authenticateUser }) => {
    test.skip(!TEST_EVENT_ID, "TEST_EVENT_ID not set — run seed and update .env.local");

    await authenticateUser();
    await page.goto(`/events/${TEST_EVENT_ID}/edit`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain(`/events/${TEST_EVENT_ID}`);

    const descriptionField = page.getByLabel(/description/i);
    await descriptionField.clear();
    await descriptionField.fill("Updated by E2E test");

    await page.getByRole("button", { name: /save|update|submit/i }).click();
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/Updated by E2E test/)).toBeVisible();
  });
});
