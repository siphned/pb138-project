import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { users, addresses } from '../../db/schema'
import type { NewUser, User, Address, NewAddress } from '../../db/schema'

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

  async updateById(id: string, data: Partial<Pick<User, 'fname' | 'lname' | 'shippingAddressId' | 'billingAddressId'>>): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    return updated!
  },

  async createAddress(data: NewAddress): Promise<Address> {
    const [address] = await db.insert(addresses).values(data).returning()
    return address!
  },

  async findAddressById(id: string): Promise<Address | undefined> {
    return db.query.addresses.findFirst({
      where: eq(addresses.id, id),
    })
  },
}
