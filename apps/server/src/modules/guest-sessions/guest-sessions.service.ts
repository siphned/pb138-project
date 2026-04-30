import type { GuestSession } from "@repo/shared/schemas";
import {
  guestSessionsRepository,
  type IGuestSessionsRepository,
} from "./guest-sessions.repository";

const DEFAULT_EXPIRATION_DAYS = 30;

export class GuestSessionsService {
  constructor(private guestSessionsRepo: IGuestSessionsRepository) {}

  async getOrCreateSession(sessionId?: string): Promise<GuestSession> {
    if (sessionId) {
      const session = await this.guestSessionsRepo.findById(sessionId);
      if (session && session.expiresAt > new Date()) {
        return session;
      }
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + DEFAULT_EXPIRATION_DAYS);

    return this.guestSessionsRepo.create({ expiresAt });
  }

  async validateSession(sessionId: string): Promise<GuestSession | null> {
    const session = await this.guestSessionsRepo.findById(sessionId);
    if (session && session.expiresAt > new Date()) {
      return session;
    }
    return null;
  }
}

export const guestSessionsService = new GuestSessionsService(guestSessionsRepository);
