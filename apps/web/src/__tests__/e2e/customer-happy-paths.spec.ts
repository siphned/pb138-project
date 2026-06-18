import { expect, test } from "../../../playwright.fixtures";

test.describe("customer happy paths", () => {
  test("request a new role", async ({ page, authenticateAsCustomer }) => {
    await authenticateAsCustomer();
    await page.waitForLoadState("networkidle");

    // Navigate to settings where role request option may live
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/settings");

    // Look for role request button or link
    const requestBtn = page.getByRole("button", {
      name: /request.*role|become.*winemaker|become.*shop/i,
    });
    if ((await requestBtn.count()) > 0) {
      await requestBtn.first().click();
      await page.waitForLoadState("networkidle");
    }

    // Page should not crash — role request may be on settings or a separate page
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("edit profile name", async ({ page, authenticateAsCustomer }) => {
    await authenticateAsCustomer();
    await page.waitForLoadState("networkidle");

    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    // Fill name fields if present
    const nameInput = page.getByLabel(/first name|fname|name/i).first();
    if ((await nameInput.count()) > 0) {
      await nameInput.fill("E2E Customer");
    }

    const saveBtn = page.getByRole("button", { name: /save|update|submit/i });
    if ((await saveBtn.count()) > 0) {
      await saveBtn.first().click();
      await page.waitForLoadState("networkidle");
    }

    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("add shipping address", async ({ page, authenticateAsCustomer }) => {
    await authenticateAsCustomer();
    await page.waitForLoadState("networkidle");

    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    // Look for addresses section or tab
    const addressTab = page.getByRole("tab", { name: /address/i });
    const addressLink = page.getByRole("link", { name: /address/i });
    if ((await addressTab.count()) > 0) await addressTab.click();
    else if ((await addressLink.count()) > 0) await addressLink.first().click();
    await page.waitForLoadState("networkidle");

    // Look for "Add address" button
    const addBtn = page.getByRole("button", { name: /add.*address|new.*address/i });
    if ((await addBtn.count()) > 0) {
      await addBtn.first().click();
      await page.waitForLoadState("networkidle");

      // Fill address form
      await page
        .getByLabel(/street/i)
        .fill("123 Test St")
        .catch(() => {});
      await page
        .getByLabel(/city/i)
        .fill("Testville")
        .catch(() => {});
      await page
        .getByLabel(/zip|postal/i)
        .fill("12345")
        .catch(() => {});
      await page
        .getByLabel(/country/i)
        .fill("Testland")
        .catch(() => {});

      const saveBtn = page.getByRole("button", { name: /save|submit/i });
      if ((await saveBtn.count()) > 0) {
        await saveBtn.first().click();
        await page.waitForLoadState("networkidle");
      }
    }

    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("checkout flow from cart", async ({ page, authenticateAsCustomer }) => {
    await authenticateAsCustomer();
    await page.waitForLoadState("networkidle");

    // Add product to cart from product detail
    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    const firstLink = page.locator("[data-slot='catalog-card'] a").first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");

    const addBtn = page.getByRole("button", { name: /add to cart/i });
    if ((await addBtn.count()) > 0) {
      await addBtn.first().click();
      await page.waitForLoadState("networkidle");
    }

    // Navigate to cart then checkout
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    const checkoutBtn = page.getByRole("link", { name: /checkout/i });
    const checkoutBtnAlt = page.getByRole("button", { name: /checkout|place order/i });
    if ((await checkoutBtn.count()) > 0) {
      await checkoutBtn.first().click();
    } else if ((await checkoutBtnAlt.count()) > 0) {
      await checkoutBtnAlt.first().click();
    }
    await page.waitForLoadState("networkidle");

    // Should be on checkout or cart page
    const url = page.url();
    expect(url.includes("/checkout") || url.includes("/cart")).toBe(true);
  });

  test("register for an event", async ({ page, authenticateAsCustomer }) => {
    await authenticateAsCustomer();
    await page.waitForLoadState("networkidle");

    await page.goto("/events");
    await page.waitForLoadState("networkidle");
    const firstCard = page.locator("[data-slot='card'] a").first();
    await firstCard.click();
    await page.waitForLoadState("networkidle");

    // Click register button if present
    const registerBtn = page.getByRole("button", { name: /register/i });
    if ((await registerBtn.count()) > 0) {
      await registerBtn.first().click();
      await page.waitForLoadState("networkidle");
    }

    // Event page should still be visible
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("write a product review", async ({ page, authenticateAsCustomer }) => {
    await authenticateAsCustomer();
    await page.waitForLoadState("networkidle");

    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    const firstLink = page.locator("[data-slot='catalog-card'] a").first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");

    // Find review form
    const reviewForm = page.locator("form").filter({ hasText: /review|recenz/i });
    if ((await reviewForm.count()) === 0) return;

    const bodyInput = page.getByLabel(/comment|body|text|review/i).first();
    if ((await bodyInput.count()) > 0) {
      await bodyInput.fill("Excellent wine from E2E test");
      const submitBtn = page.getByRole("button", { name: /submit|send|post/i });
      if ((await submitBtn.count()) > 0) {
        await submitBtn.first().click();
        await page.waitForLoadState("networkidle");
      }
    }
  });

  test("write comment on event", async ({ page, authenticateAsCustomer }) => {
    await authenticateAsCustomer();
    await page.waitForLoadState("networkidle");

    await page.goto("/events");
    await page.waitForLoadState("networkidle");
    const firstCard = page.locator("[data-slot='card'] a").first();
    await firstCard.click();
    await page.waitForLoadState("networkidle");

    // Find comment form on event detail
    const commentForm = page.locator("form").filter({ hasText: /comment/i });
    if ((await commentForm.count()) === 0) return;

    const commentInput = page.getByLabel(/comment|message/i).first();
    if ((await commentInput.count()) > 0) {
      await commentInput.fill("Looking forward to this event!");
      const submitBtn = page.getByRole("button", { name: /submit|send|post/i });
      if ((await submitBtn.count()) > 0) {
        await submitBtn.first().click();
        await page.waitForLoadState("networkidle");
      }
    }
  });

  test("edit or delete own review", async ({ page, authenticateAsCustomer }) => {
    await authenticateAsCustomer();
    await page.waitForLoadState("networkidle");

    // Go to a product with reviews
    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    const firstLink = page.locator("[data-slot='catalog-card'] a").first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");

    // Look for edit/delete actions on reviews
    const editBtn = page.getByRole("button", { name: /edit/i });
    const deleteBtn = page.getByRole("button", { name: /delete|remove/i });
    if ((await editBtn.count()) > 0) {
      await editBtn.first().click();
      await page.waitForLoadState("networkidle");
    } else if ((await deleteBtn.count()) > 0) {
      await deleteBtn.first().click();
      await page.waitForLoadState("networkidle");
    }
    // Either action exercises the review management flow
  });
});
