import { eq, lt } from "drizzle-orm";
import { db } from "../../db";
import type { GuestSession } from "../../db/schema";
import { guestSessions } from "../../db/schema";

export const guestSessionsRepository = {
  async findById(id: string): Promise<GuestSession | undefined> {
    const [session] = await db.select().from(guestSessions).where(eq(guestSessions.id, id));
    return session;
  },

  async create(data: { expiresAt: Date }): Promise<GuestSession> {
    const [session] = await db.insert(guestSessions).values(data).returning();
    if (!session) throw new Error("Failed to create guest session");
    return session;
  },

  async delete(id: string): Promise<void> {
    await db.delete(guestSessions).where(eq(guestSessions.id, id));
  },

  async cleanupExpired(): Promise<void> {
    await db.delete(guestSessions).where(lt(guestSessions.expiresAt, new Date()));
  },
};
