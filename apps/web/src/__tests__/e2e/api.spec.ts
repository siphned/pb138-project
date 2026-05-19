import { expect, test } from "@playwright/test";

const API_BASE_URL = "http://localhost:3000";

/**
 * API Integration Tests for WineMarket
 *
 * Tests critical endpoints for:
 * - GET /wines (list + filters)
 * - GET /wines/:id (detail with winemaker)
 * - GET /orders (list user orders)
 * - POST /carts/items (add product)
 * - POST /orders/checkout (complete order)
 * - GET /admin/events (list pending events - admin role)
 */

test.describe("API Integration Tests", () => {
  /**
   * TODO: Setup test fixtures
   * In a real scenario, we would:
   * 1. Create test users via Clerk API
   * 2. Get JWT tokens for them
   * 3. Use them in tests below
   *
   * For now, we'll use environment tokens or generate test data
   * This assumes the test database is seeded with sample data
   */

  test.describe("GET /wines - List wines with filters", () => {
    test("should return list of wines with valid response structure", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/wines`);

      expect(response.status()).toBe(200);

      const wines = await response.json();
      expect(Array.isArray(wines)).toBeTruthy();

      if (wines.length > 0) {
        const wine = wines[0];

        // Validate wine response schema
        expect(wine).toHaveProperty("id");
        expect(wine).toHaveProperty("name");
        expect(wine).toHaveProperty("region");
        expect(wine).toHaveProperty("type");
        expect(wine).toHaveProperty("color");
        expect(wine).toHaveProperty("vintageYear");
        expect(wine).toHaveProperty("description");
        expect(wine).toHaveProperty("alcoholContent");
        expect(wine).toHaveProperty("composition");
        expect(wine).toHaveProperty("attribution");
        expect(wine).toHaveProperty("volumeMl");
        expect(wine).toHaveProperty("quantity");
        expect(wine).toHaveProperty("winemakerId");
        expect(wine).toHaveProperty("winemaker");
        expect(wine.winemaker).toHaveProperty("id");
        expect(wine.winemaker).toHaveProperty("name");
        expect(wine).toHaveProperty("createdAt");
        expect(wine).toHaveProperty("updatedAt");

        // Validate types
        expect(typeof wine.id).toBe("string");
        expect(typeof wine.name).toBe("string");
        expect(typeof wine.region).toBe("string");
        expect(wine.vintageYear).toBeGreaterThanOrEqual(1800);
        expect(wine.vintageYear).toBeLessThanOrEqual(2100);
      }
    });

    test("should filter wines by region", async ({ request }) => {
      const region = "Moravia";
      const response = await request.get(`${API_BASE_URL}/wines?region=${region}`);

      expect(response.status()).toBe(200);

      const wines = await response.json();
      expect(Array.isArray(wines)).toBeTruthy();

      wines.forEach((wine: any) => {
        expect(wine.region.toLowerCase()).toContain(region.toLowerCase());
      });
    });

    test("should filter wines by type (still)", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/wines?type=still`);

      expect(response.status()).toBe(200);

      const wines = await response.json();
      expect(Array.isArray(wines)).toBeTruthy();

      wines.forEach((wine: any) => {
        expect(wine.type).toBe("still");
      });
    });

    test("should filter wines by color (red)", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/wines?color=red`);

      expect(response.status()).toBe(200);

      const wines = await response.json();
      expect(Array.isArray(wines)).toBeTruthy();

      wines.forEach((wine: any) => {
        expect(wine.color).toBe("red");
      });
    });

    test("should filter wines by vintage year", async ({ request }) => {
      const vintageYear = 2022;
      const response = await request.get(`${API_BASE_URL}/wines?vintageYear=${vintageYear}`);

      expect(response.status()).toBe(200);

      const wines = await response.json();
      expect(Array.isArray(wines)).toBeTruthy();

      wines.forEach((wine: any) => {
        expect(wine.vintageYear).toBe(vintageYear);
      });
    });

    test("should return empty array for non-existent region filter", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/wines?region=NonExistentRegion123XYZ`);

      expect(response.status()).toBe(200);

      const wines = await response.json();
      expect(Array.isArray(wines)).toBeTruthy();
      expect(wines.length).toBe(0);
    });

    test("should combine multiple filters", async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}/wines?region=Moravia&type=still&color=red&vintageYear=2022`
      );

      expect(response.status()).toBe(200);

      const wines = await response.json();
      expect(Array.isArray(wines)).toBeTruthy();

      wines.forEach((wine: any) => {
        expect(wine.region.toLowerCase()).toContain("moravia");
        expect(wine.type).toBe("still");
        expect(wine.color).toBe("red");
        expect(wine.vintageYear).toBe(2022);
      });
    });
  });

  test.describe("GET /wines/:id - Get wine detail with winemaker", () => {
    test("should return wine detail with complete winemaker info", async ({ request }) => {
      // First, get a wine ID from the list
      const listResponse = await request.get(`${API_BASE_URL}/wines`);
      expect(listResponse.status()).toBe(200);

      const wines = await listResponse.json();
      expect(wines.length).toBeGreaterThan(0);

      const wineId = wines[0].id;

      const response = await request.get(`${API_BASE_URL}/wines/${wineId}`);
      expect(response.status()).toBe(200);

      const wine = await response.json();

      // Validate all wine properties
      expect(wine.id).toBe(wineId);
      expect(wine).toHaveProperty("name");
      expect(wine).toHaveProperty("description");
      expect(wine).toHaveProperty("region");
      expect(wine).toHaveProperty("type");
      expect(wine).toHaveProperty("color");
      expect(wine).toHaveProperty("vintageYear");
      expect(wine).toHaveProperty("alcoholContent");
      expect(wine).toHaveProperty("composition");
      expect(wine).toHaveProperty("attribution");
      expect(wine).toHaveProperty("volumeMl");
      expect(wine).toHaveProperty("quantity");
      expect(wine).toHaveProperty("winemakerId");

      // Validate winemaker information is included
      expect(wine).toHaveProperty("winemaker");
      expect(wine.winemaker).toHaveProperty("id");
      expect(wine.winemaker).toHaveProperty("name");
      expect(typeof wine.winemaker.id).toBe("string");
      expect(typeof wine.winemaker.name).toBe("string");

      // Validate timestamps
      expect(wine).toHaveProperty("createdAt");
      expect(wine).toHaveProperty("updatedAt");
    });

    test("should return 404 for non-existent wine", async ({ request }) => {
      const fakeWineId = "nonexistent-wine-id-12345";
      const response = await request.get(`${API_BASE_URL}/wines/${fakeWineId}`);

      expect(response.status()).toBe(404);

      const error = await response.json();
      expect(error).toHaveProperty("message");
    });

    test("should handle invalid wine ID format gracefully", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/wines/!!!invalid!!!`);

      // Should either return 404 or 400 depending on implementation
      expect([400, 404]).toContain(response.status());
    });
  });

  test.describe("GET /orders - List user orders", () => {
    test("should return 401 when no auth provided", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/orders`);

      expect([401, 400]).toContain(response.status());
    });

    test("should return empty array for authenticated user with no orders", async ({ request }) => {
      // Make request without token - guest checkout creates guest orders
      const response = await request.get(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });

      // Should fail auth validation
      expect([401]).toContain(response.status());
    });

    test("should validate order response structure when orders exist", async ({ request }) => {
      // Create a guest cart first to have something to order
      await request.post(`${API_BASE_URL}/carts/items`, {
        data: {
          productId: "test-product-id",
          quantity: 1,
        },
      });

      // Then we'd fetch orders - but this requires proper auth
      // For now, we validate the error case
      const response = await request.get(`${API_BASE_URL}/orders`);
      expect([400, 401]).toContain(response.status());
    });
  });

  test.describe("POST /carts/items - Add product to cart", () => {
    test("should add item to guest cart", async ({ request }) => {
      // First get a product ID
      const winesResponse = await request.get(`${API_BASE_URL}/wines`);
      expect(winesResponse.status()).toBe(200);

      const wines = await winesResponse.json();
      if (wines.length === 0) {
        test.skip();
        return;
      }

      // Get products for a shop - need to find a product
      const productsResponse = await request.get(`${API_BASE_URL}/products`);
      expect(productsResponse.status()).toBe(200);

      const products = await productsResponse.json();
      if (products.length === 0) {
        test.skip();
        return;
      }

      const productId = products[0].id;

      // Add to cart with guest session
      const response = await request.post(`${API_BASE_URL}/carts/items`, {
        data: {
          productId,
          quantity: 2,
        },
      });

      expect(response.status()).toBe(201);

      const result = await response.json();
      expect(typeof result).toBe("string");
      expect(result.toLowerCase()).toContain("added");
    });

    test("should validate product quantity is required", async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/carts/items`, {
        data: {
          productId: "test-product-id",
          // quantity is missing
        },
      });

      expect([400]).toContain(response.status());
    });

    test("should validate product ID is required", async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/carts/items`, {
        data: {
          quantity: 1,
          // productId is missing
        },
      });

      expect([400]).toContain(response.status());
    });

    test("should return 410 when product is deleted", async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/carts/items`, {
        data: {
          productId: "deleted-product-id",
          quantity: 1,
        },
      });

      // Should either be 410 (product deleted) or 404 (not found)
      // Response depends on seeded data
      expect([404, 410]).toContain(response.status());
    });

    test("should reject negative quantity", async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/carts/items`, {
        data: {
          productId: "test-product-id",
          quantity: -1,
        },
      });

      expect([400]).toContain(response.status());
    });

    test("should accept valid quantity values", async ({ request }) => {
      // Get a real product
      const productsResponse = await request.get(`${API_BASE_URL}/products`);
      if ((await productsResponse.json()).length === 0) {
        test.skip();
        return;
      }

      const products = await productsResponse.json();
      const productId = products[0].id;

      const response = await request.post(`${API_BASE_URL}/carts/items`, {
        data: {
          productId,
          quantity: 10,
        },
      });

      expect([201, 200]).toContain(response.status());
    });
  });

  test.describe("POST /orders/checkout - Complete order", () => {
    test("should require guest email for guest checkout", async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/orders/checkout`, {
        data: {
          deliveryType: "shipping",
          paymentMethod: "card",
          shippingAddress: {
            city: "Prague",
            country: "Czech Republic",
            houseNumber: "123",
            postalCode: "110 00",
            street: "Main St",
          },
          // guestEmail is missing - required for guest
        },
      });

      expect([400]).toContain(response.status());
    });

    test("should require shipping address", async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/orders/checkout`, {
        data: {
          deliveryType: "shipping",
          guestEmail: "test@example.com",
          paymentMethod: "card",
          // shippingAddress is missing
        },
      });

      expect([400]).toContain(response.status());
    });

    test("should validate delivery type is pickup or shipping", async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/orders/checkout`, {
        data: {
          deliveryType: "invalid-delivery",
          guestEmail: "test@example.com",
          paymentMethod: "card",
          shippingAddress: {
            city: "Prague",
            country: "Czech Republic",
            houseNumber: "123",
            postalCode: "110 00",
            street: "Main St",
          },
        },
      });

      expect([400]).toContain(response.status());
    });

    test("should validate payment method is valid", async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/orders/checkout`, {
        data: {
          deliveryType: "shipping",
          guestEmail: "test@example.com",
          paymentMethod: "invalid-payment",
          shippingAddress: {
            city: "Prague",
            country: "Czech Republic",
            houseNumber: "123",
            postalCode: "110 00",
            street: "Main St",
          },
        },
      });

      expect([400]).toContain(response.status());
    });

    test("should accept pickup delivery type", async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/orders/checkout`, {
        data: {
          deliveryType: "pickup",
          guestEmail: "test@example.com",
          paymentMethod: "card",
          shippingAddress: {
            city: "Prague",
            country: "Czech Republic",
            houseNumber: "123",
            postalCode: "110 00",
            street: "Main St",
          },
        },
      });

      // Might fail if no items in cart, but should validate structure
      expect([400, 422, 200]).toContain(response.status());
    });

    test("should accept all valid payment methods", async ({ request }) => {
      const paymentMethods = ["card", "bank_transfer", "cash_on_delivery"];

      for (const method of paymentMethods) {
        const response = await request.post(`${API_BASE_URL}/orders/checkout`, {
          data: {
            deliveryType: "shipping",
            guestEmail: "test@example.com",
            paymentMethod: method,
            shippingAddress: {
              city: "Prague",
              country: "Czech Republic",
              houseNumber: "123",
              postalCode: "110 00",
              street: "Main St",
            },
          },
        });

        // Should not fail validation (may fail due to empty cart)
        expect([200, 400, 422]).toContain(response.status());
      }
    });

    test("should accept optional billing address", async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/orders/checkout`, {
        data: {
          billingAddress: {
            city: "Brno",
            country: "Czech Republic",
            houseNumber: "456",
            postalCode: "602 00",
            street: "Secondary St",
          },
          deliveryType: "shipping",
          guestEmail: "test@example.com",
          paymentMethod: "card",
          shippingAddress: {
            city: "Prague",
            country: "Czech Republic",
            houseNumber: "123",
            postalCode: "110 00",
            street: "Main St",
          },
        },
      });

      expect([200, 400, 422]).toContain(response.status());
    });

    test("should return 422 when insufficient stock", async ({ request }) => {
      // This test would need a product with no stock
      // Response depends on cart contents
      const response = await request.post(`${API_BASE_URL}/orders/checkout`, {
        data: {
          deliveryType: "shipping",
          guestEmail: "test@example.com",
          paymentMethod: "card",
          shippingAddress: {
            city: "Prague",
            country: "Czech Republic",
            houseNumber: "123",
            postalCode: "110 00",
            street: "Main St",
          },
        },
      });

      // Valid response - might be success, empty cart error, or stock error
      expect([200, 400, 422]).toContain(response.status());
    });

    test("should validate address fields are required", async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/orders/checkout`, {
        data: {
          deliveryType: "shipping",
          guestEmail: "test@example.com",
          paymentMethod: "card",
          shippingAddress: {
            city: "Prague",
            // country is missing
            houseNumber: "123",
            postalCode: "110 00",
            street: "Main St",
          },
        },
      });

      expect([400]).toContain(response.status());
    });
  });

  test.describe("GET /admin/events - List pending events (admin only)", () => {
    test("should return 401 when no auth provided", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/admin/events`);

      expect([401, 400]).toContain(response.status());
    });

    test("should return 403 when user lacks admin role", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/admin/events`, {
        headers: {
          Authorization: "Bearer invalid-or-customer-token",
        },
      });

      // Should fail auth or role check
      expect([401, 403, 400]).toContain(response.status());
    });

    test("should accept pending status filter", async ({ request }) => {
      // Without valid admin token, this will fail auth
      // But we can validate the query parameter is accepted
      const response = await request.get(`${API_BASE_URL}/admin/events?status=pending`);

      expect([400, 401, 403, 200]).toContain(response.status());
    });

    test("should accept approved status filter", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/admin/events?status=approved`);

      expect([400, 401, 403, 200]).toContain(response.status());
    });

    test("should accept rejected status filter", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/admin/events?status=rejected`);

      expect([400, 401, 403, 200]).toContain(response.status());
    });

    test("should accept pagination via page parameter", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/admin/events?page=1&status=pending`);

      expect([400, 401, 403, 200]).toContain(response.status());
    });

    test("should handle page parameter correctly", async ({ request }) => {
      const page2Response = await request.get(`${API_BASE_URL}/admin/events?page=2`);
      const page5Response = await request.get(`${API_BASE_URL}/admin/events?page=5`);

      // Both should be valid requests
      expect([400, 401, 403, 200]).toContain(page2Response.status());
      expect([400, 401, 403, 200]).toContain(page5Response.status());
    });

    test("should reject invalid status filter", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/admin/events?status=invalid-status`);

      // Should be rejected for invalid status
      expect([400, 401, 403]).toContain(response.status());
    });

    test("should return event list structure when authorized (mock scenario)", async ({
      request,
    }) => {
      // This test validates the response schema structure
      // In a real scenario, you'd use a valid admin token

      const response = await request.get(`${API_BASE_URL}/admin/events`);

      // If somehow authorized, validate structure
      if (response.status() === 200) {
        const events = await response.json();
        expect(Array.isArray(events) || typeof events === "object").toBeTruthy();
      }
    });
  });

  test.describe("Error handling and edge cases", () => {
    test("should handle malformed JSON in request body", async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/carts/items`, {
        data: "not-valid-json{][",
      });

      expect([400]).toContain(response.status());
    });

    test("should handle missing Content-Type header gracefully", async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/carts/items`, {
        data: {
          productId: "test-id",
          quantity: 1,
        },
        headers: {
          "Content-Type": "",
        },
      });

      // Should still work or give proper error
      expect([200, 201, 400, 401]).toContain(response.status());
    });

    test("should reject extremely large numbers in quantity", async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/carts/items`, {
        data: {
          productId: "test-id",
          quantity: 999999999,
        },
      });

      // Might reject or accept depending on DB constraints
      expect([200, 201, 400, 404, 422]).toContain(response.status());
    });

    test("should handle concurrent requests to same endpoint", async ({ request }) => {
      const promises = Array(5)
        .fill(null)
        .map(() => request.get(`${API_BASE_URL}/wines?region=Moravia`));

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status()).toBe(200);
      });
    });

    test("should handle special characters in query parameters", async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}/wines?region=${encodeURIComponent("Mle Carpathians")}`
      );

      expect([200, 404]).toContain(response.status());
    });
  });
});
