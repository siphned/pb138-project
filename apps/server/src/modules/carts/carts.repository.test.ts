import { cartItems, carts } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as cartsRepo from "./carts.repository";

interface MockChained {
  from: () => MockChained;
  where: () => MockChained;
  for: () => Promise<unknown[]>;
  returning: () => Promise<unknown[]>;
  values: () => MockChained;
  onConflictDoUpdate: () => MockChained;
  set: () => MockChained;
}

interface MockDatabase {
  select: () => MockChained;
  insert: () => MockChained;
  update: () => MockChained;
  delete: () => MockChained;
  returning: () => Promise<unknown[]>;
  onConflictDoUpdate: () => MockChained;
  set: () => MockChained;
  where: () => MockChained;
  query: {
    carts: {
      findFirst: unknown;
    };
  };
}

const mockDb = db as unknown as MockDatabase;

vi.mock("../../db", () => {
  const m = {
    delete: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    onConflictDoUpdate: vi.fn().mockReturnThis(),
    query: {
      carts: {
        findFirst: vi.fn(),
      },
    },
    returning: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    transaction: vi.fn((cb) => cb(m)),
    update: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  };
  return { db: m };
});

describe("cartsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findByUserId", () => {
    it("delegates to db.query", async () => {
      const mockCart = { id: "c1", userId: "u1" };
      vi.mocked(db.query.carts.findFirst).mockResolvedValue(mockCart as never);

      const result = await cartsRepo.findByUserId(db, "u1");

      expect(result).toBe(mockCart);
    });
  });

  describe("findBySessionId", () => {
    it("delegates to db.query", async () => {
      const mockCart = { id: "c1", sessionId: "s1" };
      vi.mocked(db.query.carts.findFirst).mockResolvedValue(mockCart as never);

      const result = await cartsRepo.findBySessionId(db, "s1");

      expect(result).toBe(mockCart);
    });
  });

  describe("addItem", () => {
    it("uses onConflictDoUpdate to add quantity", async () => {
      await cartsRepo.addItem(db, "c1", "p1", 2);

      expect(db.insert).toHaveBeenCalledWith(cartItems);
      expect(mockDb.onConflictDoUpdate).toHaveBeenCalled();
    });
  });

  describe("setItemQuantity", () => {
    it("updates quantity in cart_items", async () => {
      await cartsRepo.setItemQuantity(db, "c1", "p1", 5);
      expect(db.update).toHaveBeenCalledWith(cartItems);
      expect(mockDb.set).toHaveBeenCalled();
    });
  });

  describe("removeItem", () => {
    it("deletes item from cart_items", async () => {
      await cartsRepo.removeItem(db, "c1", "p1");
      expect(db.delete).toHaveBeenCalledWith(cartItems);
    });
  });

  describe("clearCart", () => {
    it("deletes all items for a cart", async () => {
      await cartsRepo.clearCart(db, "c1");
      expect(db.delete).toHaveBeenCalledWith(cartItems);
    });
  });

  describe("deleteCart", () => {
    it("soft deletes the cart", async () => {
      await cartsRepo.deleteCart(db, "c1");
      expect(db.update).toHaveBeenCalledWith(carts);
    });
  });
});
