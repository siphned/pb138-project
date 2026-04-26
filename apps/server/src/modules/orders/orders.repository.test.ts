import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import { addresses, orderItems, orders } from "../../db/schema";

vi.mock("../products/products.repository", () => ({
  productsRepository: {
    decrementStock: vi.fn(),
  },
}));

import { ordersRepository } from "./orders.repository";

interface MockChained {
  from: () => MockChained;
  where: () => MockChained;
  returning: () => Promise<unknown[]>;
  innerJoin: () => MockChained;
  orderBy: () => MockChained;
  set: () => MockChained;
}

interface MockDatabase {
  insert: () => MockChained;
  update: () => MockChained;
  returning: () => Promise<unknown[]>;
  selectDistinct: () => MockChained;
  query: {
    orders: {
      findFirst: unknown;
      findMany: unknown;
    };
  };
}

const mockDb = db as unknown as MockDatabase;

vi.mock("../../db", () => {
  const m = {
    transaction: vi.fn((cb) => cb(m)),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    selectDistinct: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
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

  describe("listForUser", () => {
    it("delegates to db.query.findMany", async () => {
      const mockOrders = [{ id: "o1" }];
      vi.mocked(db.query.orders.findMany).mockResolvedValue(mockOrders as never);
      const result = await ordersRepository.listForUser("u1");
      expect(result).toBe(mockOrders);
    });
  });

  describe("listForShop", () => {
    it("uses selectDistinct and innerJoin", async () => {
      vi.mocked(mockDb.selectDistinct).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ order: { id: "o1" } }]),
      } as unknown as MockChained);

      const result = await ordersRepository.listForShop("s1");

      expect(result).toHaveLength(1);
      expect(mockDb.selectDistinct).toHaveBeenCalled();
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
          shippingAddress: {
            country: "CZ",
            city: "B",
            postalCode: "1",
            street: "S",
            houseNumber: "1",
          },
          billingAddress: {
            country: "CZ",
            city: "B",
            postalCode: "1",
            street: "S",
            houseNumber: "1",
          },
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

  describe("updateStatus", () => {
    it("updates order status", async () => {
      vi.mocked(mockDb.returning).mockResolvedValueOnce([{ id: "o1", status: "shipped" }]);

      const result = await ordersRepository.updateStatus("o1", "shipped");

      expect(result.status).toBe("shipped");
      expect(db.update).toHaveBeenCalledWith(orders);
    });
  });
});
