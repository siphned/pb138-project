import type { GuestSession } from "@repo/shared/schemas";
<<<<<<< HEAD
import { db } from "../../db";
import * as guestSessionsRepo from "./guest-sessions.repository";
=======
import {
  guestSessionsRepository,
  type IGuestSessionsRepository,
} from "./guest-sessions.repository";
>>>>>>> origin/main

const DEFAULT_EXPIRATION_DAYS = 30;

export class GuestSessionsService {
<<<<<<< HEAD
  async getOrCreateSession(sessionId?: string): Promise<GuestSession> {
    if (sessionId) {
      const session = await guestSessionsRepo.findById(db, sessionId);
=======
  constructor(private guestSessionsRepo: IGuestSessionsRepository) {}

  async getOrCreateSession(sessionId?: string): Promise<GuestSession> {
    if (sessionId) {
      const session = await this.guestSessionsRepo.findById(sessionId);
>>>>>>> origin/main
      if (session && session.expiresAt > new Date()) {
        return session;
      }
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + DEFAULT_EXPIRATION_DAYS);

<<<<<<< HEAD
    return guestSessionsRepo.create(db, { expiresAt });
  }

  async validateSession(sessionId: string): Promise<GuestSession | null> {
    const session = await guestSessionsRepo.findById(db, sessionId);
=======
    return this.guestSessionsRepo.create({ expiresAt });
  }

  async validateSession(sessionId: string): Promise<GuestSession | null> {
    const session = await this.guestSessionsRepo.findById(sessionId);
>>>>>>> origin/main
    if (session && session.expiresAt > new Date()) {
      return session;
    }
    return null;
  }
}

<<<<<<< HEAD
export const guestSessionsService = new GuestSessionsService();
=======
export const guestSessionsService = new GuestSessionsService(guestSessionsRepository);
>>>>>>> origin/main
