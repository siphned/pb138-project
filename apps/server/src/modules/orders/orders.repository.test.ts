import { beforeEach, describe, expect, it, vi } from "vitest";
import { ordersRepository } from "./orders.repository";
import { db } from "../../db";
import { orders, orderItems, addresses } from "../../db/schema";

interface MockChained {
  from: () => MockChained;
  where: () => MockChained;
  returning: () => Promise<unknown[]>;
}

interface MockDatabase {
  insert: () => MockChained;
  returning: () => Promise<unknown[]>;
}

const mockDb = db as unknown as MockDatabase;

vi.mock("../../db", () => {
  const m = {
    transaction: vi.fn((cb) => cb(m)),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    query: {
      orders: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
  };
  return { db: m };
});

describe("ordersRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findById", () => {
    it("delegates to db.query", async () => {
      const mockOrder = { id: "o1" };
      vi.mocked(db.query.orders.findFirst).mockResolvedValue(mockOrder as never);
      const result = await ordersRepository.findById("o1");
      expect(result).toBe(mockOrder);
    });
  });

  describe("create", () => {
    it("creates addresses, order, and items in a transaction", async () => {
      vi.mocked(mockDb.returning)
        .mockResolvedValueOnce([{ id: "addr-ship" }])
        .mockResolvedValueOnce([{ id: "addr-bill" }])
        .mockResolvedValueOnce([{ id: "order-1" }]);

      const result = await ordersRepository.create(
        {
          shippingFee: "10",
          discount: "0",
          paymentStatus: "pending",
          paymentMethod: "card",
          totalPrice: "100",
          status: "pending",
          deliveryType: "shipping",
          shippingAddress: { country: "CZ", city: "B", postalCode: "1", street: "S", houseNumber: "1" },
          billingAddress: { country: "CZ", city: "B", postalCode: "1", street: "S", houseNumber: "1" },
        } as never,
        [{ shopId: "s1", productId: "p1", quantity: 1, unitPrice: "90" }]
      );

      expect(result.id).toBe("order-1");
      expect(db.transaction).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalledWith(addresses);
      expect(db.insert).toHaveBeenCalledWith(orders);
      expect(db.insert).toHaveBeenCalledWith(orderItems);
    });
  });
});
