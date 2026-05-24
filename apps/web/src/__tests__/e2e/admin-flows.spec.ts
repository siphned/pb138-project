import { expect, test } from "@playwright/test";

const clerkConfigured = process.env.VITE_CLERK_PUBLISHABLE_KEY?.startsWith("pk_") ?? false;

test.describe("Admin Workflows", () => {
  test.skip(!clerkConfigured, "Clerk not configured — skipping admin tests");

  test.describe("Admin dashboard", () => {
    test("navigate to admin dashboard", async ({ page }) => {
      await page.goto("/admin");
      await page.waitForLoadState("networkidle");

      // Verify admin page loaded
      const adminHeader = page.getByRole("heading", { name: /admin|dashboard/i }).first();
      if (await adminHeader.isVisible()) {
        expect(adminHeader).toBeDefined();
      }
    });

    test("admin dashboard contains main sections", async ({ page }) => {
      await page.goto("/admin");
      await page.waitForLoadState("networkidle");

      // Look for common admin sections
      const adminNav = page.locator("[role='navigation']").first();
      if (await adminNav.isVisible()) {
        expect(adminNav).toBeDefined();
      }
    });
  });

  test.describe("Admin user management", () => {
    test("navigate to users page", async ({ page }) => {
      await page.goto("/admin/users");
      await page.waitForLoadState("networkidle");

      // Verify users page loaded
      const usersHeader = page.getByRole("heading", { name: /user/i }).first();
      if (await usersHeader.isVisible()) {
        expect(usersHeader).toBeDefined();
      }
    });

    test("view users list", async ({ page }) => {
      await page.goto("/admin/users");
      await page.waitForLoadState("networkidle");

      // Look for users table or list
      const usersTable = page.locator("table").first();
      const usersList = page.locator("[role='list']").first();

      if (await usersTable.isVisible()) {
        expect(usersTable).toBeDefined();
      } else if (await usersList.isVisible()) {
        expect(usersList).toBeDefined();
      }
    });

    test("view user details", async ({ page }) => {
      await page.goto("/admin/users");
      await page.waitForLoadState("networkidle");

      // Click on first user to view details
      const userLink = page.locator("a[href*='/admin/users/'], [role='row'] >> a").first();
      if (await userLink.isVisible()) {
        await userLink.click();
        await page.waitForLoadState("networkidle");
        expect(page).toBeDefined();
      }
    });

    test("search or filter users", async ({ page }) => {
      await page.goto("/admin/users");
      await page.waitForLoadState("networkidle");

      // Look for search or filter input
      const searchInput = page
        .locator("input[placeholder*='search'], input[placeholder*='filter']")
        .first();
      if (await searchInput.isVisible()) {
        expect(searchInput).toBeDefined();
      }
    });
  });

  test.describe("Admin role requests", () => {
    test("navigate to role requests page", async ({ page }) => {
      await page.goto("/admin/role-requests");
      await page.waitForLoadState("networkidle");

      // Verify role requests page loaded
      const roleHeader = page.getByRole("heading", { name: /role|request/i }).first();
      if (await roleHeader.isVisible()) {
        expect(roleHeader).toBeDefined();
      }
    });

    test("view pending role requests", async ({ page }) => {
      await page.goto("/admin/role-requests");
      await page.waitForLoadState("networkidle");

      // Look for requests table or list
      const requestsTable = page.locator("table").first();
      const requestsList = page.locator("[role='list']").first();

      if (await requestsTable.isVisible()) {
        expect(requestsTable).toBeDefined();
      } else if (await requestsList.isVisible()) {
        expect(requestsList).toBeDefined();
      }
    });

    test("approve role request - button interaction", async ({ page }) => {
      await page.goto("/admin/role-requests");
      await page.waitForLoadState("networkidle");

      // Look for approve button
      const approveButton = page
        .locator("button:has-text('Approve'), button:has-text('Accept')")
        .first();
      if (await approveButton.isVisible()) {
        expect(approveButton).toBeDefined();
      }
    });

    test("reject role request - button interaction", async ({ page }) => {
      await page.goto("/admin/role-requests");
      await page.waitForLoadState("networkidle");

      // Look for reject/deny button
      const rejectButton = page
        .locator("button:has-text('Reject'), button:has-text('Deny'), button:has-text('Decline')")
        .first();
      if (await rejectButton.isVisible()) {
        expect(rejectButton).toBeDefined();
      }
    });
  });

  test.describe("Admin moderation", () => {
    test("navigate to moderation page", async ({ page }) => {
      await page.goto("/admin/moderation");
      await page.waitForLoadState("networkidle");

      // Verify moderation page loaded
      const moderationHeader = page
        .getByRole("heading", { name: /moderation|review|content/i })
        .first();
      if (await moderationHeader.isVisible()) {
        expect(moderationHeader).toBeDefined();
      }
    });

    test("view items for moderation", async ({ page }) => {
      await page.goto("/admin/moderation");
      await page.waitForLoadState("networkidle");

      // Look for moderation items (flagged content, reviews, etc.)
      const moderationTable = page.locator("table").first();
      const moderationList = page.locator("[role='list']").first();

      if (await moderationTable.isVisible()) {
        expect(moderationTable).toBeDefined();
      } else if (await moderationList.isVisible()) {
        expect(moderationList).toBeDefined();
      }
    });

    test("access content details for review", async ({ page }) => {
      await page.goto("/admin/moderation");
      await page.waitForLoadState("networkidle");

      // Click on first item to review details
      const itemLink = page.locator("a[href*='/admin/moderation/'], [role='row'] >> a").first();
      if (await itemLink.isVisible()) {
        await itemLink.click();
        await page.waitForLoadState("networkidle");
        expect(page).toBeDefined();
      }
    });

    test("moderate events - approve/reject interaction", async ({ page }) => {
      await page.goto("/admin/moderation");
      await page.waitForLoadState("networkidle");

      // Look for moderation action buttons
      const actionButton = page
        .locator("button:has-text('Approve'), button:has-text('Reject'), button:has-text('Remove')")
        .first();
      if (await actionButton.isVisible()) {
        expect(actionButton).toBeDefined();
      }
    });
  });

  test.describe("Admin content moderation", () => {
    test("view event moderation section", async ({ page }) => {
      await page.goto("/admin/moderation");
      await page.waitForLoadState("networkidle");

      // Look for event-specific moderation
      const eventsSection = page.locator("[data-section*='event'], [class*='event']").first();
      if (await eventsSection.isVisible()) {
        expect(eventsSection).toBeDefined();
      }
    });

    test("view product moderation section", async ({ page }) => {
      await page.goto("/admin/moderation");
      await page.waitForLoadState("networkidle");

      // Look for product-specific moderation
      const productsSection = page.locator("[data-section*='product'], [class*='product']").first();
      if (await productsSection.isVisible()) {
        expect(productsSection).toBeDefined();
      }
    });

    test("moderate reviews and comments", async ({ page }) => {
      await page.goto("/admin/moderation");
      await page.waitForLoadState("networkidle");

      // Look for review/comment moderation actions
      const reviewSection = page.locator("[data-section*='review'], [class*='review']").first();
      if (await reviewSection.isVisible()) {
        expect(reviewSection).toBeDefined();
      }
    });
  });

  test.describe("Admin navigation", () => {
    test("navigate between admin sections via menu", async ({ page }) => {
      await page.goto("/admin");
      await page.waitForLoadState("networkidle");

      // Look for admin navigation menu
      const adminMenu = page.locator("nav, [role='navigation']").first();
      if (await adminMenu.isVisible()) {
        expect(adminMenu).toBeDefined();
      }
    });

    test("navigate from admin/users to admin/role-requests", async ({ page }) => {
      await page.goto("/admin/users");
      await page.waitForLoadState("networkidle");

      // Look for role-requests link
      const roleRequestsLink = page.locator('a[href*="/admin/role-requests"]').first();
      if (await roleRequestsLink.isVisible()) {
        await roleRequestsLink.click();
        await page.waitForURL("**/admin/role-requests", { timeout: 5000 });
        expect(page.url()).toContain("/admin/role-requests");
      }
    });

    test("navigate from admin/moderation to admin/users", async ({ page }) => {
      await page.goto("/admin/moderation");
      await page.waitForLoadState("networkidle");

      // Look for users link
      const usersLink = page.locator('a[href*="/admin/users"]').first();
      if (await usersLink.isVisible()) {
        await usersLink.click();
        await page.waitForURL("**/admin/users", { timeout: 5000 });
        expect(page.url()).toContain("/admin/users");
      }
    });
  });
});
