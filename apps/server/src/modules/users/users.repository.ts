import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { users } from '../../db/schema'
import type { NewUser, User } from '../../db/schema'

export const usersRepository = {
  findByClerkId(clerkId: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    })
  },

  findById(id: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    })
  },

  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning()
    return user!
  },

  // Idempotent insert: if clerk_id already exists (concurrent first-login race),
  // silently skip and return the existing row instead of throwing a unique violation.
  async upsert(data: NewUser): Promise<User> {
    const [inserted] = await db
      .insert(users)
      .values(data)
      .onConflictDoNothing({ target: users.clerkId })
      .returning()

    if (inserted) return inserted

    // Another concurrent request won the race — fetch what it inserted
    const existing = await db.query.users.findFirst({
      where: eq(users.clerkId, data.clerkId),
    })
    return existing!
  },
}
