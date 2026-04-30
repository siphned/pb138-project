import { addresses, users } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import { usersRepository } from "./users.repository";

interface MockChained {
  from: () => MockChained;
  where: () => MockChained;
  returning: () => Promise<unknown[]>;
}

interface MockDatabase {
  insert: () => MockChained;
  update: () => MockChained;
  returning: () => Promise<unknown[]>;
  query: {
    users: {
      findFirst: unknown;
    };
  };
}

const mockDb = db as unknown as MockDatabase;

vi.mock("../../db", () => {
  const m = {
    insert: vi.fn().mockReturnThis(),
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
    returning: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  };
  return { db: m };
});

describe("usersRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findById", () => {
    it("delegates to db.query", async () => {
      const mockUser = { id: "u1" };
      vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser as never);
      const result = await usersRepository.findById("u1");
      expect(result).toBe(mockUser);
    });
  });

  describe("create", () => {
    it("creates a user", async () => {
      const mockUser = { id: "new-u" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockUser]);

      const result = await usersRepository.create({
        clerkId: "c1",
        email: "a@b.com",
        fname: "A",
        lname: "B",
      } as never);

      expect(result).toBe(mockUser);
      expect(db.insert).toHaveBeenCalledWith(users);
    });
  });

  describe("createAddress", () => {
    it("creates an address", async () => {
      const mockAddr = { id: "a1" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockAddr]);

      const result = await usersRepository.createAddress({
        city: "B",
        country: "CZ",
        houseNumber: "1",
        postalCode: "1",
        street: "S",
      });

      expect(result).toBe(mockAddr);
      expect(db.insert).toHaveBeenCalledWith(addresses);
    });
  });
});
