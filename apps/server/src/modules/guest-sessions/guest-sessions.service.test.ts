import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as guestSessionsRepo from "./guest-sessions.repository";
import { guestSessionsService } from "./guest-sessions.service";

vi.mock("./guest-sessions.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./guest-sessions.repository")>();
  return {
    ...actual,
    create: vi.fn(),
    findById: vi.fn(),
  };
});

describe("guestSessionsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOrCreateSession", () => {
    it("returns an existing valid session if sessionId is provided", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const mockSession = { expiresAt: futureDate, id: "session-123" };

      vi.mocked(guestSessionsRepo.findById).mockResolvedValue(mockSession as any);

      const result = await guestSessionsService.getOrCreateSession("session-123");

      expect(result).toBe(mockSession);
      expect(guestSessionsRepo.findById).toHaveBeenCalledWith(db, "session-123");
      expect(guestSessionsRepo.create).not.toHaveBeenCalled();
    });

    it("creates a new session if provided sessionId is invalid/expired", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const expiredSession = { expiresAt: pastDate, id: "expired-123" };
      const newSession = { expiresAt: new Date(), id: "new-123" };

      vi.mocked(guestSessionsRepo.findById).mockResolvedValue(expiredSession as any);
      vi.mocked(guestSessionsRepo.create).mockResolvedValue(newSession as any);

      const result = await guestSessionsService.getOrCreateSession("expired-123");

      expect(result).toBe(newSession);
      expect(guestSessionsRepo.create).toHaveBeenCalled();
    });

    it("creates a new session if no sessionId is provided", async () => {
      const newSession = { expiresAt: new Date(), id: "new-123" };
      vi.mocked(guestSessionsRepo.create).mockResolvedValue(newSession as any);

      const result = await guestSessionsService.getOrCreateSession();

      expect(result).toBe(newSession);
      expect(guestSessionsRepo.findById).not.toHaveBeenCalled();
      expect(guestSessionsRepo.create).toHaveBeenCalled();
    });
  });

  describe("validateSession", () => {
    it("returns session if valid and not expired", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const mockSession = { expiresAt: futureDate, id: "session-123" };

      vi.mocked(guestSessionsRepo.findById).mockResolvedValue(mockSession as any);

      const result = await guestSessionsService.validateSession("session-123");

      expect(result).toBe(mockSession);
    });

    it("returns null if session is expired", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const expiredSession = { expiresAt: pastDate, id: "expired-123" };

      vi.mocked(guestSessionsRepo.findById).mockResolvedValue(expiredSession as any);

      const result = await guestSessionsService.validateSession("expired-123");

      expect(result).toBeNull();
    });

    it("returns null if session not found", async () => {
      vi.mocked(guestSessionsRepo.findById).mockResolvedValue(undefined);

      const result = await guestSessionsService.validateSession("unknown");

      expect(result).toBeNull();
    });
  });
});
