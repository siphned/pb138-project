import type { GuestSession } from "@repo/shared/schemas";
import { guestSessions } from "@repo/shared/schemas";
import { eq, lt } from "drizzle-orm";
import { db } from "../../db";

export interface IGuestSessionsRepository {
  cleanupExpired(): Promise<void>;
  create(data: { expiresAt: Date }): Promise<GuestSession>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<GuestSession | undefined>;
}

export const guestSessionsRepository: IGuestSessionsRepository = {
  async cleanupExpired(): Promise<void> {
    await db.delete(guestSessions).where(lt(guestSessions.expiresAt, new Date()));
  },

  async create(data: { expiresAt: Date }): Promise<GuestSession> {
    const [session] = await db.insert(guestSessions).values(data).returning();
    if (!session) throw new Error("Failed to create guest session");
    return session;
  },

  async delete(id: string): Promise<void> {
    await db.delete(guestSessions).where(eq(guestSessions.id, id));
  },

  async findById(id: string): Promise<GuestSession | undefined> {
    const [session] = await db.select().from(guestSessions).where(eq(guestSessions.id, id));
    return session;
  },
};
