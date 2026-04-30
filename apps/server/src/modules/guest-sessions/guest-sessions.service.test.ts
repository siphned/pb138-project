import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./guest-sessions.repository", () => ({
  guestSessionsRepository: {
    create: vi.fn(),
    findById: vi.fn(),
  },
}));

import { guestSessionsRepository } from "./guest-sessions.repository";
import { guestSessionsService } from "./guest-sessions.service";

describe("guestSessionsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOrCreateSession", () => {
    it("returns an existing valid session if sessionId is provided", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const mockSession = { expiresAt: futureDate, id: "session-123" };

      vi.mocked(guestSessionsRepository.findById).mockResolvedValue(mockSession as never);

      const result = await guestSessionsService.getOrCreateSession("session-123");

      expect(result).toBe(mockSession);
      expect(guestSessionsRepository.findById).toHaveBeenCalledWith("session-123");
      expect(guestSessionsRepository.create).not.toHaveBeenCalled();
    });

    it("creates a new session if provided sessionId is invalid/expired", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const expiredSession = { expiresAt: pastDate, id: "expired-123" };
      const newSession = { expiresAt: new Date(), id: "new-123" };

      vi.mocked(guestSessionsRepository.findById).mockResolvedValue(expiredSession as never);
      vi.mocked(guestSessionsRepository.create).mockResolvedValue(newSession as never);

      const result = await guestSessionsService.getOrCreateSession("expired-123");

      expect(result).toBe(newSession);
      expect(guestSessionsRepository.create).toHaveBeenCalled();
    });

    it("creates a new session if no sessionId is provided", async () => {
      const newSession = { expiresAt: new Date(), id: "new-123" };
      vi.mocked(guestSessionsRepository.create).mockResolvedValue(newSession as never);

      const result = await guestSessionsService.getOrCreateSession();

      expect(result).toBe(newSession);
      expect(guestSessionsRepository.findById).not.toHaveBeenCalled();
      expect(guestSessionsRepository.create).toHaveBeenCalled();
    });
  });

  describe("validateSession", () => {
    it("returns session if valid and not expired", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const mockSession = { expiresAt: futureDate, id: "session-123" };

      vi.mocked(guestSessionsRepository.findById).mockResolvedValue(mockSession as never);

      const result = await guestSessionsService.validateSession("session-123");

      expect(result).toBe(mockSession);
    });

    it("returns null if session is expired", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const expiredSession = { expiresAt: pastDate, id: "expired-123" };

      vi.mocked(guestSessionsRepository.findById).mockResolvedValue(expiredSession as never);

      const result = await guestSessionsService.validateSession("expired-123");

      expect(result).toBeNull();
    });

    it("returns null if session not found", async () => {
      vi.mocked(guestSessionsRepository.findById).mockResolvedValue(undefined);

      const result = await guestSessionsService.validateSession("unknown");

      expect(result).toBeNull();
    });
  });
});
