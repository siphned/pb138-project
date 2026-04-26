import { describe, expect, it, vi } from "vitest";
import { app } from "../../app";

const { mockOrder } = vi.hoisted(() => ({
  mockOrder: {
    billingAddressId: "addr-1",
    createdAt: new Date(),
    deletedAt: null,
    deliveryType: "shipping",
    discount: "0.00",
    guestEmail: "test@example.com",
    guestName: null,
    guestSessionId: "s1",
    id: "o1",
    paymentMethod: "card",
    paymentStatus: "pending",
    shippingAddressId: "addr-1",
    shippingFee: "10.00",
    status: "pending",
    totalPrice: "60.00",
    updatedAt: null,
    userId: null,
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
        body: JSON.stringify({
          deliveryType: "shipping",
          guestEmail: "test@example.com",
          paymentMethod: "card",
          shippingAddress: {
            city: "B",
            country: "CZ",
            houseNumber: "1",
            postalCode: "1",
            street: "S",
          },
        }),
        headers: {
          "Content-Type": "application/json",
          cookie: "guest_session_id=s1",
        },
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as unknown as { id: string };
    expect(data.id).toBe("o1");
  });

  it("POST /orders/checkout returns 400 if guest email missing", async () => {
    const response = await app.handle(
      new Request("http://localhost/orders/checkout", {
        body: JSON.stringify({
          deliveryType: "shipping",
          paymentMethod: "card",
          shippingAddress: {
            city: "B",
            country: "CZ",
            houseNumber: "1",
            postalCode: "1",
            street: "S",
          },
        }),
        headers: {
          "Content-Type": "application/json",
          cookie: "guest_session_id=s1",
        },
        method: "POST",
      })
    );

    expect(response.status).toBe(400);
  });
});
