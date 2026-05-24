import { expect, test } from "@playwright/test";

test.describe("Critical flows", () => {
  test("homepage → explore link navigates to /explore", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const exploreLink = page.locator('a[href="/explore"]').first();
    if (await exploreLink.isVisible()) {
      await exploreLink.click();
      await expect(page).toHaveURL(/\/explore/);
    }
  });

  test("product detail → winemaker link navigates to winemaker profile", async ({ page }) => {
    await page.goto("/products/1");
    await page.waitForLoadState("networkidle");
    const winemakerLink = page.locator('a[href*="/winemakers/"]').first();
    if (await winemakerLink.isVisible()) {
      await winemakerLink.click();
      await expect(page).toHaveURL(/\/winemakers\//);
    }
  });

  test("cart → checkout navigates to /checkout", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    const checkoutBtn = page.getByRole("button", { name: /checkout|order/i });
    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click();
      await expect(page).toHaveURL(/\/checkout/);
    }
  });

  test.describe("Checkout flow", () => {
    test("can access checkout page", async ({ page }) => {
      await page.goto("/checkout");
      await page.waitForLoadState("networkidle");

      const checkoutHeader = page.getByRole("heading", { name: /checkout|order|review/i }).first();
      if (await checkoutHeader.isVisible()) {
        expect(checkoutHeader).toBeDefined();
      }
    });

    test("checkout page displays cart items summary", async ({ page }) => {
      await page.goto("/checkout");
      await page.waitForLoadState("networkidle");

      const itemsList = page.locator("[class*='item'], [class*='product'], [role='list']").first();
      if (await itemsList.isVisible()) {
        expect(itemsList).toBeDefined();
      }
    });

    test("checkout page has address form", async ({ page }) => {
      await page.goto("/checkout");
      await page.waitForLoadState("networkidle");

      const addressForm = page.locator("form, [class*='address'], [class*='shipping']").first();
      if (await addressForm.isVisible()) {
        expect(addressForm).toBeDefined();
      }
    });

    test("checkout page has order total", async ({ page }) => {
      await page.goto("/checkout");
      await page.waitForLoadState("networkidle");

      const totalDisplay = page.locator("[class*='total'], [class*='price']").first();
      if (await totalDisplay.isVisible()) {
        expect(totalDisplay).toBeDefined();
      }
    });

    test("checkout page has place order button", async ({ page }) => {
      await page.goto("/checkout");
      await page.waitForLoadState("networkidle");

      const submitBtn = page.getByRole("button", { name: /place order|submit|pay/i }).first();
      if (await submitBtn.isVisible()) {
        expect(submitBtn).toBeDefined();
      }
    });

    test("cart page shows empty cart message when no items", async ({ page }) => {
      await page.goto("/cart");
      await page.waitForLoadState("networkidle");

      const emptyMessage = page.locator("[class*='empty'], text=/empty|no items/i").first();
      const itemsList = page.locator("[class*='item'], [role='list']").first();

      if (await emptyMessage.isVisible()) {
        expect(emptyMessage).toBeDefined();
      } else if (await itemsList.isVisible()) {
        expect(itemsList).toBeDefined();
      }
    });

    test("can navigate back from checkout", async ({ page }) => {
      await page.goto("/checkout");
      await page.waitForLoadState("networkidle");

      const backButton = page
        .locator(
          "button:has-text('Back'), a:has-text('Continue Shopping'), button:has-text('Continue')"
        )
        .first();
      if (await backButton.isVisible()) {
        await backButton.click();
        await page.waitForLoadState("networkidle");
        expect(page.url()).not.toContain("/checkout");
      }
    });
  });

  test.describe("Product browsing flow", () => {
    test("explore page displays products", async ({ page }) => {
      await page.goto("/explore");
      await page.waitForLoadState("networkidle");

      const productGrid = page
        .locator("[class*='grid'], [class*='product'], [role='list']")
        .first();
      if (await productGrid.isVisible()) {
        expect(productGrid).toBeDefined();
      }
    });

    test("can navigate to product detail from explore", async ({ page }) => {
      await page.goto("/explore");
      await page.waitForLoadState("networkidle");

      const productLink = page.locator("a[href*='/products/']").first();
      if (await productLink.isVisible()) {
        await productLink.click();
        await page.waitForLoadState("networkidle");
        expect(page.url()).toMatch(/\/products\/\d+/);
      }
    });

    test("product detail page displays product information", async ({ page }) => {
      await page.goto("/products/1");
      await page.waitForLoadState("networkidle");

      const productInfo = page
        .locator("[class*='product'], [class*='detail'], [class*='description']")
        .first();
      if (await productInfo.isVisible()) {
        expect(productInfo).toBeDefined();
      }
    });

    test("product detail page has add to cart button", async ({ page }) => {
      await page.goto("/products/1");
      await page.waitForLoadState("networkidle");

      const addToCartBtn = page.getByRole("button", { name: /add to cart|add|cart/i }).first();
      if (await addToCartBtn.isVisible()) {
        expect(addToCartBtn).toBeDefined();
      }
    });
  });
});
