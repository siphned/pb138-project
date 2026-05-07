import type { GuestSession } from "@repo/shared/schemas";
import { db } from "../../db";
import * as guestSessionsRepo from "./guest-sessions.repository";

const DEFAULT_EXPIRATION_DAYS = 30;

export class GuestSessionsService {
  async getOrCreateSession(sessionId?: string): Promise<GuestSession> {
    if (sessionId) {
      const session = await guestSessionsRepo.findById(db, sessionId);
      if (session && session.expiresAt > new Date()) {
        return session;
      }
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + DEFAULT_EXPIRATION_DAYS);

    return guestSessionsRepo.create(db, { expiresAt });
  }

  async validateSession(sessionId: string): Promise<GuestSession | null> {
    const session = await guestSessionsRepo.findById(db, sessionId);
    if (session && session.expiresAt > new Date()) {
      return session;
    }
    return null;
  }
}

export const guestSessionsService = new GuestSessionsService();
