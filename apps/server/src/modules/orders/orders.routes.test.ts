import { describe, expect, it, vi } from "vitest";
import { app } from "../../app";

const { mockOrder } = vi.hoisted(() => ({
  mockOrder: {
    id: "o1",
    userId: null,
    guestSessionId: "s1",
    guestEmail: "test@example.com",
    guestName: null,
    shippingFee: "10.00",
    discount: "0.00",
    paymentStatus: "pending",
    paymentMethod: "card",
    totalPrice: "60.00",
    status: "pending",
    deliveryType: "shipping",
    shippingAddressId: "addr-1",
    billingAddressId: "addr-1",
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
  },
}));

vi.mock("./orders.service", () => ({
  ordersService: {
    createOrder: vi.fn().mockResolvedValue(mockOrder),
    getOrder: vi.fn().mockResolvedValue(mockOrder),
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
            country: "CZ",
            city: "B",
            postalCode: "1",
            street: "S",
            houseNumber: "1",
          },
        }),
      })
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as unknown as { id: string };
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
            country: "CZ",
            city: "B",
            postalCode: "1",
            street: "S",
            houseNumber: "1",
          },
        }),
      })
    );

    expect(response.status).toBe(400);
  });
});
