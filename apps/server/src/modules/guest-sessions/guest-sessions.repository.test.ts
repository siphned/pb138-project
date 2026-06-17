import { guestSessions } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as guestSessionsRepository from "./guest-sessions.repository";

const mockDb = db as any;

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

      const result = await guestSessionsRepository.findById(db, "s1");

      expect(result).toBe(mockSession);
      expect(db.select).toHaveBeenCalled();
    });
  });

  describe("create", () => {
    it("creates a session", async () => {
      const mockSession = { id: "new-s" };
      vi.mocked(mockDb.returning).mockResolvedValueOnce([mockSession]);

      const result = await guestSessionsRepository.create(db, { expiresAt: new Date() });

      expect(result).toBe(mockSession);
      expect(db.insert).toHaveBeenCalledWith(guestSessions);
    });
  });
});
