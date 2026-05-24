<<<<<<< HEAD
import { orders } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as ordersRepository from "./orders.repository";

const mockDb = db as any;
=======
import { addresses, orderItems, orders } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";

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
>>>>>>> origin/main

vi.mock("../../db", () => {
  const m = {
    innerJoin: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    query: {
      orders: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    returning: vi.fn().mockReturnThis(),
    selectDistinct: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    transaction: vi.fn((cb) => cb(m)),
    update: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
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
<<<<<<< HEAD
      vi.mocked(db.query.orders.findFirst).mockResolvedValue(mockOrder as any);
      const result = await ordersRepository.findById(db, "o1");
=======
      vi.mocked(db.query.orders.findFirst).mockResolvedValue(mockOrder as never);
      const result = await ordersRepository.findById("o1");
>>>>>>> origin/main
      expect(result).toBe(mockOrder);
    });
  });

  describe("listForUser", () => {
    it("delegates to db.query.findMany", async () => {
      const mockOrders = [{ id: "o1" }];
<<<<<<< HEAD
      vi.mocked(db.query.orders.findMany).mockResolvedValue(mockOrders as any);
      const result = await ordersRepository.listForUser(db, "u1");
=======
      vi.mocked(db.query.orders.findMany).mockResolvedValue(mockOrders as never);
      const result = await ordersRepository.listForUser("u1");
>>>>>>> origin/main
      expect(result).toBe(mockOrders);
    });
  });

<<<<<<< HEAD
  describe("createOrder", () => {
    it("inserts order and returns it", async () => {
      vi.mocked(mockDb.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "order-1" }]),
        }),
      });
      const result = await ordersRepository.createOrder(db, {
        billingAddressId: "a1",
        deliveryType: "shipping",
        paymentMethod: "card",
        paymentStatus: "pending",
        shippingAddressId: "a2",
        status: "pending",
        totalPrice: "100",
      } as any);
      expect(result.id).toBe("order-1");
      expect(db.insert).toHaveBeenCalledWith(orders);
=======
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
          billingAddress: {
            city: "B",
            country: "CZ",
            houseNumber: "1",
            postalCode: "1",
            street: "S",
          },
          deliveryType: "shipping",
          discount: "0",
          paymentMethod: "card",
          paymentStatus: "pending",
          shippingAddress: {
            city: "B",
            country: "CZ",
            houseNumber: "1",
            postalCode: "1",
            street: "S",
          },
          shippingFee: "10",
          status: "pending",
          totalPrice: "100",
        } as never,
        [{ productId: "p1", quantity: 1, shopId: "s1", unitPrice: "90" }]
      );

      expect(result.id).toBe("order-1");
      expect(db.transaction).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalledWith(addresses);
      expect(db.insert).toHaveBeenCalledWith(orders);
      expect(db.insert).toHaveBeenCalledWith(orderItems);
>>>>>>> origin/main
    });
  });

  describe("updateStatus", () => {
    it("updates order status", async () => {
<<<<<<< HEAD
      vi.mocked(mockDb.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: "o1", status: "shipped" }]),
          }),
        }),
      });
      const result = await ordersRepository.updateStatus(db, "o1", "shipped");
=======
      vi.mocked(mockDb.returning).mockResolvedValueOnce([{ id: "o1", status: "shipped" }]);

      const result = await ordersRepository.updateStatus("o1", "shipped");

>>>>>>> origin/main
      expect(result.status).toBe("shipped");
      expect(db.update).toHaveBeenCalledWith(orders);
    });
  });
});
