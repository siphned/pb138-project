import { describe, expect, it, vi } from "vitest";
import { app } from "../../app";

vi.mock("./orders.service", () => ({
  ordersService: {
    createOrder: vi.fn().mockResolvedValue({ id: "o1" }),
    getOrder: vi.fn().mockResolvedValue({ id: "o1" }),
  },
}));

vi.mock("../auth/auth.utils", () => ({
  verifyClerkToken: vi.fn().mockResolvedValue(null),
}));

describe("orders routes", () => {
  it("POST /orders/checkout performs guest checkout", async () => {
    const response = await app.handle(
      new Request("http://localhost/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: "guest_session_id=s1",
        },
        body: JSON.stringify({
          guestEmail: "test@example.com",
          paymentMethod: "card",
          deliveryType: "shipping",
          shippingAddress: {
            country: "CZ", city: "B", postalCode: "1", street: "S", houseNumber: "1"
          }
        }),
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.id).toBe("o1");
  });

  it("POST /orders/checkout returns 400 if guest email missing", async () => {
    const response = await app.handle(
      new Request("http://localhost/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: "guest_session_id=s1",
        },
        body: JSON.stringify({
          paymentMethod: "card",
          deliveryType: "shipping",
          shippingAddress: {
            country: "CZ", city: "B", postalCode: "1", street: "S", houseNumber: "1"
          }
        }),
      })
    );

    expect(response.status).toBe(400);
  });
});
