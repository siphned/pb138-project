import type { GuestSession } from "@repo/shared/schemas";
import { guestSessions } from "@repo/shared/schemas";
import { eq, lt } from "drizzle-orm";
<<<<<<< HEAD
import type { Database } from "../../db";

export async function cleanupExpired(db: Database): Promise<void> {
  await db.delete(guestSessions).where(lt(guestSessions.expiresAt, new Date()));
}

export async function create(db: Database, data: { expiresAt: Date }): Promise<GuestSession> {
  const [session] = await db.insert(guestSessions).values(data).returning();
  if (!session) throw new Error("Failed to create guest session");
  return session;
}

export async function remove(db: Database, id: string): Promise<void> {
  await db.delete(guestSessions).where(eq(guestSessions.id, id));
}

export async function findById(db: Database, id: string): Promise<GuestSession | undefined> {
  const [session] = await db.select().from(guestSessions).where(eq(guestSessions.id, id));
  return session;
}
=======
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
>>>>>>> origin/main
