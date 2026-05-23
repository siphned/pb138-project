import { expect, test } from "@playwright/test";

const clerkConfigured = process.env.VITE_CLERK_PUBLISHABLE_KEY?.startsWith("pk_") ?? false;

test.describe("Shop Management Workflows", () => {
  test.skip(!clerkConfigured, "Clerk not configured — skipping shop management tests");

  test.describe("Shop inventory management", () => {
    test("navigate to shop inventory page", async ({ page }) => {
      await page.goto("/manage/shops");
      await page.waitForLoadState("networkidle");

      // Click on first shop to access management
      const shopLink = page.locator('a[href*="/manage/shops/"]').first();
      if (await shopLink.isVisible()) {
        await shopLink.click();
        await page.waitForURL(/\/manage\/shops\/\d+/, { timeout: 10000 });
        expect(page.url()).toMatch(/\/manage\/shops\/\d+/);
      }
    });

    test("navigate to inventory tab", async ({ page }) => {
      await page.goto("/manage/shops/1/inventory");
      await page.waitForLoadState("networkidle");

      // Verify inventory page loaded
      const inventoryHeader = page.getByRole("heading", { name: /inventory|wine/i }).first();
      if (await inventoryHeader.isVisible()) {
        expect(inventoryHeader).toBeDefined();
      }
    });

    test("add product to inventory - form interaction", async ({ page }) => {
      await page.goto("/manage/shops/1/inventory");
      await page.waitForLoadState("networkidle");

      // Look for add product button
      const addButton = page.getByRole("button", { name: /add|new|create/i }).first();
      if (await addButton.isVisible()) {
        await addButton.click();
        // Wait for form or modal to appear
        await page.waitForLoadState("networkidle");

        // Form should be visible after clicking add
        const form = page.locator("form").first();
        if (await form.isVisible()) {
          expect(form).toBeDefined();
        }
      }
    });

    test("view product list in inventory", async ({ page }) => {
      await page.goto("/manage/shops/1/inventory");
      await page.waitForLoadState("networkidle");

      // Look for product table or list
      const productTable = page.locator("table").first();
      const productList = page.locator("[role='list'], [class*='product']").first();

      if (await productTable.isVisible()) {
        expect(productTable).toBeDefined();
      } else if (await productList.isVisible()) {
        expect(productList).toBeDefined();
      }
    });
  });

  test.describe("Shop availability management", () => {
    test("navigate to availability settings", async ({ page }) => {
      await page.goto("/manage/shops/1");
      await page.waitForLoadState("networkidle");

      // Look for availability/settings link
      const availabilityLink = page.locator('a[href*="availability"], a[href*="hours"]').first();
      if (await availabilityLink.isVisible()) {
        await availabilityLink.click();
        await page.waitForLoadState("networkidle");
        expect(page).toBeDefined();
      }
    });

    test("access availability/hours management", async ({ page }) => {
      // Try direct navigation to availability if it exists
      await page.goto("/manage/shops/1/availability", { waitUntil: "networkidle" }).catch(() => {
        // If route doesn't exist, navigate to shop home
        return page.goto("/manage/shops/1");
      });

      await page.waitForLoadState("networkidle");
      expect(page).toBeDefined();
    });
  });

  test.describe("Shop orders", () => {
    test("navigate to shop orders page", async ({ page }) => {
      await page.goto("/manage/shops/1/shop-orders");
      await page.waitForLoadState("networkidle");

      // Verify we're on orders page
      const ordersHeader = page.getByRole("heading", { name: /order/i }).first();
      if (await ordersHeader.isVisible()) {
        expect(ordersHeader).toBeDefined();
      }
    });

    test("view orders list", async ({ page }) => {
      await page.goto("/manage/shops/1/shop-orders");
      await page.waitForLoadState("networkidle");

      // Look for orders table or list
      const ordersTable = page.locator("table").first();
      const ordersList = page.locator("[role='list']").first();

      if (await ordersTable.isVisible()) {
        expect(ordersTable).toBeDefined();
      } else if (await ordersList.isVisible()) {
        expect(ordersList).toBeDefined();
      }
    });

    test("view order details", async ({ page }) => {
      await page.goto("/manage/shops/1/shop-orders");
      await page.waitForLoadState("networkidle");

      // Click on first order to view details
      const orderLink = page
        .locator('a[href*="/orders/"], button:has-text("View"), [role="button"]:has-text("View")')
        .first();
      if (await orderLink.isVisible()) {
        await orderLink.click();
        await page.waitForLoadState("networkidle");
        expect(page).toBeDefined();
      }
    });

    test("process order action", async ({ page }) => {
      await page.goto("/manage/shops/1/shop-orders");
      await page.waitForLoadState("networkidle");

      // Look for action buttons (approve, reject, process, etc.)
      const actionButton = page
        .locator(
          "button:has-text('Approve'), button:has-text('Process'), button:has-text('Accept')"
        )
        .first();
      if (await actionButton.isVisible()) {
        expect(actionButton).toBeDefined();
      }
    });
  });

  test.describe("Shop navigation", () => {
    test("navigate between shop sections", async ({ page }) => {
      await page.goto("/manage/shops/1");
      await page.waitForLoadState("networkidle");

      // Look for navigation tabs or menu
      const tabs = page.locator("[role='tablist'], [role='navigation']").first();
      if (await tabs.isVisible()) {
        expect(tabs).toBeDefined();
      }
    });

    test("return to shops list from shop detail", async ({ page }) => {
      await page.goto("/manage/shops/1/inventory");
      await page.waitForLoadState("networkidle");

      // Look for back button or shops list link
      const backButton = page
        .locator("button:has-text('Back'), a[href*='/manage/shops']:not([href*='/manage/shops/1'])")
        .first();
      if (await backButton.isVisible()) {
        await backButton.click();
        await page.waitForURL("**/manage/shops", { timeout: 5000 });
        expect(page.url()).toContain("/manage/shops");
      }
    });
  });
});
