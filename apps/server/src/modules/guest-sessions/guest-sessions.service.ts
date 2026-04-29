import type { GuestSession } from "@repo/shared/schemas";
import { guestSessionsRepository } from "./guest-sessions.repository";

const DEFAULT_EXPIRATION_DAYS = 30;

export const guestSessionsService = {
  async getOrCreateSession(sessionId?: string): Promise<GuestSession> {
    if (sessionId) {
      const session = await guestSessionsRepository.findById(sessionId);
      if (session && session.expiresAt > new Date()) {
        return session;
      }
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + DEFAULT_EXPIRATION_DAYS);

    return guestSessionsRepository.create({ expiresAt });
  },

  async validateSession(sessionId: string): Promise<GuestSession | null> {
    const session = await guestSessionsRepository.findById(sessionId);
    if (session && session.expiresAt > new Date()) {
      return session;
    }
    return null;
  },
};
