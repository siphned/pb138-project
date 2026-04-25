import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import { addresses, users } from "../../db/schema";
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
      findFirst: vi.Mock;
    };
  };
}

const mockDb = db as unknown as MockDatabase;

vi.mock("../../db", () => {
  const m = {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
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
        fname: "A",
        lname: "B",
        email: "a@b.com",
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
        country: "CZ",
        city: "B",
        postalCode: "1",
        street: "S",
        houseNumber: "1",
      });

      expect(result).toBe(mockAddr);
      expect(db.insert).toHaveBeenCalledWith(addresses);
    });
  });
});
