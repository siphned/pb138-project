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
}
