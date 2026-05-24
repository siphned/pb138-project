import { beforeEach, describe, expect, it, vi } from "vitest";
<<<<<<< HEAD
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
=======

vi.mock("./guest-sessions.repository", () => ({
  guestSessionsRepository: {
    create: vi.fn(),
    findById: vi.fn(),
  },
}));

import { guestSessionsRepository } from "./guest-sessions.repository";
import { guestSessionsService } from "./guest-sessions.service";
>>>>>>> origin/main

describe("guestSessionsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOrCreateSession", () => {
    it("returns an existing valid session if sessionId is provided", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const mockSession = { expiresAt: futureDate, id: "session-123" };

<<<<<<< HEAD
      vi.mocked(guestSessionsRepo.findById).mockResolvedValue(mockSession as any);
=======
      vi.mocked(guestSessionsRepository.findById).mockResolvedValue(mockSession as never);
>>>>>>> origin/main

      const result = await guestSessionsService.getOrCreateSession("session-123");

      expect(result).toBe(mockSession);
<<<<<<< HEAD
      expect(guestSessionsRepo.findById).toHaveBeenCalledWith(db, "session-123");
      expect(guestSessionsRepo.create).not.toHaveBeenCalled();
=======
      expect(guestSessionsRepository.findById).toHaveBeenCalledWith("session-123");
      expect(guestSessionsRepository.create).not.toHaveBeenCalled();
>>>>>>> origin/main
    });

    it("creates a new session if provided sessionId is invalid/expired", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const expiredSession = { expiresAt: pastDate, id: "expired-123" };
      const newSession = { expiresAt: new Date(), id: "new-123" };

<<<<<<< HEAD
      vi.mocked(guestSessionsRepo.findById).mockResolvedValue(expiredSession as any);
      vi.mocked(guestSessionsRepo.create).mockResolvedValue(newSession as any);
=======
      vi.mocked(guestSessionsRepository.findById).mockResolvedValue(expiredSession as never);
      vi.mocked(guestSessionsRepository.create).mockResolvedValue(newSession as never);
>>>>>>> origin/main

      const result = await guestSessionsService.getOrCreateSession("expired-123");

      expect(result).toBe(newSession);
<<<<<<< HEAD
      expect(guestSessionsRepo.create).toHaveBeenCalled();
=======
      expect(guestSessionsRepository.create).toHaveBeenCalled();
>>>>>>> origin/main
    });

    it("creates a new session if no sessionId is provided", async () => {
      const newSession = { expiresAt: new Date(), id: "new-123" };
<<<<<<< HEAD
      vi.mocked(guestSessionsRepo.create).mockResolvedValue(newSession as any);
=======
      vi.mocked(guestSessionsRepository.create).mockResolvedValue(newSession as never);
>>>>>>> origin/main

      const result = await guestSessionsService.getOrCreateSession();

      expect(result).toBe(newSession);
<<<<<<< HEAD
      expect(guestSessionsRepo.findById).not.toHaveBeenCalled();
      expect(guestSessionsRepo.create).toHaveBeenCalled();
=======
      expect(guestSessionsRepository.findById).not.toHaveBeenCalled();
      expect(guestSessionsRepository.create).toHaveBeenCalled();
>>>>>>> origin/main
    });
  });

  describe("validateSession", () => {
    it("returns session if valid and not expired", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const mockSession = { expiresAt: futureDate, id: "session-123" };

<<<<<<< HEAD
      vi.mocked(guestSessionsRepo.findById).mockResolvedValue(mockSession as any);
=======
      vi.mocked(guestSessionsRepository.findById).mockResolvedValue(mockSession as never);
>>>>>>> origin/main

      const result = await guestSessionsService.validateSession("session-123");

      expect(result).toBe(mockSession);
    });

    it("returns null if session is expired", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const expiredSession = { expiresAt: pastDate, id: "expired-123" };

<<<<<<< HEAD
      vi.mocked(guestSessionsRepo.findById).mockResolvedValue(expiredSession as any);
=======
      vi.mocked(guestSessionsRepository.findById).mockResolvedValue(expiredSession as never);
>>>>>>> origin/main

      const result = await guestSessionsService.validateSession("expired-123");

      expect(result).toBeNull();
    });

    it("returns null if session not found", async () => {
<<<<<<< HEAD
      vi.mocked(guestSessionsRepo.findById).mockResolvedValue(undefined);
=======
      vi.mocked(guestSessionsRepository.findById).mockResolvedValue(undefined);
>>>>>>> origin/main

      const result = await guestSessionsService.validateSession("unknown");

      expect(result).toBeNull();
    });
  });
});
