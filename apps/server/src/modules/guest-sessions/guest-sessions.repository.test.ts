import { guestSessions } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
<<<<<<< HEAD
import * as guestSessionsRepository from "./guest-sessions.repository";

const mockDb = db as any;
=======
import { guestSessionsRepository } from "./guest-sessions.repository";

interface MockChained {
  from: () => MockChained;
  where: () => MockChained;
  for: () => Promise<unknown[]>;
  returning: () => Promise<unknown[]>;
}

interface MockDatabase {
  select: () => MockChained;
  insert: () => MockChained;
  delete: () => MockChained;
  returning: () => Promise<unknown[]>;
  where: () => Promise<unknown[]>;
}

const mockDb = db as unknown as MockDatabase;
>>>>>>> origin/main

vi.mock("../../db", () => {
  const m = {
    delete: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  };
  return { db: m };
});

describe("guestSessionsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findById", () => {
    it("finds a session by id", async () => {
      const mockSession = { id: "s1" };
      vi.mocked(mockDb.where).mockResolvedValueOnce([mockSession]);

<<<<<<< HEAD
      const result = await guestSessionsRepository.findById(db, "s1");
=======
      const result = await guestSessionsRepository.findById("s1");
>>>>>>> origin/main

      expect(result).toBe(mockSession);
      expect(db.select).toHaveBeenCalled();
    });
  });

  describe("create", () => {
    it("creates a session", async () => {
      const mockSession = { id: "new-s" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockSession]);

<<<<<<< HEAD
      const result = await guestSessionsRepository.create(db, { expiresAt: new Date() });
=======
      const result = await guestSessionsRepository.create({ expiresAt: new Date() });
>>>>>>> origin/main

      expect(result).toBe(mockSession);
      expect(db.insert).toHaveBeenCalledWith(guestSessions);
    });
<<<<<<< HEAD
=======

    it("throws if insert fails", async () => {
      vi.mocked(mockDb.returning).mockResolvedValueOnce([]);

      await expect(guestSessionsRepository.create({ expiresAt: new Date() })).rejects.toThrow(
        "Failed to create guest session"
      );
    });
  });

  describe("delete", () => {
    it("deletes a session", async () => {
      await guestSessionsRepository.delete("s1");
      expect(db.delete).toHaveBeenCalledWith(guestSessions);
    });
>>>>>>> origin/main
  });
});
