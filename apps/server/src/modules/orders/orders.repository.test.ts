import { orders } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as ordersRepository from "./orders.repository";

const mockDb = db as any;

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
      vi.mocked(db.query.orders.findFirst).mockResolvedValue(mockOrder as any);
      const result = await ordersRepository.findById(db, "o1");
      expect(result).toBe(mockOrder);
    });
  });

  describe("listForUser", () => {
    it("delegates to db.query.findMany", async () => {
      const mockOrders = [{ id: "o1" }];
      vi.mocked(db.query.orders.findMany).mockResolvedValue(mockOrders as any);
      const result = await ordersRepository.listForUser(db, "u1");
      expect(result).toBe(mockOrders);
    });
  });

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
    });
  });

  describe("updateStatus", () => {
    it("updates order status", async () => {
      vi.mocked(mockDb.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: "o1", status: "shipped" }]),
          }),
        }),
      });
      const result = await ordersRepository.updateStatus(db, "o1", "shipped");
      expect(result.status).toBe("shipped");
      expect(db.update).toHaveBeenCalledWith(orders);
    });
  });
});
